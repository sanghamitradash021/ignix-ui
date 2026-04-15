// packages/ignix-mcp-server/src/tools/validate-ignix-only.ts
import fs from 'fs-extra';
import path from 'path';

const INVALID_PATTERNS = [
  /@shadcn\/ui/,
  /@mui\/material/,
  /@mui\/icons-material/,
  /@chakra-ui/,
  /@ant-design/,
  //   /@radix-ui/,
  /@headlessui\/react/,
  //   /framer-motion/,
  /@nextui-org/,
  /@heroui/,
  /@fluentui/,
  /@blueprintjs/,
  /@react-spectrum/,
  /@adobe\/react-spectrum/,
  /@docusaurus/,
  /@mantine/,
  /@nextui/,
  /@geist-ui/,
  /@ariakit/,
  /@reach/,
];

async function scanFile(filePath: string): Promise<string[]> {
  const violations: string[] = [];
  const content = await fs.readFile(filePath, 'utf-8');

  for (const pattern of INVALID_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`${filePath}: ${pattern.source}`);
    }
  }

  return violations;
}

async function scanDirectory(dir: string, basePath: string): Promise<string[]> {
  const violations: string[] = [];
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other common directories
      if (!['node_modules', '.next', 'dist', 'build', '.git', 'coverage'].includes(file)) {
        const subViolations = await scanDirectory(filePath, basePath);
        violations.push(...subViolations);
      }
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      const fileViolations = await scanFile(filePath);
      violations.push(...fileViolations);
    }
  }

  return violations;
}

export async function validateIgnixOnlyTool(args: any) {
  const { path: scanPath = 'src', cwd = '.' } = args;
  const fullPath = path.resolve(cwd, scanPath);

  try {
    // Check if path exists
    if (!(await fs.pathExists(fullPath))) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                valid: true,
                message: `⚠️ Path "${scanPath}" not found. No validation performed.`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const violations = await scanDirectory(fullPath, fullPath);

    if (violations.length > 0) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                valid: false,
                violations,
                count: violations.length,
                classification: 'VALIDATION_FAILED',
                action:
                  'Replace these imports with Ignix UI components. Use list_components to find alternatives.',
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              valid: true,
              message: '✅ Only Ignix UI components found. No violations detected.',
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
              classification: 'SCAN_ERROR',
              action: `Could not scan ${scanPath}. Ensure the path exists and contains React components.`,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
