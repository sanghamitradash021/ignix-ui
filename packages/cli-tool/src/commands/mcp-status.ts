// packages/ignix-mcp-server/src/commands/mcp-status.ts
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import type { ClientStatus, NpmRegistryResponse } from '../types/index.js';
import { getErrorMessage } from '../utils/error-handler.js';

async function getLatestVersion(): Promise<string | null> {
  try {
    const response = await fetch(
      'https://registry.npmjs.org/@mindfiredigital/ignix-mcp-server/latest'
    );
    const data = (await response.json()) as NpmRegistryResponse;
    return data.version;
  } catch (error) {
    console.error('Failed to fetch latest version:', getErrorMessage(error));
    return null;
  }
}

// FIX: Proper Claude Desktop path for all platforms
function getClaudeConfigPath(): string {
  if (process.platform === 'win32') {
    // Windows: %APPDATA%\Claude\claude_desktop_config.json
    return path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
  } else if (process.platform === 'darwin') {
    // macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
    return path.join(
      process.env.HOME || '',
      'Library',
      'Application Support',
      'Claude',
      'claude_desktop_config.json'
    );
  } else {
    // Linux: ~/.config/Claude/claude_desktop_config.json
    return path.join(process.env.HOME || '', '.config', 'Claude', 'claude_desktop_config.json');
  }
}

function getConfigPath(client: string): string {
  const configPaths: Record<string, string> = {
    cursor: '.cursor/mcp.json',
    vscode: '.vscode/mcp.json',
    claude: getClaudeConfigPath(), // FIX: Use proper path
    windsurf: '.windsurf/mcp.json',
    jetbrains: '.idea/mcp.json',
  };
  return configPaths[client] || '';
}

interface ConfigFile {
  mcpServers?: Record<string, { args?: string[] }>;
  servers?: Record<string, { args?: string[] }>;
}

function extractVersionFromArgs(args: string[] | undefined): string | undefined {
  if (!args || !Array.isArray(args)) return undefined;

  const versionArg = args.find(
    (arg: string) => typeof arg === 'string' && arg.includes('@mindfiredigital/ignix-mcp-server@')
  );

  if (versionArg && typeof versionArg === 'string') {
    const version = versionArg.replace('@mindfiredigital/ignix-mcp-server@', '');
    // FIX: Clean up version display
    if (version === '^1') return '1.x';
    if (version === 'latest') return 'latest';
    return version;
  }
  return undefined;
}

export const mcpStatusCommand = new Command()
  .name('status')
  .description('Check MCP configuration status across all clients')
  .option('--json', 'Machine output')
  .action(async (opts) => {
    const clients = [
      { name: 'Cursor', clientId: 'cursor' },
      { name: 'Claude Desktop', clientId: 'claude' },
      { name: 'VS Code', clientId: 'vscode' },
      { name: 'Windsurf', clientId: 'windsurf' },
    ];

    const statuses: ClientStatus[] = [];
    const latestVersion = await getLatestVersion();

    for (const client of clients) {
      const configPath = getConfigPath(client.clientId);
      if (!configPath) {
        statuses.push({
          name: client.name,
          configured: false,
          status: 'error',
          message: `${client.name} → Unknown client type`,
        });
        continue;
      }

      const fullPath = path.resolve(configPath);
      const exists = await fs.pathExists(fullPath);

      if (!exists) {
        statuses.push({
          name: client.name,
          configured: false,
          status: 'not-found',
          message: `${client.name} → ${configPath} (not found)`,
        });
        continue;
      }

      try {
        const config = (await fs.readJSON(fullPath)) as ConfigFile;
        const mcpServers = config.mcpServers || config.servers || {};
        const ignixConfig = mcpServers.ignix;

        if (!ignixConfig) {
          statuses.push({
            name: client.name,
            configured: false,
            status: 'not-found',
            message: `${client.name} → Ignix MCP not configured`,
          });
          continue;
        }

        const version = extractVersionFromArgs(ignixConfig.args);
        let status: 'ok' | 'outdated' = 'ok';

        // FIX: Only check for outdated if we have a valid version and not 'latest'
        if (version && latestVersion && version !== 'latest' && version !== '1.x') {
          const cleanVersion = version.replace('^', '');
          if (semver.lt(cleanVersion, latestVersion)) {
            status = 'outdated';
          }
        }

        statuses.push({
          name: client.name,
          configured: true,
          version,
          status,
          message: `${client.name} → ✅ configured${version ? ` (v${version})` : ''}`,
        });
      } catch (error) {
        statuses.push({
          name: client.name,
          configured: false,
          status: 'error',
          message: `${client.name} → ❌ Error reading config: ${getErrorMessage(error)}`,
        });
      }
    }

    if (opts.json) {
      console.log(JSON.stringify({ success: true, clients: statuses }, null, 2));
    } else {
      console.log(chalk.bold('\n🔍 Ignix MCP Status\n'));

      statuses.forEach((status) => {
        if (status.status === 'ok') {
          console.log(chalk.green(status.message));
        } else if (status.status === 'outdated') {
          console.log(
            chalk.yellow(
              `⚠️  ${status.name} → config exists but server version is outdated (${status.version} → ${latestVersion})`
            )
          );
        } else {
          console.log(chalk.red(`❌ ${status.message}`));
        }
      });

      const configuredCount = statuses.filter((s) => s.configured).length;
      console.log(chalk.gray(`\nConfigured: ${configuredCount}/${statuses.length} clients`));

      if (statuses.some((s) => s.status === 'outdated')) {
        console.log(
          chalk.cyan('\n💡 Run `npx ignix mcp init --universal` to update all clients\n')
        );
      }

      if (configuredCount === 0) {
        console.log(
          chalk.cyan('\n💡 Run `npx ignix mcp init --universal` to configure all clients\n')
        );
      }
    }
  });
