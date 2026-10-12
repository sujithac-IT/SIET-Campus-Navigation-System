import { z } from 'zod';

export const AssistantQueryInputSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  rollNo: z.string().optional().default('714022104045'),
  department: z.string().optional().default('CSE'),
  year: z.number().optional().default(3),
  section: z.string().optional().default('A'),
  from: z.string().optional(),
});

export type AssistantQueryInput = z.infer<typeof AssistantQueryInputSchema>;

export interface AssistantAction {
  type: 'start_navigation' | 'view_place' | 'view_timetable' | 'view_exam';
  destination?: {
    id: string;
    name: string;
    code?: string;
    building?: string;
    floorLevel?: number;
    lat?: number;
    lng?: number;
  };
  from?: {
    id: string;
    name: string;
  };
  route?: {
    distance_m: number;
    eta_sec: number;
    stepsCount: number;
    firstStep?: string;
  };
}

export interface AssistantToolCallRecord {
  name: string;
  input: Record<string, any>;
  output: any;
}

export interface AssistantResponseData {
  reply: string;
  action?: AssistantAction;
  toolCalls: AssistantToolCallRecord[];
  source: 'claude_tools' | 'fallback_engine';
}
