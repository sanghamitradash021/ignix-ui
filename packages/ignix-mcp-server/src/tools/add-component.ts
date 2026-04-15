// packages/ignix-mcp-server/src/tools/add-component.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

async function hasComponents(cwd: string): Promise<boolean> {
  const componentsDir = path.join(cwd, 'src', 'components', 'ui');
  return await fs.pathExists(componentsDir);
}

async function hasIgnixConfig(cwd: string): Promise<boolean> {
  const configPath = path.join(cwd, 'ignix.config.js');
  return await fs.pathExists(configPath);
}

async function runCommand(command: string, cwd?: string): Promise<string> {
  const { stdout } = await execAsync(command, {
    cwd,
    env: { ...process.env, PATH: process.env.PATH },
    shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
  });
  return stdout;
}

async function initIgnix(cwd: string): Promise<void> {
  console.error(`🔧 Initializing Ignix UI in ${cwd}`);
  try {
    await runCommand('npx ignix init --yes', cwd);
  } catch {
    await runCommand('ignix init --yes', cwd);
  }
}

export async function addComponentTool(args: any) {
  const { components, cwd = '.' } = args;

  // Handle both string and array
  let componentsList: string[] = [];
  if (typeof components === 'string') {
    componentsList = [components];
  } else if (Array.isArray(components)) {
    componentsList = components;
  } else if (!components) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Components parameter is required',
              classification: 'MISSING_PARAMETER',
              action: 'Provide components array: { components: ["button", "card"] }',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (componentsList.length === 0) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Components array cannot be empty',
              classification: 'EMPTY_ARRAY',
              action: 'Provide at least one component name',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  try {
    // Check if React project exists
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

    // Auto-initialize Ignix if needed
    const hasConfig = await hasIgnixConfig(cwd);
    let initialized = false;

    if (!hasConfig) {
      console.error(`⚠️ Ignix not initialized. Running init...`);
      await initIgnix(cwd);
      console.error(`✅ Ignix initialized`);
      initialized = true;
    }

    // Install components using the CLI
    console.error(`📦 Adding components: ${componentsList.join(', ')}`);

    let output: string;
    try {
      // Use npx to run ignix add component
      output = await runCommand(
        `npx ignix add component ${componentsList.join(' ')} --yes --json`,
        cwd
      );
    } catch (error) {
      // If npx fails, try direct ignix command
      output = await runCommand(
        `ignix add component ${componentsList.join(' ')} --yes --json`,
        cwd
      );
    }

    let result;
    try {
      result = JSON.parse(output);
    } catch {
      result = { message: output };
    }

    // Check if components directory now exists
    const hasComponentsDir = await hasComponents(cwd);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              components: componentsList,
              initialized: initialized,
              readyForTemplate: hasComponentsDir, // ← ADD THIS FLAG
              message: `✅ ${
                hasConfig ? 'Added' : 'Initialized Ignix and added'
              } components: ${componentsList.join(', ')}`,
              nextSteps: hasComponentsDir
                ? [
                    'Now use generate_template to create pages',
                    'Example: generate_template({ page: "home", cwd: "." })',
                  ]
                : ['Components installed successfully', 'You can now generate templates'],
              details: result,
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
              classification: 'INSTALLATION_FAILED',
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
