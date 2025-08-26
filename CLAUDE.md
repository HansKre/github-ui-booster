# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development
npm run watch              # Watch mode for development
npm run build              # Production build
npm run build:pack         # Build and create dist.zip package
npm run release            # Build and package for release

# Testing and Quality
npm test                   # Run Jest tests
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues automatically
npm run prettier           # Format code with Prettier

# Chrome Extension Development
# Load the 'dist' directory in Chrome's extension developer mode after building
```

## Project Architecture

This is a Chrome extension (Manifest v3) that enhances GitHub and GitHub Enterprise UI with productivity features.

### Core Structure

- **Content Scripts**: Three separate content scripts inject functionality into different GitHub pages:
  - `content_pr_page.tsx` - Individual PR pages
  - `content_prs_page.tsx` - PRs listing page
  - `content_compare_page.tsx` - Compare/diff pages

- **Background Service Worker**: `background.ts` handles JIRA API requests due to CORS restrictions

- **Extension Pages**:
  - `popup.tsx` - Extension popup interface
  - `options.tsx` - Options/settings page with tabbed interface

### Key Components

- **Settings Management**: Uses Chrome storage API with Yup schema validation (`src/services/getSettings.ts`)
- **Multi-Instance Support**: Supports multiple GitHub instances (Enterprise + GitHub.com) via instance configuration
- **Feature Toggles**: All features are individually toggleable via settings
- **JIRA Integration**: Fetches issue data through background script to bypass CORS

### Settings Architecture

Settings are organized into:

- `instances[]` - GitHub instance configurations (PAT, org, repo, base URL)
- `features{}` - Boolean toggles for all extension features
- `jira{}` - JIRA integration settings
- `autoFilter{}` - Custom PR filtering configuration

### Build System

- **Webpack**: Multi-entry build with code splitting (vendor chunk for all except background)
- **SASS Modules**: CSS modules with local scope and hash-based class names
- **TypeScript**: Full TypeScript with strict validation
- **Entry Points**: Separate bundles for popup, options, content scripts, and background

### Chrome Extension Permissions

- `storage` - Chrome storage for settings
- `host_permissions: ["<all_urls>"]` - Access to all GitHub instances
- Content scripts inject into `https://*/*` patterns

### Development Workflow

1. Run `npm run watch` for development
2. Load `dist` directory in Chrome extension developer mode
3. Changes auto-reload with webpack watch mode
4. Use VS Code task runner (Ctrl+Shift+B) for integrated development

## Coding Guidelines

- **Type Definitions**: Always use `type` instead of `interface`
- **React Component Props**: Always name component props type as `Props` and never export it
- **Exports**: Never use default exports - always use named exports
- **Component Structure**: Follow existing component folder structure with index.ts barrel exports
- **Type Safety**: Never use `any` type - use proper typing with `unknown` for uncertain types
- **Type Casting**: When type casting is necessary, always include safety checks before casting

## Important Implementation Notes

- Settings validation uses Yup schemas with strict type checking
- GitHub API integration uses Octokit with user-provided PATs
- JIRA API calls must go through background script due to CORS
- Features are conditionally loaded based on current page URL and user settings
- CSS modules prevent style conflicts with GitHub's native styles
