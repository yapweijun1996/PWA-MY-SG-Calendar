# PWA-MY-SG-Calendar

An offline-capable Malaysia and Singapore multicultural calendar in preview.

## Status

Local implementation, 2026-11-12: month/day navigation, HKO Chinese lunar dates
for 2026-2027, Indian national Saka and estimated arithmetic Hijri dates for
1900-2100, four UI locales,
17-region selection, Singapore public holidays, and Malaysian 2026-2027 annual
schedules with selected verified amendments. IndexedDB storage,
a scoped Workbox shell and user-controlled updates are implemented and tested in
Chrome. The owner approved the light neutral/green visual direction.

This is a partial product. Complete Malaysian special/replacement holiday coverage,
curated observances, independent language review,
screen-reader testing and installed-device acceptance remain incomplete. Incomplete
and unknown coverage are shown explicitly. The GitHub Pages workflow publishes the
[calendar preview](https://yapweijun1996.github.io/PWA-MY-SG-Calendar/calendar/).
See [task status](task.md) and [evidence](docs/TESTING.md).

The owner-selected first milestone is the Chinese calendar: Gregorian + Chinese
lunar month/day views. The engineering target is 2026-2027 using HKO annual data;
Saka and estimated Hijri are now implemented; full regional public holidays remain pending.

## Product intent

Bring Gregorian dates, Chinese lunar dates, Islamic Hijri dates, Indian cultural
festivals and verified regional public holidays into one calendar. Users select
Singapore or a Malaysian state/federal territory to view applicable information.
The target languages are English, Simplified Chinese, Bahasa Melayu and Tamil.
Target devices include desktop, Android, iPhone and iPad; platform support must be
proven through the acceptance matrix, not inferred from using web technology.

## Technology

| Responsibility | Current choice |
| --- | --- |
| UI | React + TypeScript |
| Build and PWA | Vite + Workbox |
| Calendar logic | Testable JavaScript/TypeScript adapters |
| Offline storage | IndexedDB |
| Static hosting | GitHub Pages preview under `/PWA-MY-SG-Calendar/calendar/` |
| Optional future work | Rust/WASM astronomy; PostgreSQL-backed services |

Dependencies are pinned in `package.json` and `package-lock.json`.
The GitHub Pages workflow publishes the documentation site and calendar preview.
See DEVELOPMENT for executable commands.

## Documentation map

| Document | Owns |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Project-specific agent constraints |
| [PRD](docs/PRD.md) | Requirements, proposed release scope and open product decisions |
| [Architecture](docs/ARCHITECTURE.md) | Implemented boundaries, state ownership and remaining proposals |
| [Data contract](docs/DATA-CONTRACT.md) | Date, holiday, source and coverage semantics |
| [Data sources and methods](docs/DATA-SOURCES.md) | Chinese-first scope, selected method and source verification |
| [UI standard](docs/UI-STANDARD.md) | Calendar interaction, accessibility and PWA UX acceptance |
| [Testing and release](docs/TESTING.md) | Requirement checks, evidence and release readiness |
| [Development](docs/DEVELOPMENT.md) | Workflow, coding conventions and roadmap |
| [Completion tasks](task.md) | Actionable backlog, dependencies, decision gates and completion evidence |
| [Skills and evidence](docs/SKILLS-AND-EVIDENCE.md) | KB research, user preferences, applicability and references |

## Getting started

Use `npm ci`, then `npm run dev:app` for the local app. Run `npm run check:app`
and `npm run build:app` to validate the application. `npm run build` and
`npm run check` continue to build/check the documentation website. See
[Development](docs/DEVELOPMENT.md) for runtime requirements and preview commands.

Run `npm run data:build` to reproduce packs from pinned sources,
`npm run test:browser` for Chrome journeys and `npm run test:pwa` for real
N-to-N+1 updates and offline launch. These tests do not establish installed-device
or screen-reader support.

Code and original icons: [MIT](LICENSE). HKO and MOM data retain separate terms;
see [data sources](docs/DATA-SOURCES.md). Dependency notices are generated into
`app/public/THIRD-PARTY-NOTICES.txt`. The project owner is the data-maintenance owner.
