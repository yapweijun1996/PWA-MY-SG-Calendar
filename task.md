# Project Completion Tasks

Status: active execution backlog, 2026-11-12. T01-T06, T08-T11 and revised T18 are locally
verified. Full product delivery remains PARTIAL due to source, review, device and
publication gates. This file records actual evidence; it does not authorize release.

## Objective and baseline

Deliver R01-R06 in the [PRD](docs/PRD.md), beginning with its Chinese-first
milestone: Gregorian navigation and Chinese lunar month/day information for
2026-01-01 through 2027-12-31 using `hko-table`.

The current implementation includes pinned HKO lookup data, Saka and estimated
arithmetic Hijri, Singapore public holidays, Malaysian annual holidays and selected
amendments, four locales, region filtering, transactional storage,
offline shell and explicit worker updates. Tests are recorded in TESTING. The tree
also includes a documentation-site package/lockfile, build/check
scripts, `site/` and a Pages workflow, described in [deployment](docs/DEPLOYMENT.md).
These are documentation-site artifacts, not a calendar implementation or PWA
acceptance evidence. Local documentation build/check regressions passed for T01;
its publication status is separate from the application.

Preserve existing uncommitted work, including the Chinese-first documents and
documentation website. The verified setup is in DEVELOPMENT; future paths and
commands remain proposed until created and checked.

## Document and execution ownership

| Owner | Authoritative document |
| --- | --- |
| Requirements, milestone scope and product choices | [PRD](docs/PRD.md) |
| Selected methods, sources and normalization criteria | [Data sources and methods](docs/DATA-SOURCES.md) |
| Date, holiday, provenance and coverage semantics | [Data contract](docs/DATA-CONTRACT.md) |
| Boundaries, state ownership and recovery | [Architecture](docs/ARCHITECTURE.md) |
| Interactions and visual direction | [UI standard](docs/UI-STANDARD.md) |
| Acceptance evidence and release gates | [Testing](docs/TESTING.md) |
| Actual setup commands and staged roadmap | [Development](docs/DEVELOPMENT.md) |
| Existing documentation-site build/publication | [Deployment](docs/DEPLOYMENT.md) |
| Reusable procedure selection | [Skills and evidence](docs/SKILLS-AND-EVIDENCE.md) |
| Task order, dependencies and progress | This file |

Use `agent:auto-manager` for bounded delivery and evidence review; version 1.4.0
was read for this plan. Load the PWA/UI/coding procedures identified in the evidence
guide when their work starts. Follow [AGENTS.md](AGENTS.md) and host permissions.
Reading this plan does not start workers, trigger hosted CI or authorize a release.

The primary agent owns authorized implementation and final verification.
The product owner resolves material scope choices; domain/language reviewers
verify content; device testers supply installed-device evidence. These are roles,
not claims that workers or people have already been assigned.

Record actual owner, status, evidence and blocker under each task when work starts.
Use TODO, IN PROGRESS, BLOCKED, IMPLEMENTED / NOT VERIFIED or DONE. Check a box
only when its acceptance evidence exists. Evidence uses PASS/FAIL/NOT RUN/N/A
with build, dataset, environment, steps, result and artifact reference per TESTING.
Continue independent ready tasks when another task has a concrete dependency.

## Decision gates

Record decisions in the owning document and reference them here. Do not reopen
the selected Chinese-first baseline because later methods remain deferred.

| Gate | Current state | Remaining decision and affected work |
| --- | --- | --- |
| D01: first scope/range | SELECTED in PRD | Chinese-first, 2026-2027; expansion needs new source/fixture review |
| D02: calendar methods | SELECTED | Chinese `hko-table`, Indian national Saka and owner-approved arithmetic Hijri estimate; official holidays independently verified |
| D03: data authority/maintenance | PARTIAL | HKO and MOM sources pinned; project owner accepted maintenance; MY coverage/amendments unresolved |
| D04: interaction/design | APPROVED | Owner accepted v1; light neutral/green, desktop right detail/mobile below, Monday configurable; visible SG default |
| D05: licensing/languages | PARTIAL | Owner selected MIT; data notices and dependency inventory implemented; competent language review pending; no MUIS redistribution permission |
| D06: calendar publication | AUTHORIZED PREVIEW | Owner authorized the existing GitHub Pages workflow to publish a calendar preview at `/calendar/`; live verification and full release gates remain separate |

Deferred methods and full MY/SG holiday research do not block the Chinese
milestone. Do not display nonfunctional region/holiday selectors. Four-language
architecture and PWA/platform requirements remain in scope.

## Milestone 1: Chinese calendar foundation

- [x] **T01 - Scaffold a reproducible local application.**
  Status: DONE. Owner: primary Codex agent. Verified: 2026-11-12.
  Evidence: [T01 foundation verification](docs/TESTING.md#t01-foundation-verification).
  Dependencies: none.
  Select compatible React/TypeScript/Vite and runtime/package-manager versions,
  one lockfile, strict types and local lint/unit-test/build tooling.
  Inspect and preserve the existing documentation-site package/build contract;
  integrate the calendar deliberately without replacing unrelated site work.
  Acceptance: a minimal screen runs; actual install/dev/check/build commands work
  and are documented in DEVELOPMENT. Existing documentation-site checks remain
  valid; no additional hosted workflow or deployment is enabled as a side effect.

- [x] **T02 - Pin and normalize HKO source data.**
  Status: DONE. Owner: primary Codex agent. Pinned two sources, reproducible 730-day pack,
  hash checks, rejection tests and 10 separately rendered PDF fixtures verified.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T01; selected baseline in DATA-SOURCES.
  Pin 2026/2027 inputs with retrieval dates, SHA-256, version and attribution;
  generate the lookup pack reproducibly. Parse dates explicitly, normalize lunar
  numeric month/day and leap-month flag, reject unknown labels and preserve source
  metadata without inferring lunar year from Gregorian year.
  Acceptance: all DATA-SOURCES normalization criteria are exercised; both years
  have complete unique consecutive coverage. Separately reviewed table fixtures
  verify import fidelity; CSV/PDF agreement is not independent astronomy proof.
  Review notices before packaging; runtime does not fetch CSVs on every page view.

- [x] **T03 - Implement date-only domain and Chinese lookup.**
  Status: DONE. Owner: primary Codex agent. Pure civil-date and HKO adapter tests pass;
  browser date identity verified in Honolulu, UTC and Singapore timezones.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T01, T02.
  Implement civil arithmetic, injected clock/regional today policy and the pure
  adapter contract with method/version/range and typed unavailable results.
  Acceptance: every covered date resolves; leap-day arithmetic, month/year and
  Lunar New Year boundaries, timezone invariance and adjacent-date navigation
  pass. Exercise leap-month representation with a labelled synthetic/out-of-range
  fixture without expanding advertised support. Leading/trailing grid days outside
  2026-2027 never receive invented lunar labels.

- [x] **T04 - Establish the Chinese-calendar UI direction.**
  Status: DONE. Owner: project owner (approval), Codex (design). Owner accepted v1 on
  2026-11-12; anchors and feedback recorded in UI-STANDARD.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: PRD/UI standard; D04 for final direction.
  Prepare desktop/mobile month, day-detail and settings samples with source/range
  visibility. Define keyboard navigation, focus, week start, theme and long labels.
  Acceptance: samples and feedback have explicit draft/approved anchor status;
  later holiday/region flows are not presented as working controls.

- [x] **T05 - Build the month and selected-day experience.**
  Status: DONE. Owner: primary Codex agent. Chrome keyboard, month/day, date jump,
  unavailable-range and responsive journeys pass.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T03, T04.
  Implement Today, previous/next month, date selection and Gregorian/Chinese
  details, including method, source and unsupported-range presentation.
  Acceptance: mouse/touch/keyboard journeys work; today, selection and focus have
  distinct non-color cues; boundary months and source details are usable.
  No unreviewed festivals or astrology features are implied.

- [x] **T06 - Add four-language UI and preference contracts.**
  Status: DONE. Owner: primary Codex agent. Four typed catalogs and locale/context
  persistence tested, including Tamil rendering. Independent review remains T07.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T05.
  Implement `en`, `zh-Hans`, `ms` and `ta` catalogs, locale switching and one
  preference-storage interface. Keep stable IDs/date logic independent of labels.
  Acceptance: switching locale preserves date/month; controls, errors, statuses and
  accessibility text have key coverage; Tamil glyphs and long labels render.
  Track fallback/review state and session-only behavior. Durable reload behavior
  belongs to T08; competent content review belongs to T07.

- [ ] **T07 - Complete licensing, attribution and language review.**
  Status: BLOCKED. Owner: project owner / independent language reviewers.
  MIT selected; original icons, HKO/MOM attribution and dependency inventory exist.
  Project owner accepted data maintenance. Competent four-language review is NOT RUN.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T02, T06; D05.
  Inventory application/dependency/font/icon/data licenses; arrange competent
  four-language review, including proper names and normalized Chinese labels.
  Assign a data-refresh/review owner before release.
  Acceptance: rights/attribution records, reviewed samples and limitations are
  explicit. Separate publication artwork does not inherit open-data rights by
  assumption; fallback text is not automatically a reviewed translation.

## Milestone 2: offline Chinese-calendar PWA

- [x] **T08 - Implement transactional storage and recovery.**
  Status: DONE. Owner: primary Codex agent. Atomic per-pack promotion, prior-pack
  recovery, invalid/aborted refresh, unavailable storage, eviction, newer-schema
  rejection and preference retention tested. No destructive migration.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T02, T06.
  Persist validated packs/preferences in IndexedDB; stage replacements before
  atomic promotion and retain the last compatible validated pack.
  Acceptance: interrupted/invalid refresh, duplicate/invalid data, storage rejection,
  eviction and migration failure are exercised. Preserve preferences; distinguish
  app-build, dataset and schema identities. Session-only browsing does not claim
  durable offline readiness.

- [x] **T09 - Implement manifest and offline application shell.**
  Status: DONE for automated Chrome acceptance. Owner: primary Codex agent.
  Scoped manifest/Workbox shell and local icons verified at /calendar/;
  warm offline launch and cold/evicted-data limits tested. Devices remain T13.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T05, T08.
  Add scoped Workbox caching, manifest/icons/start URL and configurable base path.
  Keep essential fonts/scripts offline and caches app-namespaced.
  Acceptance: the built app relaunches offline after a warm visit; cached versus
  uncached/out-of-range data is explicit. Test a representative hosting subpath.
  Do not promise offline access on a cold first visit.

- [x] **T10 - Implement explicit coordinated updates.**
  Status: DONE for automated Chrome acceptance. Owner: primary Codex agent.
  Real N/N+1 test covers defer, explicit activation, per-tab reload control,
  retained preferences, worker-fetch failure/retry and foreign-cache preservation.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T08, T09.
  Provide waiting-worker discovery, defer and deliberate update with immediate
  progress, duplicate-action prevention, controlled reload and multi-tab handling.
  Acceptance: a real browser runs build N then N+1 through defer, update and failure;
  date/preferences survive. Cleanup preserves another same-origin app's entries.
  Mocked worker tests alone do not complete T10.

- [x] **T11 - Integrate availability and failure states.**
  Status: DONE. Owner: primary Codex agent. UI tests cover invalid data, unavailable
  range, session-only storage, stale verification and refresh recovery; PWA test
  covers cached and uncached offline launch.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T08-T10.
  Expose loading, unavailable range/pack, offline-cached, offline-uncached, stale,
  invalid data, storage-unavailable and update-failure states through the real UI.
  Acceptance: verification age differs from download time; failed refresh retains
  the last valid pack; recovery actions work. Later holiday empty/conflict/coverage
  states remain tracked under T17/T19.

## Milestone 3: Chinese-calendar acceptance and release

- [ ] **T12 - Verify responsive UI and accessibility.**
  Status: IMPLEMENTED / NOT VERIFIED. Owner: primary Codex agent / accessibility reviewer.
  Automated axe, keyboard, 320/390/768/1440 reflow and visual checks pass.
  Real screen-reader and installed safe-area/zoom journeys remain NOT RUN.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T06, T11.
  Inspect real 390/768/1440 CSS-pixel screenshots plus narrower reflow, long content,
  keyboard/focus, zoom, contrast, reduced motion and screen-reader journeys.
  Acceptance: safe areas and opaque app chrome work; implemented themes are coherent.
  Record automated, visual and screen-reader evidence separately against the
  WCAG 2.2 AA target; automation alone does not establish conformance.

- [ ] **T13 - Verify installed-device and browser journeys.**
  Status: BLOCKED. Owner: device tester. Desktop Chrome is tested; no actual installed
  Android, iPhone or iPad evidence is available. Emulation is not a substitute.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T09-T12; access to representative real devices.
  Exercise launch, navigation, locale changes, offline relaunch and updates on
  claimed desktop browsers and installed Android, iPhone and iPad surfaces.
  Acceptance: device/OS/browser/build/dataset and results are recorded. Emulation
  does not prove installed support; unavailable devices remain NOT RUN and prevent
  an unqualified platform-completion claim.

- [ ] **T14 - Produce the Chinese-first release candidate.**
  Status: IMPLEMENTED / NOT VERIFIED. Owner: primary Codex agent.
  Reproducible local preview `preview-20261112-01` and recovery harness exist;
  the packaged artifact passed offline smoke checks. Release readiness is blocked by
  independent language/accessibility/device evidence. No qualified release claim.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T01-T13; applicable D03-D05 decisions.
  Close applicable TESTING cases, review the diff/imported-text safety, build a
  reproducible artifact and document compatible shell/dataset recovery.
  Update README/owning docs with actual commands, capabilities and limitations.
  Acceptance: Chinese R01 and applicable R04-R06 have evidence; full R01-R03 remain
  explicitly partial. Retain a tested local recovery baseline for the first release
  and a known previous artifact thereafter. No destructive schema downgrade.

- [ ] **T15 - Publish and verify the authorized milestone release.**
  Status: IN PROGRESS. Owner: project owner / deployment owner. A GitHub Pages
  preview is authorized; workflow deployment and live verification are required.
  T14's release gates remain incomplete, so the preview is not a qualified release.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T14, D06 and applicable release gates.
  Use one deployment owner and the selected process. Verify published identity,
  actual URL/subpath, assets, packs, manifest/worker scope, reload and user journeys.
  Acceptance: live evidence and recovery references are separate from local checks;
  upload success alone is not functional acceptance. Local development and T16-T20
  do not depend on publication authorization.

## Milestone 4: complete the multicultural product

- [ ] **T16 - Complete jurisdiction and official-source coverage.**
  Status: IN PROGRESS. Owner: project owner (data), Codex (register).
  All 17 codes are verified. SG 2026/2027 and both MY BKPP annual schedules are
  ingested. MY includes 99 annual records, selected additions and the Kedah date
  correction: 108 records including one withdrawn original. All 32 MY public
  region/year rows explicitly say incomplete. The remaining amendment/replacement
  sources and access gaps are recorded in [DATA-SOURCES](docs/DATA-SOURCES.md#my-remaining-evidence-gaps).
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: DATA-SOURCES research; full-product year scope and D03 review.
  Verify Singapore, all 13 Malaysian states and 3 federal territories, stable codes,
  annual national/local sources, amendments and data rights.
  Acceptance: source register and explicit gaps exist by jurisdiction/year/category
  with publisher, retrieval/verification dates and reviewer. Resolve missing
  coverage before claiming full R03; source discovery is not verified ingestion.

- [ ] **T17 - Add holiday/observance packs and applicability queries.**
  Status: IN PROGRESS. Owner: primary Codex agent. Runtime validation, stable IDs,
  observed links, national/local merge and status/coverage queries are tested;
  The combined pack has 26 SG official, four SG cultural and 108 MY records.
  Broader cultural coverage and complete MY special/replacement coverage remain
  incomplete; missing dates are not presented as verified working days.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T08, T16.
  Implement runtime-validated records, stable IDs, provenance/status, observedFor
  linkage and national/local merge without duplicates. Curate Chinese and other
  cultural observances separately from official holidays; never infer substitute
  dates or statutory leave from calendar calculations.
  Acceptance: verified-empty versus unknown coverage, conflicting/provisional/
  withdrawn records, invalid IDs/dates and all supported subdivisions are tested.
  Version corrections and validate replacements before promotion.

- [x] **T18 - Add named Hijri and Indian-calendar support.**
  Status: DONE for revised owner-approved method scope. Owner: primary Codex agent.
  Saka and independently written arithmetic Hijri support 1900-2100. The owner
  approved explicit estimate labels and independent official-holiday verification.
  USNO/IMD fixtures, ICU comparisons and disagreement behavior are tested.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T03; D02 decisions and source/license evidence.
  Scope revision by owner, 2026-11-12: implement arithmetic `islamic-civil`
  rather than a licensed regional mapping; label it as an estimate and preserve
  official holiday authority separately. Indian method: national Saka.
  Acceptance: independent reference fixtures cover ranges, boundaries, full leap
  cycle, disagreements and unavailable results; algorithm dates never generate
  or move an official holiday. Do not claim MUIS/JAKIM confirmation.

- [ ] **T19 - Integrate full regional and multicultural flows.**
  Status: IMPLEMENTED / NOT VERIFIED. Owner: primary Codex agent.
  Working 17-region selector, region/year-scoped provenance, Saka/Hijri, incomplete/unknown coverage and rapid
  switches are tested. Full source coverage and competent language review pending.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T06, T17, T18; region-default decision under D04.
  Add working region selection, calendar details, event provenance and clear
  holiday/observance distinctions. Extend all four reviewed language catalogs.
  Acceptance: Johor-to-Singapore and rapid region switches cannot leak stale results;
  locale switches preserve region/date/identity. Covered-empty, incomplete,
  conflicting, cached and uncached region/year states work in the UI.

- [ ] **T20 - Close the full requirement and regression matrix.**
  Status: IN PROGRESS. Owner: primary Codex agent. Domain/storage/browser/PWA evidence
  recorded in TESTING; full R01-R06 remain partial where sources or human/device
  acceptance are unavailable.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T19; extend T10, T12 and T13 evidence for changed surfaces.
  Verify every R01-R06 row and applicable TESTING boundary with domain, data,
  storage, browser, accessibility and installed-device checks.
  Acceptance: required results identify build/dataset/environment and artifacts.
  Investigate failures; unavailable checks stay NOT RUN. An exception or partial
  milestone does not become unqualified full-product completion.

- [ ] **T21 - Complete full-product delivery and maintenance handoff.**
  Status: BLOCKED. Owner: project owner / deployment owner. Maintenance owner and steps
  are recorded. Full data, review/device gates and authorized live acceptance
  remain incomplete; no completed live release is claimed.
  Evidence: [Local implementation verification](docs/TESTING.md#local-implementation-verification).
  Dependencies: T20, applicable D03-D06 decisions.
  Refresh T14's artifact/recovery preparation and repeat T15's authorized live
  acceptance for the expanded product. Document review cadence, correction owner,
  compatible rollback and actual supported ranges/platforms.
  Acceptance: full R01-R06 evidence, current docs, verified published identity/user
  flow and maintenance handoff. If publication is pending, report a local release
  candidate rather than a completed live release.

## Requirement traceability

| Requirement | Chinese-first evidence | Remaining full-product work |
| --- | --- | --- |
| R01: calendar methods | T02-T05 and revised T18 methods verified locally | T20 final cross-platform regression |
| R02: cultural festivals | T17: selected SG Dragon Boat/Mid-Autumn observances; incomplete coverage explicit | T16-T17 broader curation; T19-T20 |
| R03: MY/SG coverage | T16-T19: 17-region selection, SG pack, MY annual schedules and selected corrections with incomplete coverage | T16-T17 remaining MY amendments/replacements; T20 |
| R04: four languages | T06-T07, T12-T14 | T19 expanded catalogs/review; T20 |
| R05: platforms | T12 accessibility; T13 real devices; T14 | Repeat affected journeys in T20 |
| R06: offline | T08-T11, T13-T14 | T19 regional packs; T20 regression |

## Completion and next executable work

Local Chinese/Saka/estimated Hijri/SG holiday functionality and Chrome offline/update journeys
are verified. Continue with permitted MY annual/amendment
sources, broader cultural curation and human/device acceptance. No unavailable source,
review or device is marked as completed. Publication remains a separate gate.

T14 is a local Chinese-first release candidate, T15 its authorized published
release, and T21 full multicultural delivery. Preserve this distinction in reports.
Do not invent a completion percentage or launch date.

Accounts, personal scheduling, cloud sync, notifications, generative AI,
PostgreSQL, Rust/WASM, astrology and auspicious-hour features remain outside
this backlog unless the PRD changes through a separately scoped decision.
