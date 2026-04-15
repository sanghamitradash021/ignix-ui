export const DOCS_CONTENT = `# Ignix UI - Quick Reference

## NO CSS FILES ALLOWED
All styling MUST use Tailwind className.

## ALWAYS USE MCP TOOLS
- create_react_project
- add_component (auto-initializes)
- generate_template
- list_components
- validate_ignix_only
- get_component_docs

## EXAMPLE WORKFLOW
\`\`\`
// Empty folder
create_react_project({ projectName: "my-app" })
add_component({ components: ["button", "card"], cwd: "./my-app" })
generate_template({ page: "home", cwd: "./my-app" })

// Existing React project
add_component({ components: ["button", "card"], cwd: "." })
generate_template({ page: "home", cwd: "." })
\`\`\`

## GOOD VS BAD
✅ className="bg-blue-500 text-white"
✅ import { Button } from '@/components/ui/button'
❌ import './styles.css'
❌ <style>{...}</style>
❌ className="custom-class"
❌ import { Button } from '@shadcn/ui'`;

// const docsContent = `# Ignix UI - Quick Reference

// ## NO CSS FILES ALLOWED
// All styling MUST use Tailwind className.

// ## ALWAYS USE MCP TOOLS
// - create_react_project
// - add_component (auto-initializes)
// - generate_template

// ## EXAMPLE WORKFLOW
// \`\`\`
// add_component({ components: ["button", "card"], cwd: "." })
// generate_template({ page: "home", cwd: "." })
// \`\`\`

// ## GOOD VS BAD
// ✅ className="bg-blue-500 text-white"
// ❌ import './styles.css'
// ❌ <style>{...}</style>
// ❌ className="custom-class"`;
