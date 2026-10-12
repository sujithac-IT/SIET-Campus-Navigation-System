/**
 * SIET Navigate — Assistant Service
 * Orchestrates Claude Tool-Calling and resilient Local Fallback Intent Engine
 * enforcing <= 2 short speakable sentences and interactive navigation action dispatch.
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../core/config.js';
import { logger } from '../../core/logger.js';
import {
  AssistantQueryInput,
  AssistantResponseData,
  AssistantAction,
  AssistantToolCallRecord,
} from './assistant.schema.js';
import { ASSISTANT_TOOLS, AssistantToolsExecutor } from './assistant.tools.js';

const SYSTEM_PROMPT = `You are the SIET Campus AI Voice Navigator for Sri Shakthi Institute of Engineering and Technology (SIET).
Your job is to provide instant voice directions and campus assistance to students, faculty, and campus visitors.

MANDATORY RULES:
1. ONLY state facts retrieved directly from your tools (search_place, get_route, get_next_class, get_exam_hall). NEVER fabricate places or schedules.
2. MAXIMUM 2 SHORT SENTENCES suitable for spoken audio output (Text-to-Speech). Do not include bullet points, markdown bolding, or lists.
3. If the user asks how to get somewhere, specify the walking distance or ETA and invite them to follow navigation.
4. If a place cannot be found, politely state that in one sentence and offer help.`;

export class AssistantService {
  private anthropicClient: Anthropic | null = null;

  constructor() {
    const key = config.ANTHROPIC_API_KEY;
    if (key && !key.startsWith('mock_') && key !== 'dummy') {
      try {
        this.anthropicClient = new Anthropic({ apiKey: key });
      } catch (err) {
        logger.warn('Failed to initialize Anthropic client, using fallback intent engine:', err);
      }
    }
  }

  public async processQuery(input: AssistantQueryInput): Promise<AssistantResponseData> {
    const { query, rollNo, department, year, section, from } = input;

    // 1. If Anthropic Claude API is configured with real key, attempt tool-calling
    if (this.anthropicClient) {
      try {
        return await this.processWithClaude(query, rollNo, department, year, section, from);
      } catch (err: any) {
        logger.warn(`Claude tool-calling error: ${err.message}. Falling back to local intent engine.`);
      }
    }

    // 2. Intelligent local fallback intent engine
    return this.processWithFallback(query, rollNo, department, year, section, from);
  }

  /**
   * Process query using Claude API with function/tool calling
   */
  private async processWithClaude(
    query: string,
    rollNo?: string,
    department?: string,
    year?: number,
    section?: string,
    from?: string
  ): Promise<AssistantResponseData> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not available');
    }

    const toolCalls: AssistantToolCallRecord[] = [];
    let detectedAction: AssistantAction | undefined;

    // First turn to Claude
    const response = await this.anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `User Question: "${query}"\nUser Context: Roll No: ${rollNo || '714022104045'}, Dept: ${department || 'CSE'}, Year: ${year || 3}, Sec: ${section || 'A'}${from ? `, From: ${from}` : ''}`,
        },
      ],
      tools: ASSISTANT_TOOLS as any,
    });

    // Check if Claude requested tool execution
    const toolUseBlocks = response.content.filter((c: any) => c.type === 'tool_use');

    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find((c: any) => c.type === 'text') as any;
      const rawText = textBlock?.text || 'I could not find information for your request on the campus map.';
      return {
        reply: this.formatSpeakable(rawText),
        toolCalls: [],
        source: 'claude_tools',
      };
    }

    // Execute requested tools
    const toolResultContents: any[] = [];

    for (const toolUse of toolUseBlocks as any[]) {
      const toolName = toolUse.name;
      const toolInput = toolUse.input || {};

      // Inject user context defaults if needed
      if (toolName === 'get_next_class') {
        toolInput.rollNo = toolInput.rollNo || rollNo;
        toolInput.department = toolInput.department || department;
      }
      if (toolName === 'get_exam_hall') {
        toolInput.rollNo = toolInput.rollNo || rollNo;
      }
      if (toolName === 'get_route' && !toolInput.from && from) {
        toolInput.from = from;
      }

      const output = await AssistantToolsExecutor.callTool(toolName, toolInput);
      toolCalls.push({ name: toolName, input: toolInput, output });

      // Detect action from tool output
      if (toolName === 'get_route' && output.success) {
        detectedAction = {
          type: 'start_navigation',
          destination: {
            id: output.to.id,
            name: output.to.name,
            floorLevel: output.to.floorLevel,
            lat: output.to.lat,
            lng: output.to.lng,
          },
          from: { id: output.from.id, name: output.from.name },
          route: {
            distance_m: output.distance_m,
            eta_sec: output.eta_sec,
            stepsCount: output.stepsCount,
            firstStep: output.firstStep,
          },
        };
      } else if (toolName === 'search_place' && output.found && output.places.length > 0) {
        const top = output.places[0]!;
        detectedAction = {
          type: 'start_navigation',
          destination: {
            id: top.id,
            name: top.name,
            code: top.code,
            building: top.building,
            floorLevel: top.floor,
            lat: top.lat,
            lng: top.lng,
          },
        };
      } else if (toolName === 'get_next_class' && output.found) {
        detectedAction = {
          type: 'start_navigation',
          destination: {
            id: output.placeId,
            name: output.placeName,
            building: output.buildingName,
            floorLevel: output.floorLevel,
          },
        };
      } else if (toolName === 'get_exam_hall' && output.found) {
        detectedAction = {
          type: 'start_navigation',
          destination: {
            id: output.placeId,
            name: output.placeName,
            building: output.buildingName,
            floorLevel: output.floorLevel,
          },
        };
      }

      toolResultContents.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(output),
      });
    }

    // Second turn: supply tool results to Claude for final speakable formulation
    const secondResponse = await this.anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 250,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `User Question: "${query}"`,
        },
        {
          role: 'assistant',
          content: response.content,
        },
        {
          role: 'user',
          content: toolResultContents,
        },
      ],
      tools: ASSISTANT_TOOLS as any,
    });

    const finalText = (secondResponse.content.find((c: any) => c.type === 'text') as any)?.text || '';

    return {
      reply: this.formatSpeakable(finalText),
      action: detectedAction,
      toolCalls,
      source: 'claude_tools',
    };
  }

  /**
   * Resilient local fallback intent engine for offline / unkeyed environments
   */
  private async processWithFallback(
    query: string,
    rollNo = '714022104045',
    department = 'CSE',
    year = 3,
    section = 'A',
    from = 'p-gate-1'
  ): Promise<AssistantResponseData> {
    const q = query.toLowerCase().trim();
    const toolCalls: AssistantToolCallRecord[] = [];
    let reply = '';
    let action: AssistantAction | undefined;

    // 1. Timetable / Next class intent
    if (
      q.includes('next class') ||
      q.includes('timetable') ||
      q.includes('class') ||
      q.includes('schedule') ||
      q.includes('lecture') ||
      q.includes('period')
    ) {
      const classData = await AssistantToolsExecutor.executeGetNextClass(rollNo, department, year, section);
      toolCalls.push({
        name: 'get_next_class',
        input: { rollNo, department, year, section },
        output: classData,
      });

      if (classData.found) {
        reply = `Your next class is ${classData.subjectName} in ${classData.placeName} at ${classData.startTime}. Starting navigation to your classroom.`;
        action = {
          type: 'start_navigation',
          destination: {
            id: classData.placeId,
            name: classData.placeName,
            building: classData.buildingName,
            floorLevel: classData.floorLevel,
          },
        };
      } else {
        reply = `You have no scheduled classes right now for ${department} Year ${year}.`;
      }

      return { reply: this.formatSpeakable(reply), action, toolCalls, source: 'fallback_engine' };
    }

    // 2. Exam Hall intent
    if (
      q.includes('exam') ||
      q.includes('exam hall') ||
      q.includes('seat') ||
      q.includes('internal test') ||
      q.includes('test hall')
    ) {
      const examData = await AssistantToolsExecutor.executeGetExamHall(rollNo);
      toolCalls.push({
        name: 'get_exam_hall',
        input: { rollNo },
        output: examData,
      });

      if (examData.found) {
        reply = `Your exam for ${examData.examName.split('-')[1]?.trim() || examData.examName} is in ${examData.placeName}, Floor ${examData.floorLevel} at seat ${examData.seatNumber}. Navigation is ready.`;
        action = {
          type: 'start_navigation',
          destination: {
            id: examData.placeId,
            name: examData.placeName,
            building: examData.buildingName,
            floorLevel: examData.floorLevel,
          },
        };
      } else {
        reply = `No exam allocation was found for roll number ${rollNo}.`;
      }

      return { reply: this.formatSpeakable(reply), action, toolCalls, source: 'fallback_engine' };
    }

    // 3. Navigation / Direction / Location intent
    let cleanQuery = q
      .replace(/^(how to get to|how do i get to|take me to|directions to|route to|navigate to|where is|where are|find|show me)\s+/i, '')
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/[?!.]/g, '')
      .trim();

    // Remove filler stop words if still long
    if (cleanQuery.startsWith('the ')) {
      cleanQuery = cleanQuery.replace(/^the\s+/i, '').trim();
    }

    const searchKeyword = cleanQuery || query;
    const searchResult = await AssistantToolsExecutor.executeSearchPlace(searchKeyword);
    toolCalls.push({
      name: 'search_place',
      input: { query: searchKeyword },
      output: searchResult,
    });

    if (searchResult.found && searchResult.places.length > 0) {
      const target = searchResult.places[0]!;

      // Calculate route from origin
      const routeResult = await AssistantToolsExecutor.executeGetRoute(from, target.id);
      toolCalls.push({
        name: 'get_route',
        input: { from, to: target.id },
        output: routeResult,
      });

      if (routeResult.success) {
        const mins = Math.ceil(routeResult.eta_sec / 60);
        reply = `${target.name} is ${routeResult.distance_m} meters away in ${target.building}, taking about ${mins} minute${mins > 1 ? 's' : ''} to walk. Follow the turn-by-turn guidance on your screen.`;
        action = {
          type: 'start_navigation',
          destination: {
            id: target.id,
            name: target.name,
            code: target.code,
            building: target.building,
            floorLevel: target.floor,
            lat: target.lat,
            lng: target.lng,
          },
          from: { id: routeResult.from.id, name: routeResult.from.name },
          route: {
            distance_m: routeResult.distance_m,
            eta_sec: routeResult.eta_sec,
            stepsCount: routeResult.stepsCount,
            firstStep: routeResult.firstStep,
          },
        };
      } else {
        reply = `${target.name} is located in ${target.building} on Floor ${target.floor}. Click navigate to view the path.`;
        action = {
          type: 'start_navigation',
          destination: {
            id: target.id,
            name: target.name,
            code: target.code,
            building: target.building,
            floorLevel: target.floor,
            lat: target.lat,
            lng: target.lng,
          },
        };
      }
    } else {
      reply = `I could not locate "${query}" on campus. Try searching for Library, Canteen, Tech Park, or your classroom code.`;
    }

    return {
      reply: this.formatSpeakable(reply),
      action,
      toolCalls,
      source: 'fallback_engine',
    };
  }

  /**
   * Enforce max 2 short speakable sentences, strip markdown formatting
   */
  private formatSpeakable(text: string): string {
    const clean = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Split sentences by period/exclamation/question mark
    const sentences = clean
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    if (sentences.length <= 2) {
      return clean;
    }

    return `${sentences[0]} ${sentences[1]}`.trim();
  }
}

export const assistantService = new AssistantService();
