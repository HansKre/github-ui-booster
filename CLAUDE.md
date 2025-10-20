# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development
npm run watch              # Watch mode for development (Webpack watch)
npm run build              # Production build
npm run release            # Build and create dist.zip for Chrome Web Store

# Testing and Quality
npm test                   # Run Jest tests
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues automatically
npm run prettier           # Format code with Prettier

# Utility
npm run clean              # Clean dist directory
npm run prepare            # Setup husky hooks

# Chrome Extension Development
# After building, load the 'dist' directory in Chrome's extension developer mode (chrome://extensions)
```

## Project Architecture

This is a Chrome extension (Manifest v3) that enhances GitHub and GitHub Enterprise UI with productivity features.

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: SASS Modules + Styled Components + Primer React
- **Build**: Webpack 5 with TypeScript and code splitting
- **Validation**: Yup schemas
- **API**: Octokit (GitHub), Axios (JIRA)

### Core Structure

- **Content Scripts**: Three separate content scripts inject functionality into different GitHub pages:
  - `content_pr_page.tsx` - Individual PR pages
  - `content_prs_page.tsx` - PRs listing page
  - `content_compare_page.tsx` - Compare/diff pages

- **Background Service Worker**: `background.ts` handles JIRA API requests due to CORS restrictions

- **Extension Pages**:
  - `popup.tsx` - Extension popup interface
  - `options.tsx` - Options/settings page with tabbed interface

### Settings Management

Settings are stored in Chrome storage API and validated using Yup schemas (`src/services/getSettings.ts`).

**Key Schema Features**:

- `.cast()` is used instead of `.validate()` for graceful handling of invalid settings
- Supports both `chrome.storage.local` and `chrome.storage.sync` based on `persistToUserProfile` feature flag
- Settings gracefully fallback to defaults when invalid or missing

**Settings Structure**:

- **`instances[]`** - GitHub instance configurations
  - `pat` - Personal Access Token (must start with `ghp_`, minimum 30 characters)
  - `org` - GitHub organization name
  - `repo` - Repository name
  - `ghBaseUrl` - GitHub API base URL (defaults to `https://api.github.com`)
  - `randomReviewers` - Comma-separated list of reviewer usernames

- **`features{}`** - Boolean toggles for extension features:
  - `baseBranchLabels` - Show base branch labels on PRs
  - `changedFiles` - Display changed files count
  - `totalLinesPrs` - Show total lines changed on PR list page
  - `totalLinesPr` - Show total lines changed on individual PR page
  - `reOrderPrs` - Reorder PRs by custom logic
  - `addUpdateBranchButton` - Add update branch button
  - `autoFilter` - Enable automatic PR filtering
  - `prTitleFromJira` - Auto-populate PR title from JIRA ticket
  - `descriptionTemplate` - Use custom PR description template
  - `randomReviewer` - Enable random reviewer assignment
  - `persistToUserProfile` - Sync settings across devices using chrome.storage.sync

- **`jira{}`** - JIRA integration settings (optional)
  - `pat` - JIRA Personal Access Token (minimum 30 characters)
  - `baseUrl` - JIRA instance base URL
  - `issueKeyRegex` - Regex pattern for JIRA issue keys (e.g., "TEST-\\d+")

- **`autoFilter`** - Custom PR filtering query string (optional)
- **`descriptionTemplate`** - Custom PR description template text (optional)
- **`fileBlacklist`** - Comma-separated list of files to exclude from line counts (default: "package-lock.json,pnpm-lock.yaml,yarn.lock")

### Options Page Structure

The Options page uses a tabbed interface (`src/pages/Tabs/`):

- **Feature Toggles** - Individual toggles for all extension features
- **GH Instances** - GitHub instance configuration (PAT, org, repo, base URL)
- **Jira** - JIRA integration settings
- **Import/Export** - Settings backup and restore functionality

### Build System

**Webpack Configuration** (`webpack/webpack.common.js`):

- Multi-entry build with 6 entry points: popup, options, 3 content scripts, and background
- Code splitting: `vendor.js` shared by all bundles except background (service workers can't use shared chunks)
- SASS Modules with CSS Modules for scoped styles (pattern: `[name]_[local]__[hash:base64]`)
- TypeScript with ts-loader
- CopyPlugin to copy public assets to dist

**Important Build Notes**:

- Development mode uses `mode: 'production'` in `webpack.dev.js` to avoid a Primer React bug with development builds
- Source maps are generated in development via `devtool: 'inline-source-map'`
- Each content script loads `vendor.js` first, then the specific content script bundle

### Chrome Extension Permissions

- `storage` - Chrome storage for settings
- `host_permissions: ["<all_urls>"]` - Access to all GitHub instances
- Content scripts inject into `https://*/*` patterns

### Development Workflow

1. Run `npm run watch` for development
2. Load `dist` directory in Chrome's extension developer mode (`chrome://extensions`)
3. Changes auto-reload with webpack watch mode
4. Run `npm test` to execute Jest unit tests
5. Use `npm run lint:fix` to automatically fix linting issues
6. Format code with `npm run prettier` before committing
7. Pre-commit hooks (husky + lint-staged) ensure code quality

### Releasing to Chrome Web Store

1. Update version in `public/manifest.json`
2. Run `npm run release` to build and create `dist.zip`
3. Login to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Upload the zip file and submit for review

## Coding Guidelines

- **Type Definitions**: Always use `type` instead of `interface`
- **React Component Props**: Always name component props type as `Props` and never export it
- **Exports**: Never use default exports - always use named exports
- **Component Structure**: Follow existing component folder structure with index.ts barrel exports
- **Type Safety**: Never use `any` type - use proper typing with `unknown` for uncertain types
- **Type Casting**: When type casting is necessary, always include safety checks before casting
- **Data Attributes**: Every component should have a unique `data-testid` resembling its component name
- **Component Size**: Write small, composable, reusable components

## Important Implementation Notes

- Settings validation uses Yup `.cast()` (not `.validate()`) for graceful error handling
- GitHub API integration uses Octokit with user-provided PATs
- JIRA API calls must go through background script due to CORS restrictions
- Features are conditionally loaded based on current page URL and user settings
- CSS modules prevent style conflicts with GitHub's native styles
- All settings can be persisted to either chrome.storage.local or chrome.storage.sync
- The extension supports hot reloading during development via webpack watch mode
- Content scripts detect which GitHub page they're on via URL matching and conditionally inject features
