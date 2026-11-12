# Development Guide

Status: implemented local application and maintenance workflow. Updated: 2026-11-12.

## Actual setup

The calendar foundation and documentation site share the root package and one npm
lockfile. Use Node.js 24 LTS (or the compatible range in `package.json`) and npm.
The local verification environment is recorded in TESTING. Install with `npm ci`;
on Windows use `npm.cmd` if PowerShell blocks the npm script shim.

| Command | Purpose |
| --- | --- |
| `npm run dev:app` | Local calendar at `http://127.0.0.1:5173` |
| `npm run typecheck:app` | Strict TypeScript checks without emitting files |
| `npm run lint:app` | ESLint checks of app source and Vite configuration |
| `npm run test:app` | Domain, pack, IndexedDB integration and entry tests |
| `npm run check:app` | Typecheck, lint and test in sequence |
| `npm run build:app` | Typecheck and production app build into `dist-app/` |
| `npm run preview:app` | Serve the built app at `http://127.0.0.1:4175` |
| `npm run test:browser` | Build, start isolated dev/preview servers and test both in installed Chrome |
| `npm run test:pwa` | Build N/N+1 in temporary directories; test subpath offline/update/failure/multi-tab behavior |
| `npm run data:build` | Reproduce Chinese and combined MY/SG holiday packs from pinned bytes and curated facts; no network |
| `npm run icons:build` | Render the original SVG to PNG icons using local Chrome |
| `npm run licenses:build` | Regenerate dependency inventory and distributed license notices |
| `npm run build` | Existing documentation build into `dist/` |
| `npm run check` | Validate the built documentation website |

Run a build before its preview/check command. Ports are strict: an occupied port
produces an error rather than silently serving another URL. Stop a local server
with Ctrl+C. `preview:app` is a local inspection server, not a production host.
Browser tests require locally installed Google Chrome; they use a fresh automated
profile and leave user profiles alone. Stop manual app servers before running the
suite so its strict ports are free. Screenshots are generated in ignored
`test-results/`; they are runtime evidence. Approved design anchors remain in `design/`.

The app entry is `app/index.html` -> `app/src/main.tsx` -> `App.tsx`.
Pure domain modules own dates, Chinese lookup, Saka and Hijri arithmetic, jurisdiction
validation and holiday applicability. `data/repository.ts` validates downloaded
packs and owns IndexedDB. `use-calendar.ts` coordinates loading/preferences;
`pwa/use-pwa.ts` owns explicit updates. Four catalogs keep labels outside date logic.

`vite.app.config.ts` owns the app root/output and test configuration;
Vitest uses at most two workers to avoid resource contention in local browser/DOM tests.
`tsconfig.app.json` enables strict checking. App build output is isolated from the
documentation publication allowlist. The authorized Pages workflow first checks the
documentation allowlist, then copies `dist-app/` into `dist/calendar/` for deployment. See
[deployment](DEPLOYMENT.md) for the documentation-site release contract.

Direct dependencies are pinned in the package and transitive dependencies in the
lockfile. TypeScript 6 fits the selected typescript-eslint peer range; Vitest 4 and
jsdom 27 accommodate the local Node runtime. Workbox 7.4.1 and vite-plugin-pwa
2.0.0 provide the compiled worker; no third-party conversion library is needed.

The `minimatch` override pins 11.0.1 for the ESLint dependency tree to address
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
It crosses the upstream major range. `glob` is pinned to 14.0.5 for
[GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4);
the older glob dependency combined with minimatch 11 failed to discover shell
files. The current build reports populated precache entries and the offline test
verifies them. Retain lint and actual precache/offline checks when updating either
override; remove overrides when upstream dependencies adopt compatible fixed ranges.

The full audit retains four low-severity development-tree findings propagated from
unpatched deepmerge 4.3.1 in Workbox's Rollup tooling
([advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)). Build configuration
is repository-controlled; the calendar does not pass downloaded data to this tool.
Production dependency audit has zero findings. This is a recorded limitation, not
a claim that the complete dependency tree is vulnerability-free.

Configuration references: [Vite](https://vite.dev/guide/),
[Vitest](https://vitest.dev/guide/),
[typescript-eslint](https://typescript-eslint.io/getting-started/) and
[React createRoot](https://react.dev/reference/react-dom/client/createRoot).

## Licensing and distribution

Code and original SVG/PNG icons use the owner-selected MIT license. System fonts
are used; no font files are bundled. `npm run licenses:build` creates an inventory
of all 552 locked dependency entries and copies the full MIT notices for React,
React DOM, Scheduler and Workbox into the distributable application. The root
license is copied as `app/public/LICENSE.txt`. All inventory entries have explicit
license metadata; this inventory does not replace each package's actual terms.

HKO and MOM data retain their own terms and visible attribution. Curated MY holiday
facts and festival rules contain only factual names/date relationships and references; publisher
prose, PDF artwork and logos are not distributed. Saka and arithmetic Hijri are
independently written algorithms with reference fixtures. No MUIS mapping is used.
Human translation review is still pending; original strings are not advertised as
independently reviewed merely because the catalogs are complete.

## Maintenance and correction ownership

The project owner accepted ongoing source review, data updates and corrections
on 2026-11-12. Review upcoming annual publications monthly and before each release;
check official amendments when notified. Verification age is shown separately from
download time; the UI flags Chinese data after 90 days without verification.

1. Obtain the authoritative annual source and its amendments, confirm applicable
   redistribution terms, and retain permitted raw bytes plus retrieval timestamp,
   SHA-256, coverage, publisher and reviewer. Do not overwrite a published source
   snapshot in place. The one-shot `pin-*.mjs` scripts refuse existing files.
2. Review every changed date, jurisdiction, provisional marker and observed link.
   Never derive a substitute holiday from weekday arithmetic. Update the source
   register and independent fixtures; keep missing coverage explicitly unknown and
   partial coverage incomplete. MY facts and source fingerprints belong in
   `data/curated/my-holidays.json`; add explicit `confirm`, `replace-date` or `add`
   changes with evidence instead of silently overwriting annual entries. Preserve
   the distinction between original source byte hashes and curated-reference hashes.
3. Update the owning importer/configuration, then run `npm run data:build` twice
   and compare generated hashes. Run `npm run check:app`, affected browser tests,
   and `npm run test:pwa` when stored data or update surfaces change.
4. Regenerate notices after dependency changes. Obtain independent language review
   for changed labels. Record actual devices and screen-reader results in TESTING.
5. Build with an explicit `CALENDAR_BUILD_ID`, preserve the prior compatible
   artifact and its dataset manifest, then use the separately authorized deployment
   process. Verify the live identity, path, offline launch and update behavior.

Schema 1 recovery retains the last valid pack. For a correction, publish a new
validated pack/version; do not delete user storage. For a shell rollback, rebuild
the known compatible source with a fresh build ID so the worker offers it as an
explicit update. Do not roll the IndexedDB schema backwards. The local two-build
test is a recovery exercise; no live rollback or previous qualified release exists.

## Implementation conventions

Apply SCMC: Simple, Clear, Modular, Consistent. Prefer the smallest complete change
with explicit responsibility and testable behavior. Keep domain rules outside UI
components, distinguish business data from presentation, and avoid premature
frameworks or general-purpose engines.

Keep source, comments, identifiers and technical docs in English. User-facing
messages belong in localized catalogs. Prefer strict typed contracts at external
data/storage boundaries; validate runtime inputs rather than trusting TypeScript
types to validate downloaded JSON. Select lint/format tools when the toolchain exists.

Use configuration for legitimate region/method variation, but do not abstract every
literal. Versioned, reviewed holiday data is legitimate data; unexplained holiday
dates embedded in rendering code are not an authoritative catalog.

Inspect callers and ownership before existing-code edits, use bounded source slices,
define must-change/must-preserve behavior, then run focused checks. Keep generated
output tied to its source. Do not refactor unrelated code to satisfy a style preference.

## Delivery roadmap

| Stage | Deliverable | Exit evidence |
| --- | --- | --- |
| 0: Chinese-first data baseline | 2026-2027 HKO mapping, normalization and source attribution | Complete coverage plus independently reviewed boundary fixtures |
| 1: UI direction | Month/day/region flows and responsive samples | Recorded design feedback and explicit anchor status |
| 2: application foundation | React/TypeScript toolchain and domain/repository contracts | Verified commands, focused domain checks and visible first screen |
| 3: first calendar | Gregorian + Chinese lunar month/day view, localization structure | Chinese subset of R01 and explicit partial-product status |
| 4: offline/PWA | Versioned packs, persistence, manifest and update lifecycle | Offline/storage and two-build worker tests |
| 5: release candidate | Accessible cross-device calendar and reproducible artifact | Relevant matrix complete; device gaps/exceptions explicit |
| 6: multicultural coverage | Complete MY/SG holiday packs and cultural curation; selected Saka and estimated Hijri methods | Remaining R01-R04 evidence and source review before claiming full coverage |

Stages describe dependencies rather than fixed dates. The roadmap itself starts no
worker or background scheduler. The documentation website's separate Actions/Pages
authorization does not mark calendar implementation or PWA acceptance complete.

## Documentation ownership

Update the existing owning document instead of adding parallel PRD/SPEC/DESIGN files
with the same responsibilities. README is the entry point, not the detailed spec.
AGENTS contains constraints, not task history. Skills remain canonical reusable
procedures. New verified implementation decisions can be recorded in focused ADRs
when the ownership/contract trade-off warrants one.

For KB writeback, check duplicates and identity; store only verified durable facts
through the approved workflow. Do not automatically copy these proposals into KB as
confirmed implementation or publish changed Skills as a side effect of coding.
