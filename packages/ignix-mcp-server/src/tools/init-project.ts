// packages/ignix-mcp-server/src/tools/init-project.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

async function runCommand(command: string, cwd?: string): Promise<string> {
  const { stdout } = await execAsync(command, {
    cwd,
    env: { ...process.env, PATH: process.env.PATH },
    shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
  });
  return stdout;
}

async function hasIgnixConfig(cwd: string): Promise<boolean> {
  const configPath = path.join(cwd, 'ignix.config.js');
  return await fs.pathExists(configPath);
}

export async function initProjectTool(args: any) {
  const { cwd = '.' } = args;

  try {
    // Check if already initialized
    if (await hasIgnixConfig(cwd)) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                alreadyInitialized: true,
                message: '✅ Ignix UI already initialized in this project',
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Check if this is a React project
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: 'Not a React project. No package.json found.',
                classification: 'NO_REACT_PROJECT',
                action: 'Run create_react_project first to create a React project.',
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Run ignix init
    console.error(`🔧 Initializing Ignix UI in ${cwd}`);

    let output: string;
    try {
      output = await runCommand('npx ignix init --yes', cwd);
    } catch (error) {
      // Try without npx
      output = await runCommand('ignix init --yes', cwd);
    }
    console.log(output);
    // Verify initialization
    const initialized = await hasIgnixConfig(cwd);

    if (!initialized) {
      throw new Error('Ignix initialization failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              cliOutput: output,
              message: '✅ Ignix UI initialized successfully',
              nextSteps: [
                'Use add_component to install components',
                'Use generate_template to create pages',
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
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
              classification: 'INIT_FAILED',
              action: 'Ensure ignix CLI is installed: npm install -g ignix-cli',
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
