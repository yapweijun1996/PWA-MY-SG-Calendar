# Development Guide

Status: documentation baseline and proposed workflow. Baseline: 2026-11-12.

## Actual setup

The repository started with `.gitattributes` only. A documentation-site package
now exists with a pinned npm lockfile: `npm ci`, `npm run build`, and `npm run check`.
These commands build and check the project website, not the calendar application.
See [deployment](DEPLOYMENT.md) for the explicitly authorized Actions/Pages workflow.
There is still no calendar application source or application test suite. When that
scaffolding begins, select compatible versions and document its actual commands.

## Coding conventions

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
| 6: later calendar coverage | MY/SG holiday packs, regional Hijri and selected Indian method | Remaining R01-R04 evidence and source review before claiming full coverage |

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
