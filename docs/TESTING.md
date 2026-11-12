# Verification and Release Readiness

Status: local domain/storage/browser/PWA checks pass; full release acceptance is partial.
Updated: 2026-11-12.

## Local implementation verification

Environment: Windows, Node 25.2.1, npm 11.6.2, Chrome 157.0.8103.51 via
Playwright 1.65.0; working tree based on `2666491`. Four locales: en, zh-Hans,
ms, ta. This evidence supersedes the foundation-only scope below, not its history.

GitHub Actions run 43170966759 failed `npm ci` on Linux with Node 24.22.2 and
npm 11.19.1 because the lockfile omitted two optional `@emnapi` entries. The same
failure was reproduced on WSL Ubuntu with those exact versions. Regenerating the
lockfile in a clean Linux directory added the missing entries; a clean `npm ci`,
documentation build and documentation check then passed in that environment.

| Check | Result and evidence | Limit |
| --- | --- | --- |
| Types/lint/unit/integration | PASS, `npm run check:app`: 90 tests in 8 files | Includes arithmetic Hijri, MY source/scope/correction fixtures and cultural/official separation |
| HKO fidelity | PASS, all 730 dates plus 10 separately rendered PDF fixtures, leap representation and invalid-source rejection | Table fidelity, not independent astronomical proof |
| Saka | PASS, 20 reference dates and every day of six selected common/leap/century years compared with ICU | Named national calendar only |
| Arithmetic Hijri | PASS, six independent USNO references and every day of 2000-2030 against ICU; estimated date and SG holiday remain independent | Calculated civil estimate, not a local religious determination |
| Holiday integrity | PASS, 17 jurisdictions; 26 SG official, four SG cultural and 108 MY records; 12 BKPP date/state-column fixtures, real Kedah withdrawal, explicit extra/observed dates, six total observed links, incomplete/unknown/verified-empty and provisional/disputed states | MY annual snapshots and selected amendments only; remaining source gaps are not complete coverage |
| Storage | PASS, fake IndexedDB transaction abort/recovery/newer-schema rejection; MY import promotion and rollback preserve prior coverage, Chinese data and preferences; real browser persistence, storage denial and eviction | Storage is browser-managed and can be evicted |
| Browser journeys | PASS, 20 dev/production Chrome cases: four locales, three widths, keyboard, 320px reflow, reduced motion, dialog focus, failed validation, stale verification, rapid region switches, reload, three device timezones, Hijri/holiday disagreement, MY correction and region/year source filtering | Desktop automation, not real mobile installation |
| Automated accessibility | PASS, axe WCAG A/AA rule tags on main/settings; keyboard focus and selection | No screen-reader or complete WCAG conformance claim |
| Actual N-to-N+1 lifecycle | PASS, `npm run test:pwa`, builds `test-1794465784763-N` / `-N1`; `/calendar/` base | Local host only |
| Offline/recovery | PASS, warm shell+Chinese+SG+MY packs, corrected Kedah birthday and incomplete notice after offline restart, missing pack after eviction, cold visit fails honestly, explicit defer/update, per-tab reload, worker fetch failure/retry, foreign cache preserved | Actual devices NOT RUN |
| Production dependencies | PASS, `npm audit --omit=dev`: zero findings | Full audit has four low build-tool findings; see DEVELOPMENT |
| Clean install and reproducibility | PASS, `npm ci --engine-strict`; fixed-build-ID app builds have identical SHA-256 for all 14 output files; data rebuild preserves manifest identity | Same verified local toolchain, not cross-OS reproducibility |
| Human language review, screen reader, installed Android/iPhone/iPad, live application | NOT RUN | Required remaining gates |

Runtime captures are in ignored `test-results/foundation-*/calendar-*.png`.
`test-results/pwa/evidence.json` records exact two-build identities and Chrome
version; `offline-subpath.png` records the warm offline UI. Re-running Playwright
replaces these local artifacts; keep required release evidence separately.

An initial region-switch test used an exact HTML-label locator that included
option text. The accessible combobox name was verified in the browser snapshot;
switching to its role/name locator resolved both failures. The complete 16-case
suite then passed. The later 18-case suite found a narrow-screen source-link target
too close to its adjacent disclosure control. Targets were enlarged to 44px and
all 18 cases, including axe, then passed. An initial Workbox glob combination missed shell entries;
the fixed dependency combination generates populated precaches and passes real
offline relaunch. These failures were investigated, not waived as pre-existing.

The MY extension initially found two test-fixture mistakes: Israk/Mikraj was
mistyped as January 16 instead of January 17 (confirmed against the rendered
BKPP 2026 table), and an assertion assumed an irrelevant order for two coincident
holidays. The data was already correct. A parallel run under concurrent browser
build load exceeded the unchanged five-second limit in two existing tests.
Limiting Vitest to two workers resolved contention; the complete 90-test command
then passed in 4.14 seconds without relaxing assertions or timeouts. All 20 browser
cases passed. The production Kedah correction screenshot was visually inspected;
its source links and incomplete coverage are readable at 390px.

## Local preview artifact

Build `preview-20261112-02` is the current local engineering preview, not a
qualified public release. It contains the uncommitted working-tree implementation
based on `266649144e63`. The ignored archive is
`.site-preview/releases/calendar-preview-20261112-02.zip`; its SHA-256 is
`b76b84e72210c822116bf139425193f0c83a1c2c57b97b68fd72ea5c07613165`.
`artifact.json` records 14 relative file hashes, schema 1 identities and versions:

- Chinese: `hko-2026-2027-862287abf7fa`.
- Holidays: `holidays-2026-2027-2933dc6f80cd`.

The packaged directory passed all file-hash checks, fresh Chrome startup, exact
build identity, corrected Kedah holiday, incomplete coverage notice and warm
offline reload with selected date and region preserved. Evidence:
`test-results/preview-20261112-02.json`. Serve its `app/` directory using local HTTP
or an authorized HTTPS preview; opening `index.html` as a file does not provide
the PWA runtime. `npm run preview:app` serves the matching current `dist-app/` build.
These ignored artifacts are local delivery evidence; rebuild from pinned sources
and curation with a fixed `CALENDAR_BUILD_ID` after a fresh checkout.

The earlier `preview-20261112-01` archive remains untouched as a compatible local
baseline. It predates MY ingestion and is not the current preview.

## Remaining acceptance gates

- Independent four-language content review, including event proper names.
- Screen-reader journeys, actual text zoom and installed safe-area behavior.
- Installed Android, iPhone and iPad launch/offline/update evidence.
- Complete MY special/replacement/amendment reconciliation and broader cultural observances;
  both MY annual schedule snapshots are now ingested.
  Owner-approved arithmetic Hijri estimates replace the regional mapping requirement;
  no MUIS data is distributed.
- Live read-back of the owner-authorized GitHub Pages calendar preview and a
  qualified release artifact after the remaining gates.

The project owner accepted data-maintenance responsibility. These unrun gates
keep T07, T12-T17 and T19-T21 partial or blocked as specified in task.md. T18 is
complete for the revised owner-selected methods. Remaining gates are not converted
to passes by desktop emulation, a successful build or an exception.

## Manual acceptance still required

| Surface | Environment/build/dataset | Status |
| --- | --- | --- |
| Chrome browser | Windows, Chrome 157.0.8103.51; local build; current manifest | PASS for automated journeys above |
| Installed desktop app | Record OS/browser/build and manifest versions | NOT RUN |
| Installed Android | Record physical device, Android/browser versions and build | NOT RUN |
| Installed iPhone | Record physical device, iOS/Safari versions and build | NOT RUN |
| Installed iPad | Record physical device, iPadOS/Safari versions and build | NOT RUN |
| Screen reader | Record NVDA/VoiceOver version, browser and input method | NOT RUN |

Use an authorized HTTPS preview for physical-device installation. Select
2026-02-17, switch SG/Johor and all four locales, change week start, restart the
installed app offline, then repeat a controlled N/N+1 update. Check safe-area
controls, portrait/landscape, text zoom, keyboard/focus and readable Tamil labels.
With a screen reader, traverse the grid, select a date, open/close settings and
read source/unknown/estimated states. Record expected versus observed results;
do not mark a device PASS from a desktop screenshot or installability metadata.

## T01 foundation verification

Scope: local working-tree application foundation on base commit `2666491`,
2026-11-12. Environment: Windows, Node 25.2.1, npm 11.6.2, installed Chrome
through Playwright 1.65.0. Dataset: none. Production JS artifact SHA-256:
`DDF25420B66D4B422ED8D6B656315874A5D2F4C6F91ADE6D8F1535CBB0BD53F2`.

| Check and observed result | Status | Evidence and limit |
| --- | --- | --- |
| Clean locked install with engine checks | PASS | `npm ci --engine-strict`; installation audit reports zero known vulnerabilities |
| Strict types and lint | PASS | `npm run check:app`; lint also rejects an unused TypeScript declaration supplied on stdin |
| React browser-entry wiring | PASS | One Vitest/jsdom smoke test in `app/src/main.test.tsx`; not calendar correctness |
| Production bundle | PASS | `npm run build:app`; separate `dist-app/` output |
| Dev and production preview | PASS | `npm run test:browser`; six Chrome cases at 390/768/1440 pixels, reload, no horizontal overflow, keyboard skip-link focus, no failed requests or console/page errors |
| Visual inspection | PASS for foundation only | Three production-preview screenshots reviewed in `test-results/foundation-foundation-loads-and-remains-usable-at-{width}px-production-preview/`; the outline shows keyboard focus, not a design frame |
| Existing documentation site | PASS | `npm run build` then `npm run check`; nine pages, local-link/build-identity/allowlist checks |
| Installed devices, screen reader, calendar conversions, region/locale switching, offline and N-to-N+1 updates | NOT RUN | Not established by T01; keep the requirement matrix below open |

The first browser-suite attempt could not bind preview port 4173 because another
process owned it. No browser case ran in that attempt. The app now uses port 4175;
all six cases passed after this configuration correction. Other processes were
not terminated. The test runner owns and stops its isolated servers/profiles.

T01 adds no manifest or service worker. Safe-area CSS and an opaque surface exist,
but installed iOS behavior is NOT RUN. Scroll helpers and dark-theme acceptance are
N/A for this static, light-only foundation screen. These exclusions are task scope,
not exemptions from the later PWA release gate.

## Requirement traceability

| Requirement | Required evidence before claiming completion |
| --- | --- |
| R01: calendar methods | Independent reference fixtures; leap/month/year boundaries; supported-range and unsupported-method behavior |
| R02: cultural festivals | Distinct observance/official labels; stable identities; source and uncertainty presentation |
| R03: MY/SG coverage | Validated jurisdiction list; national/local merge; Johor-to-Singapore switch; all supported subdivisions; verified coverage versus unknown; observed-date linkage |
| R04: four languages | Key completeness, reviewed sample translations, long labels/Tamil glyphs, locale switch without lost context |
| R05: platforms | Primary journeys at desktop/tablet/phone sizes; keyboard and screen reader; actual installed iPhone/iPad/Android checks for claimed support |
| R06: offline | Warm offline relaunch, cached and uncached year/region, interrupted refresh, storage rejection/eviction and honest recovery |

## Boundary checks

For the owner-selected Chinese-first milestone, use the HKO source/normalization
checks in [data sources and methods](DATA-SOURCES.md). Its Gregorian source coverage
check passed for 365 unique consecutive dates in each of 2026 and 2027; this does
not by itself establish conversion correctness, UI behavior or offline readiness.
Current implementation evidence is recorded above. Remaining source, human and
device checks are still required for full-product completion.

| Area | Cases |
| --- | --- |
| Date model | Regional midnight, device timezone changes, leap day, month/year navigation |
| Data integrity | Invalid dates/IDs, duplicate records, conflicting sources, missing attribution, incomplete coverage, withdrawn record |
| Storage | Atomic pack promotion, failed download, invalid replacement, version migration failure, preference retention |
| Worker update | N -> N+1 discovery, defer, explicit update, visible loader, duplicate click, failure, multiple tabs, reload and preference retention |
| Cache isolation | Delete only app-owned old caches; preserve another same-origin app's entries |
| UI | 390/768/1440 CSS-pixel reference screenshots plus narrower reflow, long content, focus and non-color status cues |
| PWA lifecycle | Manifest scope, start URL, installed launch, safe areas, opaque chrome, no overflow and reduced motion |
| Hosting | Actual deployment subpath, assets, worker scope, navigation/reload and data-pack URLs |

Use unit checks for pure date/applicability functions, integration checks for storage
and pack validation, browser E2E for user journeys, and installed-device checks for
platform-specific behavior. A mocked worker test does not replace a two-build browser
update test. Desktop emulation does not establish installed iOS behavior.

## Evidence format

For each meaningful check record requirement/case, commit/build, dataset version,
environment/device, setup, action, expected/observed result, PASS/FAIL/NOT RUN/N/A,
artifact reference and limitation. N/A needs a reason. A planned test is NOT RUN.
Do not give completion percentages or visual scores without a defined denominator.

## Documentation-only acceptance

Verify referenced local files and headings, code/status claims against the actual
tree, requirement-to-test coverage, source/proposal labels, and diff scope. Existing
`.gitattributes` must remain unchanged. Documentation checks establish only their
scope and cannot substitute for the implemented application's runtime evidence.

## Release gate and recovery

Before an authorized release, resolve relevant PRD decisions, verify data provenance
and licenses, run the affected checks, inspect screenshots and record any explicit
exceptions. Produce a reproducible artifact with app/data/schema identities and a
known previous artifact. Verify the deployed artifact and real user flow separately.

Plan rollback for shell and dataset together. A shell rollback must remain compatible
with stored data; destructive schema downgrade is not an acceptable default. Keep
the last validated compatible pack available and test that recovery path.

The owner separately authorized GitHub Actions/Pages for the introduction and
documentation site. Its workflow and checks are described in [deployment](DEPLOYMENT.md).
This does not establish calendar/PWA release readiness. The T01 evidence covers only the historical foundation. Current domain/PWA results
are recorded above; human/device/live gates remain NOT RUN.
