# GitHub Pages Deployment

## Scope

The owner authorized publication of the calendar preview alongside the existing
documentation website. The preview has incomplete holiday coverage and has not
passed all installed-device, accessibility or language acceptance gates.

Repository: [PWA-MY-SG-Calendar](https://github.com/yapweijun1996/PWA-MY-SG-Calendar).
Intended site: [project website](https://yapweijun1996.github.io/PWA-MY-SG-Calendar/).
Calendar preview: [open calendar](https://yapweijun1996.github.io/PWA-MY-SG-Calendar/calendar/).
The repository Pages API was read back with `build_type: workflow`.

## Build and publication

Use Node.js 24 in GitHub Actions; the package supports Node.js 22 or newer.
The project uses a pinned npm lockfile. Run `npm ci`, `npm run build`,
`npm run check`, `npm run check:app` and `npm run build:app`.

Source: `site/` plus the explicit public document allowlist in
`scripts/build-site.mjs`. Output: ignored `dist/`. Do not hand-edit output.
The site uses relative links for the repository subpath. It requires no API keys,
runtime JavaScript, external fonts, analytics, database or service worker.

Only selected project documents become HTML. Agent governance, KB preference
records, local task history and unrelated files are not copied into the website.
The documentation build emits `build.json` with the full source commit. After the
documentation allowlist check, the workflow copies only the built `dist-app/`
output into `dist/calendar/`. The application build embeds `GITHUB_SHA` as its
build ID. The relative Vite base keeps app assets and worker scope under the
repository subpath. No repository source, unpublished research or local artifacts
are copied to the published directory.

## Workflow

`.github/workflows/pages.yml` runs a clean install, build and checks on main pushes
and pull requests. Pull requests validate only; main pushes and explicit dispatches
may deploy. The deploy job depends on the successful build and uses the
`github-pages` environment with `pages: write` and `id-token: write`; the default
workflow permission is `contents: read`.

The workflow follows [GitHub's custom Pages workflow contract](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
Do not enable a second branch-based publishing workflow for the same site.

## Verification and recovery

Local checks validate the nine generated documentation pages, links, build identity
and publication allowlist before app assembly. Live verification must compare
`build.json` and the app's build ID with the pushed SHA, open the calendar at the
actual subpath, load its data and verify the worker and warm offline reload.
Workflow success alone is not proof of the correct live artifact.

For recovery, revert the specific bad site change through an authorized focused
commit, rebuild and redeploy. Do not force-push or erase unrelated work. For the
first release there is no previous published artifact to roll back to; preserve
the first accepted commit as the subsequent recovery baseline.

Do not present desktop browser checks as installed-device or screen-reader acceptance.
