# GitHub UI Booster

A Chrome extension that enhances GitHub and GitHub Enterprise UI with powerful productivity features. Built with TypeScript, React, and Manifest v3. Add it to your Chrome by through the [Chrome web store](https://chromewebstore.google.com/detail/github-ui-booster/hipcgedmoamiahdjbdccjohllbikimoc)

## Features

### Pull Request Management

- **Base Branch Labels**: Show base branch information for each pull request
- **Changed Files**: Display changed files count with search functionality
- **Total Lines Counter**: Show total lines added and removed in pull requests
- **Reorder Pull Requests**: Automatically organize PRs by base branch with visual hierarchy
- **Update Branch Button**: Quick access to update PR branches when behind base branch
- **Auto Filter**: Apply custom filters to pull requests list

### JIRA Integration

- **PR Title from JIRA**: Auto-populate PR titles from JIRA issue keys in branch names
- **Description Template**: Use custom PR description templates with JIRA ticket placeholders
- **Issue Information**: Display JIRA issue details directly on GitHub

### Multi-Instance Support

- **GitHub Enterprise**: Full support for GitHub Enterprise instances
- **Multiple Instances**: Configure multiple GitHub instances simultaneously
- **Personal Access Tokens**: Secure API access using your GitHub PATs

### Settings & Sync

- **Feature Toggles**: Individual control over all extension features
- **User Profile Sync**: Option to sync settings across Chrome instances using `chrome.storage.sync`
- **Import/Export**: Backup and restore extension settings

## Development

### Setup

```bash
npm install
```

### Build for Development

```bash
npm run watch
```

### Build for Production

```bash
npm run build
```

### Load Extension in Chrome

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` directory

### Testing & Quality

```bash
npm test          # Run Jest tests
npm run lint      # Run ESLint
npm run lint:fix  # Fix linting issues
npm run prettier  # Format code
```

## Architecture

This Chrome extension uses:

- **Manifest v3** for modern Chrome extension standards
- **TypeScript** for type safety and better development experience
- **React** for UI components
- **SASS Modules** for scoped styling
- **Webpack** for bundling with code splitting
- **Chrome Storage API** for settings persistence

### Project Structure

```txt
src/
├── components/                 # Reusable React components
├── content/                    # Content script functionality
├── pages/                      # Extension pages (popup, options)
├── services/                   # Core services and utilities
├── content_pr_page.tsx         # Individual PR page content script
├── content_prs_page.tsx        # PRs listing page content script
├── content_compare_page.tsx    # Compare/diff page content script
├── background.ts               # Service worker
├── popup.tsx                   # Extension popup
└── options.tsx                 # Options/settings page
```

## Configuration

The extension requires configuration through the Options page:

1. **GitHub Instances**: Add your GitHub instances with Personal Access Tokens
2. **Feature Toggles**: Enable/disable individual features
3. **JIRA Integration** (optional): Configure JIRA instance for enhanced functionality

## Releasing

### Prepare Release

1. Update version in `public/manifest.json`
2. Run `npm run release` to build and create distribution package
3. The release package will be created as `dist.zip`
4. Commit work and push everything including tags by running `git push --tags`

### Publish on the Chrome Web Store

1. Login to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Select the GitHub UI Booster extension
3. Go to Build > Package
4. Upload the new package
5. Submit for review

### Update screenshot

1. take screenshot and right-click > Open with > GIMP
2. CMD+A, CMD+C
3. CMD + N to create a new file
4. dimensions: 1280x800
5. SHIFT+B, choose black and colorize the layer in black
6. CMD+V
7. SHIFT+S for the Resize Tool
8. CMD+two-fingers to zoom out
9. resize the pasted image as needed (CMD+click-and-hold+drag-with-one-finger to resize evenly)
10. SHIFT+CMD+E to export

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code style
4. Run tests and linting
5. Submit a pull request

### Chrome Web Store Description

**GitHub UI Booster - Supercharge Your GitHub Workflow!**

Transform your GitHub and GitHub Enterprise experience with powerful productivity features designed for developers and teams.

**🚀 Key Features:**
• **Smart PR Management** - Base branch labels, refined line counts, and hierarchical PR organization
• **Enhanced File Navigation** - Instant access to changed files with integrated search across all PRs
• **JIRA Integration** - Auto-populate PR titles and descriptions from JIRA tickets
• **Multi-Instance Support** - Seamlessly work with GitHub.com and multiple Enterprise instances
• **One-Click Actions** - Quick branch updates and custom PR filters
• **Team Collaboration** - Random reviewer assignment and template-based descriptions

**🔧 Enterprise Ready:**
• Secure API access using your personal access tokens
• Support for multiple GitHub Enterprise instances
• All features individually toggleable
• Settings sync across Chrome instances
• Import/export configuration

**✨ Perfect for teams using GitHub + JIRA who want to:**

- Reduce PR review overhead
- Standardize development workflows
- Navigate large codebases efficiently
- Maintain clear PR hierarchies
- Automate repetitive tasks

Built with TypeScript and React. Works with both GitHub.com and GitHub Enterprise.

## License

This project is licensed under the MIT License.
