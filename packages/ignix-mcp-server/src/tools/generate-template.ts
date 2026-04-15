// packages/ignix-mcp-server/src/tools/generate-template.ts
import fs from 'fs-extra';
import path from 'path';

export async function generateTemplateTool(args: any) {
  const { page, template = 'basic', cwd = '.' } = args;

  // Validate that we're not being asked to create CSS
  if (page.includes('.css') || template.includes('css')) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'CSS files are forbidden. Only generate React components.',
              classification: 'FORBIDDEN_CSS',
              action: 'Generate a React component with Tailwind classes instead.',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (!page) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Page name is required',
              classification: 'MISSING_PARAMETER',
              action: 'Provide a page name to generate.',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  try {
    const pageName = page.charAt(0).toUpperCase() + page.slice(1);
    const pagePathDir = path.join(cwd, 'src', 'pages');
    const pagePath = path.join(pagePathDir, `${page}.tsx`);

    // Ensure pages directory exists
    await fs.ensureDir(pagePathDir);

    // Generate page with Tailwind CSS classes (no custom CSS files)
    const pageContent = `import React from 'react';

const ${pageName}Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ${pageName}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Welcome to your ${pageName} page built with Ignix UI
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${pageName}Page;
`;

    await fs.writeFile(pagePath, pageContent);

    // Update App.tsx to use this page
    const appPath = path.join(cwd, 'src', 'App.tsx');
    if (await fs.pathExists(appPath)) {
      const appContent = await fs.readFile(appPath, 'utf-8');
      if (!appContent.includes(`./pages/${page}`)) {
        const newAppContent = `import ${pageName}Page from './pages/${page}';

function App() {
  return <${pageName}Page />;
}

export default App;
`;
        await fs.writeFile(appPath, newAppContent);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              pagePath,
              pageName: `${pageName}Page`,
              message: `✅ Generated ${pageName} page at ${pagePath}`,
              nextSteps: [
                `Import: import ${pageName}Page from './pages/${page}'`,
                'Run: npm run dev to see your page',
                'Add more components with add_component',
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
              classification: 'GENERATION_ERROR',
              action: 'Check that you have run add_component first to initialize Ignix.',
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
