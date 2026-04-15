// // packages/ignix-mcp-server/src/resources/ignix-rules.ts
// export const IGNIX_RULES = `# Ignix UI MCP Server - Complete Workflow Guide

// ## THREE SCENARIOS - DETECT AND ACT

// ### SCENARIO 1: Empty Folder (No package.json)
// **User says:** "Create a landing page" or "Build a dashboard"

// **You MUST do this EXACT sequence:**
// 1. Call \`create_react_project({ projectName: "user-requested-name" })\`
// 2. Get \`projectPath\` from the response
// 3. Call \`add_component({ components: ["navbar", "button", "card", "hero"], cwd: projectPath })\`
// 4. Call \`generate_template({ page: "home", cwd: projectPath })\`
// 5. Generate React component code using installed components
// 6. Tell user: \`cd {projectPath} && npm run dev\`

// ### SCENARIO 2: React Project Exists, No ignix.config.js
// **User says:** "Add a button" or "Create a login page"

// **You MUST do this EXACT sequence:**
// 1. Call \`add_component({ components: ["button", "input", "card"], cwd: "." })\` - This auto-initializes Ignix
// 2. Call \`generate_template({ page: "login", cwd: "." })\`
// 3. Generate React component code

// ### SCENARIO 3: React Project with ignix.config.js Already Exists
// **User says:** "Add a card component" or "Create a dashboard"

// **You MUST do this EXACT sequence:**
// 1. Call \`list_components({ page: 1 })\` to discover available components
// 2. Call \`add_component({ components: ["requested-component"], cwd: "." })\`
// 3. Call \`generate_template({ page: "dashboard", cwd: "." })\`
// 4. Generate React component code

// ## CRITICAL RULES
// ✅ ALWAYS use the MCP tools - NEVER create files manually
// ✅ ALWAYS use cwd parameter for all calls
// ✅ ALWAYS pass components as an array to add_component
// ✅ ALWAYS generate React/TypeScript code with Tailwind CSS
// ✅ ALWAYS use projectPath from create_react_project for subsequent calls

// ## FORBIDDEN ACTIONS
// ❌ NEVER use shadcn, MUI, Chakra, Ant Design components
// ❌ NEVER create HTML/CSS files manually
// ❌ NEVER write vanilla JavaScript
// ❌ NEVER use shell commands directly
// ❌ NEVER assume components exist without checking list_components

// ## AVAILABLE COMPONENTS (Partial List)
// - button, card, navbar, sidebar, modal, dropdown
// - input, textarea, checkbox, radio, switch
// - table, pagination, tabs, accordion, carousel
// - avatar, badge, tooltip, spinner, toast
// - typography, container, stack, grid
// - hero, pricing, testimonial, team profiles

// Use \`list_components\` to see all available components with descriptions.
// `;

export const IGNIX_RULES = `# CRITICAL: IGNIX UI ABSOLUTE RULES

## 🚨 YOU WILL BE PENALIZED FOR CREATING CSS FILES 🚨

### RULE 1: ABSOLUTELY NO CSS FILES - EVER
❌ FORBIDDEN: App.css, index.css, styles.css, any .css file
❌ FORBIDDEN: <style> tags, styled-components, CSS modules
❌ FORBIDDEN: @tailwind, @import, @apply directives
✅ REQUIRED: ALL styling via Tailwind className ONLY

**GOOD EXAMPLE (CORRECT):**
\`\`\`tsx
// src/pages/Home.tsx - NO CSS FILE CREATED
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <button className="px-6 py-3 bg-purple-600 text-white rounded-lg">
        Click Me
      </button>
    </div>
  );
};
\`\`\`

**BAD EXAMPLE (WRONG - WILL FAIL):**
\`\`\`tsx
// DO NOT DO THIS - NO CSS FILES!
import './Home.css';  // ❌ FORBIDDEN
import styles from './Home.module.css'; // ❌ FORBIDDEN

const HomePage = () => {
  return (
    <div className="hero-section">  // ❌ Custom CSS class
      <style>{...}</style>  // ❌ Inline styles
    </div>
  );
};
\`\`\`

### RULE 2: NEVER CREATE FILES MANUALLY
❌ FORBIDDEN: fs.writeFile, shell commands, manual file creation
✅ REQUIRED: ONLY use MCP tools: create_react_project, add_component, generate_template

### RULE 3: LET add_component HANDLE EVERYTHING
❌ FORBIDDEN: Running 'npx ignix init' yourself
❌ FORBIDDEN: Creating ignix.config.js manually
✅ REQUIRED: Call add_component - it auto-initializes, creates config, installs deps

## THE ONLY VALID WORKFLOWS WITH EXAMPLES

### SCENARIO A: Empty folder (no files at all)
**User request:** "Create a coffee shop landing page"

**YOU MUST DO EXACTLY:**
\`\`\`javascript
// Step 1: Create the React project
await create_react_project({ projectName: "coffee-shop" })
// Returns: { projectPath: "/path/to/coffee-shop" }

// Step 2: Install Ignix components (auto-initializes)
await add_component({ 
  components: ["navbar", "button", "card", "hero", "typography"],
  cwd: "./coffee-shop"
})

// Step 3: Generate the page
await generate_template({ page: "home", cwd: "./coffee-shop" })

// Step 4: Tell user
// "cd coffee-shop && npm run dev"
\`\`\`

### SCENARIO B: React exists, with or without ignix.config.js
**User request:** "Add a button and create a login page"

**YOU MUST DO EXACTLY:**
\`\`\`javascript
// Step 1: Install components (auto-inits if needed)
await add_component({ 
  components: ["button", "input", "card"],
  cwd: "."
})

// Step 2: Generate the page
await generate_template({ page: "login", cwd: "." })
\`\`\`

## WHAT YOUR GENERATED CODE MUST LOOK LIKE

### GOOD CODE (ALWAYS DO THIS):
\`\`\`tsx
import React from 'react';
import { Button } from '@ignix-ui/button';
import { Card } from '@ignix-ui/card';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <Card className="p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Coffee Shop
          </h1>
          <Button className="bg-amber-600 text-white hover:bg-amber-700">
            Order Now
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
\`\`\`

### BAD CODE (NEVER DO THIS):
\`\`\`tsx
// NEVER create CSS files
import './App.css';  // ❌ NO CSS FILES

// NEVER use custom CSS classes without Tailwind
<div className="hero-section">  // ❌ Use Tailwind instead

// NEVER write style tags
<style>
  .button { background: purple; }  // ❌ Use Tailwind classes
</style>

// NEVER use other UI libraries
import { Button } from '@shadcn/ui';  // ❌ Use Ignix only
\`\`\`

## VALIDATION CHECKLIST
Before responding, verify:
- [ ] Did I create any .css files? (If yes, FAIL)
- [ ] Did I use only MCP tools? (If no, FAIL)
- [ ] Are all imports from '@/components/ui/'? (If no, FAIL)
- [ ] Are all styles Tailwind classes? (If no, FAIL)
- [ ] Does the code use ThemeProvider? (Should use)

## REMEMBER
- validate_ignix_only will REJECT CSS imports
- validate_ignix_only will REJECT non-Ignix imports
- Creating CSS files = Build failure
- Using custom CSS classes = Build failure

**IF YOU CREATE CSS FILES, THE BUILD WILL FAIL. DON'T DO IT.**`;
