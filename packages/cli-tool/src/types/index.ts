export interface MCPServerConfig {
  command: string;
  args: string[];
}

export interface CursorClaudeConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export interface VSCodeConfig {
  servers: Record<string, MCPServerConfig>;
}

// Add this flexible config type
export type MCPClientConfig = Partial<CursorClaudeConfig & VSCodeConfig>;

export interface PackageJson {
  name?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface NpmRegistryResponse {
  version: string;
}

export interface MCPServerConfig {
  command: string;
  args: string[];
}

export interface CursorClaudeConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export interface VSCodeConfig {
  servers: Record<string, MCPServerConfig>;
}

export interface PackageJson {
  name?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface ClientStatus {
  name: string;
  configured: boolean;
  version?: string;
  status: 'ok' | 'not-found' | 'outdated' | 'error';
  message: string;
}

export interface ToolExecution {
  type: 'shell';
  command: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execution?: ToolExecution;
}

export interface MCPResource {
  name: string;
  uri: string;
  description?: string;
}

export interface MCPConfig {
  name?: string;
  version?: string;
  tools?: MCPTool[];
  resources?: MCPResource[];
}

export interface AuditLog {
  timestamp: string;
  tool: string;
  args: Record<string, unknown>;
  success: boolean;
  duration: number;
  requestId?: string;
}

export interface Component {
  name: string;
  description: string;
  type?: string;
  id?: string;
  category?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
}

export interface CreateReactProjectArgs {
  projectName: string;
  template?: string;
  cwd?: string;
  packageManager?: string;
}

export interface AddComponentArgs {
  name: string;
  destination?: string;
  cwd?: string;
}

export interface GenerateTemplateArgs {
  page: string;
  theme?: string;
  cwd?: string;
}

export interface ValidateIgnixOnlyArgs {
  path?: string;
  cwd?: string;
}

export interface ListComponentsArgs {
  category?: string;
  page?: number;
  limit?: number;
}

export interface SearchArgs {
  query: string;
}
