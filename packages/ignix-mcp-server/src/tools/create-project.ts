// packages/ignix-mcp-server/src/tools/create-project.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath);
    const filtered = files.filter(
      (f) =>
        !f.startsWith('.') &&
        f !== 'node_modules' &&
        f !== 'package-lock.json' &&
        f !== 'yarn.lock' &&
        f !== 'pnpm-lock.yaml'
    );
    return filtered.length === 0;
  } catch {
    return true;
  }
}

async function runCommand(
  command: string,
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  console.error(`🔧 Executing: ${command}`);
  const result = await execAsync(command, {
    cwd,
    env: { ...process.env, PATH: process.env.PATH },
    shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
    maxBuffer: 10 * 1024 * 1024,
  });
  return result;
}

export async function createProjectTool(args: any) {
  const { projectName, template = 'react-ts', cwd = '.' } = args;

  if (!projectName) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Project name is required',
              classification: 'MISSING_PARAMETER',
              action: 'Provide a project name like "restaurant-website"',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (!/^[a-z0-9-]+$/.test(projectName)) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Invalid project name. Use lowercase letters, numbers, and hyphens only.',
              classification: 'INVALID_PROJECT_NAME',
              action: 'Example: "restaurant-website" or "my-app"',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const isEmpty = await isDirectoryEmpty(cwd);

  if (!isEmpty) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Directory is not empty',
              classification: 'DIRECTORY_NOT_EMPTY',
              action: 'Use an empty directory or specify a new project name',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  try {
    const projectPath = path.resolve(cwd, projectName);
    console.error(`📁 Creating React project: ${projectName}`);

    // Step 1: Create Vite project
    await runCommand(`npm create vite@latest ${projectName} -- --template ${template}`, cwd);

    // Step 2: Install dependencies
    console.error(`📦 Installing dependencies...`);
    await runCommand(`npm install`, projectPath);

    // Step 3: Install Tailwind CSS v4 with Vite plugin
    console.error(`🎨 Installing Tailwind CSS v4...`);
    await runCommand(`npm install tailwindcss @tailwindcss/vite`, projectPath);

    // Step 4: Configure Vite with Tailwind plugin
    console.error(`⚙️ Configuring Vite with Tailwind plugin...`);
    const viteConfigPath = path.join(projectPath, 'vite.config.ts');
    if (await fs.pathExists(viteConfigPath)) {
      let viteConfig = await fs.readFile(viteConfigPath, 'utf-8');

      if (!viteConfig.includes('@tailwindcss/vite')) {
        // Add import
        viteConfig = viteConfig.replace(
          "import { defineConfig } from 'vite'",
          "import { defineConfig } from 'vite'\nimport tailwindcss from '@tailwindcss/vite'"
        );

        // Add plugin
        viteConfig = viteConfig.replace('plugins: [react()]', 'plugins: [react(), tailwindcss()]');

        await fs.writeFile(viteConfigPath, viteConfig);
      }
    }

    // Step 5: Setup CSS with Tailwind import
    console.error(`🎨 Setting up CSS...`);
    const cssPath = path.join(projectPath, 'src', 'index.css');
    await fs.writeFile(cssPath, '@import "tailwindcss";\n');

    // Step 6: Ensure main.tsx imports the CSS
    const mainTsxPath = path.join(projectPath, 'src', 'main.tsx');
    if (await fs.pathExists(mainTsxPath)) {
      let mainContent = await fs.readFile(mainTsxPath, 'utf-8');
      if (!mainContent.includes('import "./index.css"')) {
        mainContent = mainContent.replace(
          /import React from 'react'/,
          'import React from "react"\nimport "./index.css"'
        );
        await fs.writeFile(mainTsxPath, mainContent);
      }
    }

    console.error(`✅ Project created successfully at ${projectPath}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              projectPath,
              message: `✅ React project with Tailwind CSS v4 created at ${projectPath}`,
              nextSteps: [
                `cd ${projectName}`,
                `Run add_component with components like ["navbar", "hero", "button", "card"]`,
                `Then run generate_template with page "home"`,
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
    console.error(`❌ Project creation failed: ${errorMessage}`);

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
              classification: 'PROJECT_CREATION_FAILED',
              action: 'Ensure Node.js and npm are installed and try again.',
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
