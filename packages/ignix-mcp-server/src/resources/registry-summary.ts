import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getRegistrySummary() {
  try {
    // Try to find registry.json in common locations
    const possiblePaths = [
      path.resolve(__dirname, '../../../packages/registry/registry.json'),
      path.resolve(process.cwd(), 'packages/registry/registry.json'),
      path.resolve(__dirname, '../../registry.json'),
    ];

    for (const registryPath of possiblePaths) {
      if (await fs.pathExists(registryPath)) {
        const registryContent = await fs.readFile(registryPath, 'utf-8');
        const registry = JSON.parse(registryContent);
        return {
          totalComponents: Object.keys(registry.components).length,
          note: 'Use list_components tool to get paginated results with details',
          tip:
            'Components include: button, card, navbar, modal, dropdown, input, table, and many more',
        };
      }
    }
  } catch (error) {
    console.error('Error loading registry:', error);
  }

  // Fallback summary
  return {
    totalComponents: 90,
    note: 'Use list_components tool to get paginated results with details',
    tip: 'Components include: button, card, navbar, modal, dropdown, input, table, and many more',
  };
}
