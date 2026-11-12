# Verification and Release Readiness

Status: planned acceptance matrix. All application checks below are NOT RUN until
an implementation and recorded evidence exist. Baseline: 2026-11-12.

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
not establish conversion correctness, UI behavior or offline readiness. Other
calendar/holiday cases remain deferred, not passed or removed from full-product scope.

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
`.gitattributes` must remain unchanged. No app build or browser test can run before
the application exists; that is an explicit limitation, not a passing check.

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
This does not establish calendar/PWA release readiness. Application checks above
remain NOT RUN until implementation and their actual evidence exist.
