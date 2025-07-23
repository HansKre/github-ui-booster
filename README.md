# GitHub UI Booster

## Setup

```sh
npm install
```

## Build

```sh
npm run build
```

## Development

```sh
npm run watch
```

## Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory

## Links

[manivest v3](https://stackoverflow.com/questions/63308160/how-to-migrate-manifest-version-2-to-v3-for-chrome-extension)

[browser actions Google Dev Portal](https://developer.chrome.com/blog/mv3-actions?hl=de)

[storge-api](https://dev.to/ambujsahu81/where-to-store-data-in-chrome-extension--1be6)

[tutorial](https://meenumatharu.medium.com/building-a-google-chrome-extension-with-manifest-v3-a-basic-example-to-get-started-0e976938bc70)

[youtube tutorial](https://www.youtube.com/watch?v=tIJrby96Oog)

## Examples and Inspirations

<https://github.com/ambujsahu81/Website-Customizer-Plus>

<https://github.com/gizumon/github-ui-extentions>

<https://github.com/aklinker1/github-better-line-counts>

## Releasing

### Prepare extension

- update version in `manifest.json`
- run `npm run release`

### Upload to Chrome Web Store

- Login to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- Click the GitHub UI Booster extension
- Go to Build > Package
- Click "Upload new package"
- Drag and drop the zip file into the dialog
- Click "Submit for review"

### Update screenshot

- take screenshot and right-click > Open with > GIMP
- CMD+A, CMD+C
- CMD + N to create a new file
- dimensions: 1280x800
- SHIFT+B, choose black and colorize the layer in black
- CMD+V
- SHIFT+S for the Resize Tool
- CMD+two-fingers to zoom out
- resize the pasted image as needed
- SHIFT+CMD+E to export

### Webstore-Description

Boost productivity on GitHub and GitHub Enterprise with this powerful extension!

Highlights:

- works for GitHub and GitHub Enterprise
- supports multiple GitHub instances
- powered by the GitHub API, using your personal access token for secure and seamless access
- shows the base branch for each pull request directly on the PRs page
- refined line count, excluding non-impactful files (e.g., package-lock.json)
- on-hover instant access to changed files and diffs from the PRs page
- integrated search for changed files across all open PRs
- shows merge conflicts on PRs page
- custom pull request filter to replace GitHub’s default
- integrated 'update branche' button in PRs page
- nested display of dependent PRs on the PRs page, showing clear hierarchy
- integrates with your Jira to display status, prio and assignee on the prs-page
- all of the above features are toggleable individually
