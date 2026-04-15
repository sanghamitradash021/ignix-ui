// packages/ignix-mcp-server/src/tools/list-components.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Component {
  name: string;
  description: string;
  type?: string;
  category?: string;
}

async function runCommand(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(command, {
      env: { ...process.env, PATH: process.env.PATH },
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
    });
    return stdout;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Command failed: ${errorMessage}`);
  }
}

export async function listComponentsTool(args: any) {
  const { category, page = 1, limit = 15 } = args;

  try {
    let stdout: string;
    try {
      stdout = await runCommand('npx ignix list component --json');
    } catch {
      stdout = await runCommand('ignix list component --json');
    }

    const data = JSON.parse(stdout);
    let components = data.components || [];

    // Filter out templates if needed
    components = components.filter((c: Component) => c.type !== 'template');

    // Apply category filter
    if (category) {
      components = components.filter(
        (c: Component) =>
          c.category?.toLowerCase() === category.toLowerCase() ||
          c.type?.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedComponents = components.slice(start, end);
    const totalPages = Math.ceil(components.length / limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              components: paginatedComponents.map((c: Component) => ({
                name: c.name,
                description: c.description,
                category: c.category || c.type,
              })),
              pagination: {
                page,
                limit,
                total: components.length,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
              },
              category: category || null,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    // Return empty list with warning
    // const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              components: [],
              pagination: {
                page: 1,
                limit,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
              },
              warning: 'Could not fetch components. Run "npm install -g ignix-cli" to fix.',
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
