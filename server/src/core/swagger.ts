import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SIET Campus Navigation System API',
    version: '1.0.0',
    description:
      'Production-quality OpenAPI documentation for SIET Smart Campus Navigation backend services, supporting indoor/outdoor navigation, classroom shifts, real-time alerts, and academic schedules.',
    contact: {
      name: 'SIET Engineering Support',
      email: 'admin@siet.ac.in',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your 15-minute access token obtained from /api/v1/auth/login',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Resource not found' },
              statusCode: { type: 'integer', example: 404 },
              details: { type: 'object' },
            },
          },
        },
      },
      UserSanitized: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Aravind Swaminathan' },
          email: { type: 'string', example: 'aravind.siet@siet.ac.in' },
          role: { type: 'string', enum: ['ADMIN', 'FACULTY', 'STUDENT'], example: 'STUDENT' },
          departmentId: { type: 'string', nullable: true },
          year: { type: 'integer', example: 3, nullable: true },
          section: { type: 'string', example: 'A', nullable: true },
          rollNo: { type: 'string', example: '714021104012', nullable: true },
        },
      },
      Place: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Lecture Hall 05' },
          code: { type: 'string', example: 'LH-05' },
          type: {
            type: 'string',
            enum: [
              'CLASSROOM',
              'LAB',
              'TECHPARK',
              'OFFICE',
              'LIBRARY',
              'WASHROOM',
              'CANTEEN',
              'FOOD_COURT',
              'HOSTEL_BOYS',
              'HOSTEL_GIRLS',
              'GATE',
              'PARKING',
            ],
            example: 'CLASSROOM',
          },
          lat: { type: 'number', example: 11.0832 },
          lng: { type: 'number', example: 77.0611 },
          buildingId: { type: 'string', nullable: true },
          floorId: { type: 'string', nullable: true },
          nodeId: { type: 'string', nullable: true },
          aliases: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      Building: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Tech Park & Innovation Hub' },
          code: { type: 'string', example: 'TECH' },
          centerLat: { type: 'number', example: 11.0839 },
          centerLng: { type: 'number', example: 77.0613 },
          footprint: { type: 'object' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Server is healthy',
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Kavya Dharshini' },
                  email: { type: 'string', example: 'kavya.siet@siet.ac.in' },
                  password: { type: 'string', example: 'Password@2026' },
                  role: { type: 'string', enum: ['ADMIN', 'FACULTY', 'STUDENT'], default: 'STUDENT' },
                  rollNo: { type: 'string', example: '714021104025' },
                  year: { type: 'integer', example: 3 },
                  section: { type: 'string', example: 'A' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Registration successful' },
          '400': { description: 'Validation failed' },
          '409': { description: 'Email or Roll No already registered' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Log into system using email or roll number',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', example: 'aravind.siet@siet.ac.in' },
                  password: { type: 'string', example: 'Siet@2026Nav!' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        summary: 'Refresh access token using refresh token cookie or payload',
        tags: ['Authentication'],
        responses: {
          '200': { description: 'New access token issued' },
          '401': { description: 'Invalid refresh token' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'User profile returned' },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Log out and invalidate session cookies',
        tags: ['Authentication'],
        responses: {
          '200': { description: 'Logged out successfully' },
        },
      },
    },
    '/api/v1/places/search': {
      get: {
        summary: 'Search campus places with fuzzy and alias matching',
        tags: ['Places'],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Query string (e.g. "tech", "LH", "canteen")' },
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Category filter (e.g. CLASSROOM, LAB, CANTEEN)' },
          { name: 'buildingId', in: 'query', schema: { type: 'string' }, description: 'Filter places by building' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Maximum items to return' },
        ],
        responses: {
          '200': { description: 'Matched places array returned' },
        },
      },
    },
    '/api/v1/places/categories': {
      get: {
        summary: 'Get list of place categories with counts',
        tags: ['Places'],
        responses: {
          '200': { description: 'Categories with counts returned' },
        },
      },
    },
    '/api/v1/places/{id}': {
      get: {
        summary: 'Get details of a place by UUID or unique code',
        tags: ['Places'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Place UUID or Code (e.g. "LH-05", "GATE-01")' },
        ],
        responses: {
          '200': { description: 'Place details returned' },
          '404': { description: 'Place not found' },
        },
      },
    },
    '/api/v1/buildings': {
      get: {
        summary: 'List all campus buildings with center coordinates and floors',
        tags: ['Buildings'],
        responses: {
          '200': { description: 'Campus buildings list returned' },
        },
      },
    },
    '/api/v1/buildings/{id}': {
      get: {
        summary: 'Get single building by ID or code',
        tags: ['Buildings'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Building UUID or Code (e.g. "ACAD", "TECH")' },
        ],
        responses: {
          '200': { description: 'Building details returned' },
          '404': { description: 'Building not found' },
        },
      },
    },
    '/api/v1/buildings/{id}/floors/{level}/rooms': {
      get: {
        summary: 'Get rooms and plan parameters for a specific floor in a building',
        tags: ['Buildings'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Building UUID or Code (e.g. "TECH")' },
          { name: 'level', in: 'path', required: true, schema: { type: 'integer' }, description: 'Floor level (0 for Ground, 1 for 1st floor, etc.)' },
        ],
        responses: {
          '200': { description: 'Rooms on this floor returned' },
          '404': { description: 'Building or floor level not found' },
        },
      },
    },
    '/api/v1/route': {
      post: {
        summary: 'Compute optimal 3D turn-by-turn route between campus waypoints',
        tags: ['Routing'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['from', 'to'],
                properties: {
                  from: { type: 'string', example: 'GATE-01', description: 'Origin place code, node ID, or "lat,lng"' },
                  to: { type: 'string', example: 'LH-05', description: 'Destination place code, room name, or node ID' },
                  accessible: { type: 'boolean', default: false, description: 'Prioritize wheelchair-accessible paths (ramps/elevators, no stairs)' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Route calculated successfully with distance, ETA, polyline, and turn-by-turn steps',
          },
          '400': { description: 'Validation failed' },
          '404': { description: 'Origin, destination, or walkable path not found' },
        },
      },
    },
    '/route': {
      post: {
        summary: 'Alias endpoint for POST /api/v1/route',
        tags: ['Routing'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['from', 'to'],
                properties: {
                  from: { type: 'string', example: 'GATE-01' },
                  to: { type: 'string', example: 'TECH-AI-LAB' },
                  accessible: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Route calculated successfully' },
        },
      },
    },
    '/api/v1/timetable/me': {
      get: {
        summary: 'Get weekly timetable for authenticated student or faculty',
        tags: ['Timetable'],
        responses: {
          '200': { description: 'Timetable slots with active changes' },
        },
      },
    },
    '/api/v1/timetable/changes': {
      get: {
        summary: 'Get list of active classroom relocation changes',
        tags: ['Timetable'],
        responses: {
          '200': { description: 'Active timetable changes' },
        },
      },
      post: {
        summary: 'Relocate classroom and broadcast real-time alert',
        tags: ['Timetable'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['slotId', 'newPlaceId', 'reason'],
                properties: {
                  slotId: { type: 'string', example: 'slot-cse-mon-1' },
                  newPlaceId: { type: 'string', example: 'p-tech-lab3' },
                  reason: { type: 'string', example: 'Project Demo & Lab Equipment Setup' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Classroom relocated and broadcast emitted' },
        },
      },
    },
    '/api/v1/exams/my-hall': {
      get: {
        summary: 'Lookup student exam hall allocation by roll number',
        tags: ['Exams'],
        parameters: [
          {
            name: 'rollNo',
            in: 'query',
            schema: { type: 'string', example: '714021104012' },
            description: 'Student Anna University Register / Roll Number',
          },
        ],
        responses: {
          '200': { description: 'Exam hall allocation details' },
        },
      },
    },
    '/api/v1/exams/hall-changes': {
      post: {
        summary: 'Shift exam hall and trigger real-time alert to students',
        tags: ['Exams'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['examHallId', 'newPlaceId', 'reason'],
                properties: {
                  examHallId: { type: 'string', example: 'hall-cs-lh01' },
                  newPlaceId: { type: 'string', example: 'p-tech-lab3' },
                  reason: { type: 'string', example: 'Air Conditioning maintenance' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Exam hall shifted and alerts sent' },
        },
      },
    },
    '/api/v1/notifications': {
      get: {
        summary: 'Retrieve user notification center alerts',
        tags: ['Notifications'],
        responses: {
          '200': { description: 'List of alerts and unread count' },
        },
      },
    },
    '/api/v1/devices/register': {
      post: {
        summary: 'Register FCM device token for background push alerts',
        tags: ['Notifications'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fcmToken'],
                properties: {
                  fcmToken: { type: 'string', example: 'fcm-sample-token-abc123xyz' },
                  platform: { type: 'string', enum: ['web', 'android', 'ios'], default: 'web' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Device token registered' },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
  });
}
