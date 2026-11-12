# Application Architecture

Status: implemented local boundaries with remaining source/platform gates, 2026-11-12.

## Implemented foundation

`app/` contains the React calendar UI, pure domain modules, IndexedDB repository,
four message catalogs and the PWA lifecycle. Its Vite build
uses `dist-app/`; the existing documentation generator continues to own `dist/`.
Both use one root package and lockfile with separate commands. The existing Pages
workflow publishes only the documentation output. The calendar is not deployed.

## Design direction

Start with a static browser application and versioned public data packs. Keep
calendar calculation separate from holiday authority and presentation. No backend,
account system, database service or WASM runtime is required by the initial design.

For the first Chinese-calendar milestone, the adapter is a deterministic lookup
over normalized, pinned HKO 2026-2027 tables. Fetch upstream data during controlled
pack preparation, not on every page view. Keep runtime lookup independent of browser
calendar support. See [data sources and methods](DATA-SOURCES.md).

| Implemented owner | Responsibility | Boundary |
| --- | --- | --- |
| Calendar domain | Date-only arithmetic and calendar adapters | Pure inputs/outputs; no DOM, network or persistence |
| Holiday catalog | Applicability, provenance and record lookup | No UI translations used as keys; no inferred official dates |
| Data repository | Load, validate and select dataset versions | Public packs and IndexedDB; expose coverage and failure states |
| Preferences | Region, locale and display settings | Persisted through one storage interface |
| UI | Calendar, detail, selectors and feedback | Calls domain/repository contracts; owns transient selection state |
| PWA lifecycle | App-shell caching, install and update state | Own namespace; does not own holiday verification |
| Localization | Message catalogs and formatting | Stable message IDs; no duplicated business rules |

Dependency direction: UI -> domain/repository interfaces; persistence and network
adapters implement those interfaces. Domain logic must not import the UI or service
worker. These are responsibility boundaries, not a demand to create one package
or abstraction per row.

## Main data flow

Region + selected date -> coverage lookup -> applicable holiday/observance records
+ calendar adapter results -> localized view model -> month/day display.

Public pack -> schema/provenance validation -> staged storage transaction -> active
pack version -> read-only domain queries. If staging fails, retain the previous
validated pack and show its version/status. Do not mix partially updated records.

## State ownership and recovery

- Use date-only values for calendar selection; obtain "today" from an explicitly
  selected regional timezone policy. Inject the clock for boundary tests.
- Distinguish app build identity, dataset version and storage schema version.
- A storage failure may allow session-only browsing, but must not claim persistence
  or offline readiness. Browser storage is not a guaranteed durable backup.
- Keep the last validated dataset when a refresh fails. Explicitly show missing,
  stale, provisional or conflicting data instead of rendering apparent success.
- Handle IndexedDB migration failures without deleting user preferences as a
  generic recovery step. Define migration and rollback behavior when schemas exist.
- Coordinate waiting-worker activation across open tabs; preserve selected date,
  region and preferences across update/reload. Bound retries and show recovery.

IndexedDB database `my-sg-calendar`, version 1, owns the `state` object store.
`active-chinese` / `previous-chinese` and `active-holidays` / `previous-holidays`
are independently validated and atomically replaced per pack. Schema 1 has no
cross-pack coupling. Preferences have one validated record and serialized writes.
A newer incompatible database is rejected without deletion. Corrupt active packs
fall back to the last validated previous pack. Future schema changes require an
explicit migration and compatibility test; no destructive downgrade is implemented.

## Offline and update boundary

Workbox precaches the shell, scripts, local icons and notices. Validated public
packs live only in IndexedDB, not a second service-worker data cache. Avoid accidental reliance on remote fonts/scripts for core
offline operation. A cold first visit without network cannot promise a downloaded
application. A warm visit may only promise packs actually available locally.

Use immutable assets and a separate freshness policy for HTML/worker discovery.
Show a waiting update, accept an explicit user action, show an updating state,
activate, and reload after the controller transition. See
[Workbox update guidance](https://developer.chrome.com/docs/workbox/handling-service-worker-updates).
`vite-plugin-pwa` uses injectManifest and a custom Workbox worker. Cache names
include `my-sg-calendar` and the registration scope. There is no origin-wide cache
or storage deletion. `base: './'` supports the tested `/calendar/` subpath.

The waiting worker activates only after an explicit action. The initiating tab
flushes preferences, shows progress, prevents duplicate activation and reloads on
controller change. Other open tabs keep their page and offer an explicit reload.
A 15-second activation timeout exposes recovery. App build, data version and
storage schema identities are independent; cold offline visits cannot load the app.

## Hosting and security

GitHub Pages is the owner's planned static host. Verify the actual site URL and
Vite base path before building; a project subpath affects assets, manifest scope,
worker scope and direct navigation. See [Vite static deployment guidance](https://vite.dev/guide/static-deploy.html).
The owner subsequently authorized Actions/Pages for the introduction/documentation
website; see [deployment](DEPLOYMENT.md). This is distinct from calendar-app release.

Treat imported source text and translated content as data, not executable HTML.
Ship no private credentials in browser bundles. Allow only public, license-cleared
data; record any third-party requests. Service-worker/cache cleanup must be scoped
to this app even when other applications share the origin.

## Future decision triggers

- Add PostgreSQL only for an approved server-owned persistence need.
- Add Rust/WASM only after measured algorithm/performance evidence justifies it.
- Add a public API only after source authority, availability, license, CORS and
  offline behavior have been investigated; an API response alone is not authority.
- Add architectural decision records when an implementation materially changes
  ownership, external contracts or the proposed offline model.
