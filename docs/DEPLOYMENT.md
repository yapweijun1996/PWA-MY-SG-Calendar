# Documentation Website Deployment

## Scope

The owner authorized GitHub Actions and GitHub Pages, then explicitly selected a
project introduction and documentation website before implementing the calendar.
This deployment does not claim a working calendar or PWA installation/offline support.

Repository: [PWA-MY-SG-Calendar](https://github.com/yapweijun1996/PWA-MY-SG-Calendar).
Intended site: [project website](https://yapweijun1996.github.io/PWA-MY-SG-Calendar/).
The repository Pages API was read back with `build_type: workflow`.

## Build and publication

Use Node.js 24 in GitHub Actions; the package supports Node.js 22 or newer.
The documentation-only package uses a pinned Markdown renderer and npm lockfile.
Run `npm ci`, `npm run build`, then `npm run check`.

Source: `site/` plus the explicit public document allowlist in
`scripts/build-site.mjs`. Output: ignored `dist/`. Do not hand-edit output.
The site uses relative links for the repository subpath. It requires no API keys,
runtime JavaScript, external fonts, analytics, database or service worker.

Only selected project documents become HTML. Agent governance, KB preference
records, local task history and unrelated files are not copied into the website.
The build emits `build.json` with the full source commit for deployment readback.

## Workflow

`.github/workflows/pages.yml` runs a clean install, build and checks on main pushes
and pull requests. Pull requests validate only; main pushes and explicit dispatches
may deploy. The deploy job depends on the successful build and uses the
`github-pages` environment with `pages: write` and `id-token: write`; the default
workflow permission is `contents: read`.

The workflow follows [GitHub's custom Pages workflow contract](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
Do not enable a second branch-based publishing workflow for the same site.

## Verification and recovery

Local checks validate the nine generated pages, relative links/fragments, build
identity and publication allowlist. Visual/browser checks and live HTTP checks are
separate evidence. Read the live `build.json` and compare it with the pushed SHA;
then inspect the home page and linked documents. Workflow success alone is not
proof of the correct live artifact.

For recovery, revert the specific bad site change through an authorized focused
commit, rebuild and redeploy. Do not force-push or erase unrelated work. For the
first release there is no previous published artifact to roll back to; preserve
the first accepted commit as the subsequent recovery baseline.

Calendar application work will introduce a different build contract later. Keep
this documentation deployment clearly separate from unrun PWA/device acceptance.
