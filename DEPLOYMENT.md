# Deployment guide

Prepared 2026-11-25. These are instructions for a later authorized deployment; no steps that publish have been run.

## Local configuration

`npm run build` writes `dist/`. Node 22+ is enough; no dependency installation is needed. Set `SITE_URL` to the final origin plus optional repository path, without query or fragment. URLs are then generated consistently for assets, links, canonicals, sitemap, and cards.

Example PowerShell project-path rehearsal (does not publish):

```powershell
$env:SITE_URL = 'https://aeriswghs-ux.github.io/orbitlab'
npm run verify
$env:BASE_PATH = '/orbitlab'
npm start
```

Visit `http://127.0.0.1:4173/orbitlab/`. That public URL is an illustrative future destination, not a claim that it exists. Reset `SITE_URL` and `BASE_PATH` when returning to a root-path local build:

```powershell
Remove-Item Env:SITE_URL -ErrorAction SilentlyContinue
Remove-Item Env:BASE_PATH -ErrorAction SilentlyContinue
npm run build
```

For a custom domain, use `SITE_URL=https://your-approved-domain.tld` with no repository suffix. Domain/DNS configuration remains separate. `PREVIEW=1` forces noindex even with a real domain. `.example` defaults are also always noindex; robots disallows crawling. Noindex is an indexing hint, not access control.

## GitHub Pages

After approval, create a new standalone repository. Do not copy this project into AeroLab or overwrite the portfolio repository. Choose GitHub Actions as the Pages publishing source. Add the following as `.github/workflows/pages.yml` in that new repository. It is deliberately not installed as an active workflow in this delivery.

```yaml
name: Publish OrbitLab on request
on:
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - uses: actions/configure-pages@v5
        id: pages
      - run: npm run verify
        env:
          SITE_URL: ${{ steps.pages.outputs.base_url }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

This publishes only when manually triggered. The generator creates `.nojekyll`. Pages serves `lesson-slug/index.html` at clean directory URLs without SPA rewrites. On a repository subpath, robots.txt is generated inside that path; crawlers use the domain-root robots.txt, which belongs to the portfolio. Do not overwrite that file without separate authorization. Per-page robots metadata still travels with OrbitLab.

Official reference: [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Vercel

After approval, import the new standalone repository as a separate Vercel project. Use framework preset **Other**, Node 24, build command `npm run verify`, and output directory `dist`. Set production `SITE_URL` to its chosen domain. For preview environments, set `PREVIEW=1`. Set the root directory to the repository root. The included `vercel.json` supplies the build and output settings and trailing-slash routing.

No SPA catch-all rewrite is needed: actual HTML exists for every route. Verify `/lessons/gravity/`, `/sitemap.xml`, `/robots.txt`, `/assets/social.png`, and an unknown route after deployment. Confirm no `.example` canonicals remain in a production build. If moving domains later, rebuild metadata and configure redirects at the host.

Official references: [Vercel project configuration](https://vercel.com/docs/project-configuration), [build configuration](https://vercel.com/docs/builds/configure-a-build).
