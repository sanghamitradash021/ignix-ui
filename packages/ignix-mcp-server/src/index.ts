#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

import { createProjectTool } from './tools/create-project.js';
import { listComponentsTool } from './tools/list-components.js';
import { addComponentTool } from './tools/add-component.js';
import { generateTemplateTool } from './tools/generate-template.js';
import { validateIgnixOnlyTool } from './tools/validate-ignix-only.js';
import { getComponentDocsTool } from './tools/get-component-docs.js';
import { IGNIX_RULES } from './resources/ignix-rules.js';
import { DOCS_CONTENT } from './resources/docs-content.js';
import { getRegistrySummary } from './resources/registry-summary.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface ToolExecution {
  type: 'shell';
  command: string;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execution?: ToolExecution;
}

interface MCPResource {
  name: string;
  uri: string;
  description?: string;
}

interface MCPConfig {
  name?: string;
  version?: string;
  tools?: MCPTool[];
  resources?: MCPResource[];
}

interface AuditLog {
  timestamp: string;
  tool: string;
  args: Record<string, unknown>;
  success: boolean;
  duration: number;
  requestId?: string;
}

// Rate limiting
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

function checkRateLimit(toolName: string): boolean {
  const now = Date.now();
  const timestamps = rateLimits.get(toolName) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (validTimestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }

  validTimestamps.push(now);
  rateLimits.set(toolName, validTimestamps);
  return true;
}

function logAudit(log: AuditLog): void {
  console.error(
    JSON.stringify({
      level: 'audit',
      ...log,
    })
  );
}

async function runCommand(
  command: string,
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  try {
    console.error(`🔧 Executing: ${command}`);
    const result = await execAsync(command, {
      cwd,
      env: { ...process.env, PATH: process.env.PATH },
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      maxBuffer: 10 * 1024 * 1024,
    });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Command failed: ${errorMessage}`);
    throw error;
  }
}

// Load MCP config
const configPath = path.resolve(__dirname, '../mcp.json');
let MCP_CONFIG: MCPConfig;

try {
  const configContent = await fs.readFile(configPath, 'utf-8');
  MCP_CONFIG = JSON.parse(configContent);
} catch (err) {
  console.error('❌ Failed to load mcp.json:', err);
  process.exit(1);
}

const tools: MCPTool[] = MCP_CONFIG.tools ?? [];
const resources: MCPResource[] = MCP_CONFIG.resources ?? [];

// Create MCP Server
const server = new Server(
  {
    name: MCP_CONFIG.name || 'ignix-ui',
    version: MCP_CONFIG.version || '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List Tools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('\n📋 MCP: ListToolsRequest received');

  const toolList = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema || { type: 'object', properties: {} },
  }));

  console.error(`   Returning ${toolList.length} tools:`);
  toolList.forEach((t) => console.error(`   - ${t.name}`));
  console.error('');

  return { tools: toolList };
});

// Call Tool Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const startTime = Date.now();
  const { name, arguments: args } = request.params;

  console.error(`\n🛠️ MCP: CallToolRequest received for "${name}"`);

  // Rate limiting check
  if (!checkRateLimit(name)) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Rate limit exceeded. Please wait before making more requests.',
              classification: 'RATE_LIMIT_EXCEEDED',
              action: 'Wait 60 seconds before trying again.',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const tool = tools.find((t) => t.name === name);

  if (!tool) {
    logAudit({
      timestamp: new Date().toISOString(),
      tool: name,
      args: args || {},
      success: false,
      duration: Date.now() - startTime,
    });

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: `Unknown tool: ${name}`,
              classification: 'UNKNOWN_TOOL',
              action: 'Use list_tools to see available tools.',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  try {
    let result: any;

    // Handle specific tools with custom logic
    switch (name) {
      case 'create_react_project':
        result = await createProjectTool(args);
        break;
      case 'list_components':
        result = await listComponentsTool(args);
        break;
      case 'add_component':
        result = await addComponentTool(args);
        break;
      case 'generate_template':
        result = await generateTemplateTool(args);
        break;
      case 'validate_ignix_only':
        result = await validateIgnixOnlyTool(args);
        break;
      case 'get_component_docs':
        result = await getComponentDocsTool(args);
        break;
      default:
        result = await handleGenericTool(tool, args);
    }

    logAudit({
      timestamp: new Date().toISOString(),
      tool: name,
      args: args || {},
      success: !result.isError,
      duration: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    logAudit({
      timestamp: new Date().toISOString(),
      tool: name,
      args: args || {},
      success: false,
      duration: Date.now() - startTime,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
              classification: 'TOOL_EXECUTION_ERROR',
              action: 'Check the error message and try again.',
            },
            null,
            2
          ),
        },
      ],
    };
  }
});

async function handleGenericTool(tool: MCPTool, args: any) {
  if (!tool.execution?.command) {
    throw new Error(`Tool "${tool.name}" has no execution command`);
  }

  let command = tool.execution.command;

  // Replace placeholders in command
  for (const [key, value] of Object.entries(args || {})) {
    if (typeof value === 'string' || typeof value === 'number') {
      command = command.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    } else if (Array.isArray(value)) {
      command = command.replace(new RegExp(`\\{${key}\\}`, 'g'), value.join(' '));
    }
  }

  const { stdout, stderr } = await runCommand(command, args?.cwd);

  try {
    const parsed = JSON.parse(stdout);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(parsed, null, 2),
        },
      ],
    };
  } catch {
    return {
      content: [
        {
          type: 'text',
          text: stdout || stderr || 'Command executed successfully',
        },
      ],
    };
  }
}

// List Resources Handler (ONLY ONE - REMOVED DUPLICATE)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.error('\n📚 MCP: ListResourcesRequest received');

  const resourceList = resources.map((r) => ({
    name: r.name,
    uri: r.uri,
    description: r.description,
  }));

  console.error(`   Returning ${resourceList.length} resources:`);
  resourceList.forEach((r) => console.error(`   - ${r.name} (${r.uri})`));
  console.error('');

  return { resources: resourceList };
});

// Read Resource Handler
// Read Resource Handler
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  console.error(`📖 MCP: ReadResourceRequest for ${uri}`);

  // Handle ignix-rules resource - EXTREMELY EXPLICIT WITH EXAMPLES
  if (uri === 'resources://ignix-rules') {
    return {
      contents: [
        {
          uri: uri,
          mimeType: 'text/markdown',
          text: IGNIX_RULES,
        },
      ],
    };
  }

  // Rest of your existing handlers...
  if (uri === 'docs://llms.txt') {
    return {
      contents: [
        {
          uri: uri,
          mimeType: 'text/plain',
          text: DOCS_CONTENT,
        },
      ],
    };
  }

  // Handle component registry summary
  if (uri === 'registry://summary') {
    const summary = await getRegistrySummary();
    return {
      contents: [
        {
          uri: uri,
          mimeType: 'application/json',
          text: JSON.stringify(summary, null, 2),
        },
      ],
    };
  }

  // Default response for unknown resources
  return {
    contents: [
      {
        uri: uri,
        mimeType: 'text/plain',
        text: `Resource "${uri}" is available. Use the appropriate MCP tool to access its content.`,
      },
    ],
  };
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('\n🚀 Ignix MCP server running');
console.error(`📦 Available tools (${tools.length}):`);
tools.forEach((t) => console.error(`   - ${t.name}`));
console.error(`📚 Available resources (${resources.length}):`);
resources.forEach((r) => console.error(`   - ${r.name} (${r.uri})`));
console.error('');

// #!/usr/bin/env node

// import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// import {
//   CallToolRequestSchema,
//   ListToolsRequestSchema,
//   ListResourcesRequestSchema,
//   ReadResourceRequestSchema,
// } from '@modelcontextprotocol/sdk/types.js';
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import fs from 'fs-extra';
// import path from 'path';
// import { fileURLToPath } from 'url';

// import { createProjectTool } from './tools/create-project.js';
// import { listComponentsTool } from './tools/list-components.js';
// import { addComponentTool } from './tools/add-component.js';
// import { generateTemplateTool } from './tools/generate-template.js';
// import { validateIgnixOnlyTool } from './tools/validate-ignix-only.js';
// import { getComponentDocsTool } from './tools/get-component-docs.js';
// // import { initProjectTool } from './tools/init-project.js';
// // import { IGNIX_RULES } from './resources/ignix-rules.js';

// const execAsync = promisify(exec);

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Types
// interface ToolExecution {
//   type: 'shell';
//   command: string;
// }

// interface MCPTool {
//   name: string;
//   description: string;
//   inputSchema?: Record<string, unknown>;
//   execution?: ToolExecution;
// }

// interface MCPResource {
//   name: string;
//   uri: string;
//   description?: string;
// }

// interface MCPConfig {
//   name?: string;
//   version?: string;
//   tools?: MCPTool[];
//   resources?: MCPResource[];
// }

// interface AuditLog {
//   timestamp: string;
//   tool: string;
//   args: Record<string, unknown>;
//   success: boolean;
//   duration: number;
//   requestId?: string;
// }

// // interface Component {
// //   name: string;
// //   description: string;
// //   type?: string;
// //   id?: string;
// //   category?: string;
// // }

// // interface Theme {
// //   id: string;
// //   name: string;
// //   description: string;
// // }

// // Rate limiting
// const rateLimits = new Map<string, number[]>();
// const RATE_LIMIT_WINDOW = 60000; // 1 minute
// const RATE_LIMIT_MAX = 30; // 30 requests per minute

// function checkRateLimit(toolName: string): boolean {
//   const now = Date.now();
//   const timestamps = rateLimits.get(toolName) || [];
//   const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

//   if (validTimestamps.length >= RATE_LIMIT_MAX) {
//     return false;
//   }

//   validTimestamps.push(now);
//   rateLimits.set(toolName, validTimestamps);
//   return true;
// }

// function logAudit(log: AuditLog): void {
//   console.error(
//     JSON.stringify({
//       level: 'audit',
//       ...log,
//     })
//   );
// }

// // function estimateTokenCount(obj: any): number {
// //   const str = JSON.stringify(obj);
// //   return Math.ceil(str.length / 4);
// // }

// // async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
// //   try {
// //     const files = await fs.readdir(dirPath);
// //     const filtered = files.filter((f) => !f.startsWith('.') && f !== 'node_modules');
// //     return filtered.length === 0;
// //   } catch {
// //     return true;
// //   }
// // }

// async function runCommand(
//   command: string,
//   cwd?: string
// ): Promise<{ stdout: string; stderr: string }> {
//   try {
//     console.error(`🔧 Executing: ${command}`);
//     const result = await execAsync(command, {
//       cwd,
//       env: { ...process.env, PATH: process.env.PATH },
//       shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
//       maxBuffer: 10 * 1024 * 1024,
//     });
//     return result;
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     console.error(`❌ Command failed: ${errorMessage}`);
//     throw error;
//   }
// }

// // Load MCP config
// const configPath = path.resolve(__dirname, '../mcp.json');
// let MCP_CONFIG: MCPConfig;

// try {
//   const configContent = await fs.readFile(configPath, 'utf-8');
//   MCP_CONFIG = JSON.parse(configContent);
// } catch (err) {
//   console.error('❌ Failed to load mcp.json:', err);
//   process.exit(1);
// }

// const tools: MCPTool[] = MCP_CONFIG.tools ?? [];
// const resources: MCPResource[] = MCP_CONFIG.resources ?? [];

// // Create MCP Server
// const server = new Server(
//   {
//     name: MCP_CONFIG.name || 'ignix-ui',
//     version: MCP_CONFIG.version || '1.0.0',
//   },
//   {
//     capabilities: {
//       tools: {},
//       resources: {},
//     },
//   }
// );

// // List Tools Handler
// server.setRequestHandler(ListToolsRequestSchema, async () => {
//   console.error('\n📋 MCP: ListToolsRequest received');

//   const toolList = tools.map((tool) => ({
//     name: tool.name,
//     description: tool.description,
//     inputSchema: tool.inputSchema || { type: 'object', properties: {} },
//   }));

//   console.error(`   Returning ${toolList.length} tools:`);
//   toolList.forEach((t) => console.error(`   - ${t.name}`));
//   console.error('');

//   return { tools: toolList };
// });

// // Call Tool Handler
// server.setRequestHandler(CallToolRequestSchema, async (request) => {
//   const startTime = Date.now();
//   const { name, arguments: args } = request.params;

//   console.error(`\n🛠️ MCP: CallToolRequest received for "${name}"`);

//   // Rate limiting check
//   if (!checkRateLimit(name)) {
//     return {
//       isError: true,
//       content: [
//         {
//           type: 'text',
//           text: JSON.stringify(
//             {
//               success: false,
//               error: 'Rate limit exceeded. Please wait before making more requests.',
//               classification: 'RATE_LIMIT_EXCEEDED',
//               action: 'Wait 60 seconds before trying again.',
//             },
//             null,
//             2
//           ),
//         },
//       ],
//     };
//   }

//   const tool = tools.find((t) => t.name === name);

//   if (!tool) {
//     logAudit({
//       timestamp: new Date().toISOString(),
//       tool: name,
//       args: args || {},
//       success: false,
//       duration: Date.now() - startTime,
//     });

//     return {
//       isError: true,
//       content: [
//         {
//           type: 'text',
//           text: JSON.stringify(
//             {
//               success: false,
//               error: `Unknown tool: ${name}`,
//               classification: 'UNKNOWN_TOOL',
//               action: 'Use list_tools to see available tools.',
//             },
//             null,
//             2
//           ),
//         },
//       ],
//     };
//   }

//   try {
//     let result: any;

//     // Handle specific tools with custom logic
//     switch (name) {
//       case 'create_react_project':
//         result = await createProjectTool(args);
//         break;
//       case 'list_components':
//         result = await listComponentsTool(args);
//         break;
//       case 'add_component':
//         result = await addComponentTool(args);
//         break;
//       case 'generate_template':
//         result = await generateTemplateTool(args);
//         break;
//       case 'validate_ignix_only':
//         result = await validateIgnixOnlyTool(args);
//         break;
//       case 'get_component_docs':
//         result = await getComponentDocsTool(args);
//         break;
//       // case 'init_project':
//       //   result = await initProjectTool(args);
//       //   break;
//       default:
//         result = await handleGenericTool(tool, args);
//     }

//     logAudit({
//       timestamp: new Date().toISOString(),
//       tool: name,
//       args: args || {},
//       success: !result.isError,
//       duration: Date.now() - startTime,
//     });

//     return result;
//   } catch (error) {
//     logAudit({
//       timestamp: new Date().toISOString(),
//       tool: name,
//       args: args || {},
//       success: false,
//       duration: Date.now() - startTime,
//     });
//     const errorMessage = error instanceof Error ? error.message : String(error);

//     return {
//       isError: true,
//       content: [
//         {
//           type: 'text',
//           text: JSON.stringify(
//             {
//               success: false,
//               error: errorMessage,
//               classification: 'TOOL_EXECUTION_ERROR',
//               action: 'Check the error message and try again.',
//             },
//             null,
//             2
//           ),
//         },
//       ],
//     };
//   }
// });

// async function handleGenericTool(tool: MCPTool, args: any) {
//   if (!tool.execution?.command) {
//     throw new Error(`Tool "${tool.name}" has no execution command`);
//   }

//   let command = tool.execution.command;

//   // Replace placeholders in command
//   for (const [key, value] of Object.entries(args || {})) {
//     if (typeof value === 'string' || typeof value === 'number') {
//       command = command.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
//     } else if (Array.isArray(value)) {
//       command = command.replace(new RegExp(`\\{${key}\\}`, 'g'), value.join(' '));
//     }
//   }

//   const { stdout, stderr } = await runCommand(command, args?.cwd);

//   try {
//     const parsed = JSON.parse(stdout);
//     return {
//       content: [
//         {
//           type: 'text',
//           text: JSON.stringify(parsed, null, 2),
//         },
//       ],
//     };
//   } catch {
//     return {
//       content: [
//         {
//           type: 'text',
//           text: stdout || stderr || 'Command executed successfully',
//         },
//       ],
//     };
//   }
// }

// // List Resources Handler
// server.setRequestHandler(ListResourcesRequestSchema, async () => {
//   console.error('\n📚 MCP: ListResourcesRequest received');

//   const resourceList = resources.map((r) => ({
//     name: r.name,
//     uri: r.uri,
//     description: r.description,
//   }));

//   console.error(`   Returning ${resourceList.length} resources`);
//   console.error('');

//   return { resources: resourceList };
// });

// // ========== ADD THIS NEW HANDLER ==========
// // Read Resource Handler - serves the actual content of resources
// server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
//   const uri = request.params.uri;
//   console.error(`📖 MCP: ReadResourceRequest for ${uri}`);

//   // Handle ignix-rules resource
//   if (uri === 'resources://ignix-rules') {
//     const rulesContent = `# Ignix UI MCP Server - Complete Workflow Rules

// ## THREE SCENARIOS - DETECT AND ACT

// ### SCENARIO 1: Empty Folder (No package.json, no React project)
// **User says:** "Create a landing page" or "Build a dashboard"

// **You MUST do this EXACT sequence:**
// 1. Call \`create_react_project({ projectName: "user-requested-name" })\`
// 2. Get \`projectPath\` from the response
// 3. Call \`add_component({ components: ["navbar", "button", "card", "hero"], cwd: projectPath })\`
// 4. Call \`generate_template({ page: "home", cwd: projectPath })\`
// 5. Generate React component code using installed components
// 6. Tell user: \`cd {projectPath} && npm run dev\`

// ### SCENARIO 2: React Project Exists, No ignix.config.js
// **User says:** "Add a button" or "Create a login page"

// **You MUST do this EXACT sequence:**
// 1. Call \`add_component({ components: ["button", "input", "card"], cwd: "." })\` - This auto-initializes Ignix
// 2. Call \`generate_template({ page: "login", cwd: "." })\`
// 3. Generate React component code

// ### SCENARIO 3: React Project with ignix.config.js Already Exists
// **User says:** "Add a card component" or "Create a dashboard"

// **You MUST do this EXACT sequence:**
// 1. Call \`list_components({ page: 1 })\` to discover available components
// 2. Call \`add_component({ components: ["requested-component"], cwd: "." })\`
// 3. Call \`generate_template({ page: "dashboard", cwd: "." })\`
// 4. Generate React component code

// ## CRITICAL RULES
// ✅ ALWAYS use the MCP tools - NEVER create files manually
// ✅ ALWAYS use cwd parameter for all calls
// ✅ ALWAYS pass components as an array to add_component
// ✅ ALWAYS generate React/TypeScript code with Tailwind CSS
// ✅ ALWAYS use projectPath from create_react_project for subsequent calls

// ## FORBIDDEN ACTIONS
// ❌ NEVER use shadcn, MUI, Chakra, Ant Design components
// ❌ NEVER create HTML/CSS files manually
// ❌ NEVER write vanilla JavaScript
// ❌ NEVER use shell commands directly
// ❌ NEVER assume components exist without checking list_components

// ## AVAILABLE COMPONENTS (Partial List)
// - button, card, navbar, sidebar, modal, dropdown
// - input, textarea, checkbox, radio, switch
// - table, pagination, tabs, accordion, carousel
// - avatar, badge, tooltip, spinner, toast
// - typography, container, stack, grid
// - hero, pricing, testimonial, team profiles

// Use \`list_components\` to see all available components with descriptions.
// `;

//     return {
//       contents: [
//         {
//           uri: uri,
//           mimeType: 'text/markdown',
//           text: rulesContent,
//         },
//       ],
//     };
//   }

//   // Handle documentation resource (file:// path)
//   if (uri === 'docs://llms.txt') {
//     try {
//       // Try multiple possible paths for llms.txt
//       const possiblePaths = [
//         path.resolve(__dirname, '../../../llms.txt'), // root
//         path.resolve(__dirname, '../../llms.txt'), // up one level
//         path.resolve(process.cwd(), 'llms.txt'), // current working directory
//       ];

//       let llmsContent = null;
//       for (const llmsPath of possiblePaths) {
//         if (await fs.pathExists(llmsPath)) {
//           llmsContent = await fs.readFile(llmsPath, 'utf-8');
//           break;
//         }
//       }

//       if (llmsContent) {
//         return {
//           contents: [
//             {
//               uri: uri,
//               mimeType: 'text/plain',
//               text: llmsContent,
//             },
//           ],
//         };
//       } else {
//         // Return a helpful message instead of error
//         return {
//           contents: [
//             {
//               uri: uri,
//               mimeType: 'text/plain',
//               text:
//                 '# Ignix UI Documentation\n\nFor complete documentation, visit: https://mindfiredigital.github.io/ignix-ui/\n\n## Quick Reference\n- Use list_components to see available components\n- Use add_component to install components\n- Use generate_template to create pages\n- Use validate_ignix_only to ensure only Ignix components are used',
//             },
//           ],
//         };
//       }
//     } catch (error) {
//       return {
//         contents: [
//           {
//             uri: uri,
//             mimeType: 'text/plain',
//             text:
//               'Documentation content not available. Visit https://mindfiredigital.github.io/ignix-ui/ for documentation.',
//           },
//         ],
//       };
//     }
//   }

//   // Handle component registry resource
//   if (uri === 'registry://summary') {
//     try {
//       const registryPath = path.resolve(__dirname, '../../../packages/registry/registry.json');
//       if (await fs.pathExists(registryPath)) {
//         const registryContent = await fs.readFile(registryPath, 'utf-8');
//         // Return a summary to avoid token overload
//         const registry = JSON.parse(registryContent);
//         const summary = {
//           totalComponents: Object.keys(registry.components).length,
//           componentNames: Object.keys(registry.components).slice(0, 50),
//           note: 'Use list_components tool to get paginated results with details',
//         };
//         return {
//           contents: [
//             {
//               uri: uri,
//               mimeType: 'application/json',
//               text: JSON.stringify(summary, null, 2),
//             },
//           ],
//         };
//       }
//     } catch (error) {
//       // Fall through to default
//     }

//     return {
//       contents: [
//         {
//           uri: uri,
//           mimeType: 'application/json',
//           text: JSON.stringify({ note: 'Use list_components tool to browse components' }, null, 2),
//         },
//       ],
//     };
//   }

//   // Default response for unknown resources
//   return {
//     contents: [
//       {
//         uri: uri,
//         mimeType: 'text/plain',
//         text: `Resource "${uri}" is available. Use the appropriate MCP tool to access its content.`,
//       },
//     ],
//   };
// });

// // Start the server
// const transport = new StdioServerTransport();
// await server.connect(transport);

// console.error('\n🚀 Ignix MCP server running');
// console.error(`📦 Available tools (${tools.length}):`);
// tools.forEach((t) => console.error(`   - ${t.name}`));
// console.error(`📚 Available resources (${resources.length}):`);
// resources.forEach((r) => console.error(`   - ${r.name}`));
// console.error('');
