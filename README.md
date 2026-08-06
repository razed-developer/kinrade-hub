# kevin-m-johnston.github.io

One React–Vite website containing:

- `/` — homepage and shared navigation
- `/marine/` — marine weather and tide dashboard
- `/tools/` — websites, apps, and tools directory

All pages use one root `package.json`, one `node_modules` folder, one Vite configuration, and one GitHub Pages workflow.

## Install and run locally

Install Node.js 22, then open PowerShell in the repository folder:

```powershell
npm install
npm run dev
```

Open the address Vite prints. Use the shared navigation to move between pages.

## Edit the tools directory

While `npm run dev` is running, open:

```text
http://localhost:5173/tools/
```

Local development mode displays Add, Edit, Delete, Import, and Export controls. Changes are written directly to:

```text
src/features/tools/data/tools.json
```

Commit and push that file to publish the changes.

## Build locally

```powershell
npm run build
npm run preview
```

The one build command produces all three pages in `dist/`.

## Publish

Commit the repository and push to `main`. The workflow in `.github/workflows/deploy.yml` installs once, builds once, and deploys the complete `dist` folder to GitHub Pages.

In GitHub, ensure **Settings → Pages → Source** is set to **GitHub Actions**.

