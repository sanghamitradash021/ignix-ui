import * as fs from 'fs';
// import * as path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

interface GetComponentDocsArgs {
  component: string;
}

interface ComponentInfo {
  name: string;
  description: string;
  dependencies?: string[];
  componentDependencies?: string[];
  files?: {
    main: {
      path: string;
      type: string;
    };
  };
}

interface RegistryData {
  components: Record<string, ComponentInfo>;
}

// Use the absolute path to registry.json
const REGISTRY_PATH = 'D:\\IgnixUI\\ignix-ui\\packages\\registry\\registry.json';

function loadRegistry(): RegistryData | null {
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      console.error(`✅ Found registry at: ${REGISTRY_PATH}`);
      const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
      return JSON.parse(content);
    } else {
      console.error(`❌ Registry not found at: ${REGISTRY_PATH}`);
      return null;
    }
  } catch (e) {
    console.error('Failed to parse registry.json:', e);
    return null;
  }
}

function findComponent(registry: RegistryData | null, componentName: string): ComponentInfo | null {
  if (!registry) return null;

  const lowerName = componentName.toLowerCase();

  // Direct match
  if (registry.components[lowerName]) {
    return registry.components[lowerName];
  }

  // Try without hyphens
  const normalized = lowerName.replace(/[-_]/g, '');
  for (const [key, value] of Object.entries(registry.components)) {
    const keyNormalized = key.replace(/[-_]/g, '');
    if (keyNormalized === normalized) {
      return value;
    }
  }

  // Try partial match (for components like "button-with-icon" when searching "button")
  for (const [key, value] of Object.entries(registry.components)) {
    if (key.includes(lowerName) || lowerName.includes(key)) {
      return value;
    }
  }

  return null;
}

function getDocsUrl(componentName: string, componentInfo: ComponentInfo | null): string {
  const baseUrl = 'https://mindfiredigital.github.io/ignix-ui';
  const lower = componentName.toLowerCase();

  // Check if it's a template
  const isTemplate =
    componentInfo?.files?.main?.type === 'template' ||
    componentInfo?.files?.main?.path?.includes('templates/');

  if (isTemplate) {
    const templateMap: Record<string, string> = {
      signin: '/docs/templates/pages/sign-in/',
      'sign-in': '/docs/templates/pages/sign-in/',
      signup: '/docs/templates/pages/sign-up/',
      'dashboard-overview-page': '/docs/templates/pages/dashboard-overview-page/',
      profile: '/docs/templates/pages/profile/',
      'contact-form': '/docs/templates/pages/contact-form/',
      'forgot-password': '/docs/templates/pages/forgot-password/',
      resetpassword: '/docs/templates/pages/reset-password/',
      'otp-verification': '/docs/templates/pages/otp-verification/',
      settingspage: '/docs/templates/pages/setting-page/',
      securitypage: '/docs/templates/pages/security/',
      apikeys: '/docs/templates/pages/api-keys/',
    };

    for (const [key, url] of Object.entries(templateMap)) {
      if (lower === key || lower.includes(key)) {
        return `${baseUrl}${url}`;
      }
    }
    return `${baseUrl}/docs/templates/pages/${lower}/`;
  }

  // Component URLs
  const componentMap: Record<string, string> = {
    button: '/docs/components/button',
    accordion: '/docs/components/accordion',
    card: '/docs/components/card',
    avatar: '/docs/components/avatar',
    badge: '/docs/components/badge',
    modal: '/docs/components/modal',
    dropdown: '/docs/components/dropdown',
    tooltip: '/docs/components/tooltip',
    input: '/docs/components/input',
    textarea: '/docs/components/textarea',
    checkbox: '/docs/components/checkbox',
    radio: '/docs/components/radio',
    switch: '/docs/components/switch',
    tabs: '/docs/components/tabs',
    navbar: '/docs/components/navbar',
    sidebar: '/docs/components/sidebar',
    table: '/docs/components/table',
    pagination: '/docs/components/pagination',
    carousel: '/docs/components/carousel',
    slider: '/docs/components/slider',
    toast: '/docs/components/toast',
    spinner: '/docs/components/spinner',
    typography: '/docs/components/typography',
    hero: '/docs/components/hero',
    rating: '/docs/components/rating',
  };

  for (const [key, url] of Object.entries(componentMap)) {
    if (lower === key || lower.includes(key)) {
      return `${baseUrl}${url}`;
    }
  }

  return `${baseUrl}/docs/components/${lower}`;
}

export async function getComponentDocsTool(args: any) {
  const typedArgs = args as GetComponentDocsArgs;
  const componentName = typedArgs.component;

  if (!componentName) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Component name is required',
              classification: 'MISSING_PARAMETER',
              action: 'Provide a component name. Example: Button, Card, Accordion, SignIn',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Load registry and find component
  const registry = loadRegistry();
  const componentInfo = findComponent(registry, componentName);

  if (!componentInfo) {
    let suggestions: string[] = [];
    if (registry) {
      suggestions = Object.keys(registry.components).slice(0, 15);
    }

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: `Component "${componentName}" not found in registry`,
              classification: 'COMPONENT_NOT_FOUND',
              suggestions: suggestions.slice(0, 10),
              action:
                suggestions.length > 0
                  ? `Try one of: ${suggestions
                      .slice(0, 10)
                      .join(', ')}... Use list_components to see all`
                  : 'Use list_components to see all available components',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const docsUrl = getDocsUrl(componentName, componentInfo);
  const isTemplate =
    componentInfo.files?.main?.type === 'template' ||
    componentInfo.files?.main?.path?.includes('templates/');

  // Build response
  const response: any = {
    success: true,
    component: componentInfo.name || componentName,
    description: componentInfo.description || 'No description available',
    type: isTemplate ? 'template' : 'component',
    documentationUrl: docsUrl,
    installation: `ignix add component ${componentName.toLowerCase()}`,
    import: `import { ${componentInfo.name || componentName} } from '@/components/${
      isTemplate ? 'templates' : 'ui'
    }/${componentName.toLowerCase()}'`,
  };

  // Add dependencies if available
  if (componentInfo.dependencies && componentInfo.dependencies.length > 0) {
    response.dependencies = componentInfo.dependencies;
  }

  if (componentInfo.componentDependencies && componentInfo.componentDependencies.length > 0) {
    response.componentDependencies = componentInfo.componentDependencies;
  }

  // Add file path
  if (componentInfo.files?.main?.path) {
    response.filePath = `src/${componentInfo.files.main.path}`;
  }

  // Add usage example
  const componentNameForUsage = componentInfo.name || componentName;
  response.usage = `<${componentNameForUsage}>
  {/* Your content here */}
</${componentNameForUsage}>`;

  response.note = `Full documentation with props, examples, and API reference available at: ${docsUrl}`;

  console.error(`📚 Returning docs for: ${componentName}`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}
