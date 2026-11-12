# Project Agent Governance

## PROJECT_SYSTEM

Applies to work in this repository. Supplements active global governance; it does
not replace host controls or current user instructions.

- Project: PWA-MY-SG-Calendar. Project KB: `pwa-my-sg-calendar`.
- Keep this file limited to stable project constraints. Detailed procedures belong
  in Skills; design rationale and contracts belong in the documents linked below.
- Do not import Globe3/ERP rules, agent identities, or another project's release
  permissions into this consumer calendar project.

## PROJECT_CONTEXT

Applies when interpreting scope or reporting implementation status.

- The product is a Malaysia/Singapore multicultural calendar. Treat the
  [PRD](docs/PRD.md) as the requirement owner and the
  [architecture](docs/ARCHITECTURE.md) as a design proposal until implemented.
- At this documentation baseline there is no application, package manifest,
  automated test suite, or deployment configuration. Inspect the current tree
  before relying on that baseline. Never invent runnable commands or completion.
- React/TypeScript, Vite/Workbox, IndexedDB and GitHub Pages are planned choices;
  Rust/WASM and PostgreSQL are optional future work, not bootstrap dependencies.

## DOMAIN_INTEGRITY

Applies to calendar logic, holiday data, translations, UI and fixtures.
Uses the [data contract](docs/DATA-CONTRACT.md).

- Keep calendar conversions, cultural observances, official public holidays and
  substitute/observed dates distinct. A computed festival is not proof of a
  gazetted holiday. Never infer an unverified replacement holiday.
- Holiday applicability must retain country, subdivision, year, source and
  verification status. Unknown coverage is not an empty holiday list.
- Preserve date-only identity across device timezones. State the calendar method
  and supported range; expose uncertainty instead of silently inventing dates.
- Use stable IDs independent of translated labels. Support the specified
  `en`, `zh-Hans`, `ms`, and `ta` locales without changing event identity.

## SKILL_ROUTING

Applies when selecting a reusable procedure. Uses
[skills and evidence](docs/SKILLS-AND-EVIDENCE.md).

- Load relevant active Skills on demand, read their complete procedure, and
  verify task applicability. An index entry or similarity score is not a loaded
  procedure. Reuse unchanged guidance rather than reloading every turn.
- Use `pwa:product-standard` for PWA implementation/QA and
  `ui:visual-design-lifecycle` for substantial new UI direction. Do not default
  to `ui:admin-panel-design-standard` for this calendar.
- Use `project-agents-designer` for governance changes. Coding, UI and manager
  routes are documented in the evidence guide; do not copy their full SOPs here.
- Merely reading `agent:auto-manager` does not authorize delegation, hosted CI,
  registry edits or publishing. Activate execution workflows only within the
  current task and host permissions.

## VERIFICATION

Applies before claiming the affected deliverable is complete. Uses
[testing and release](docs/TESTING.md).

- Documentation-only changes: check local links, requirement traceability,
  proposal/status labels, consistency with the tree, and the complete diff.
- For implemented behavior, select checks from the requirement acceptance matrix;
  verify real offline launch, region filtering and N-to-N+1 worker updates when
  those surfaces change. Static checks alone do not establish those behaviors.
- Report automated browser evidence separately from installed-device and
  screen-reader evidence. Unrun checks remain NOT RUN.
- An update must preserve user control; cleanup must only affect this app's
  caches/storage. Verify unknown/unavailable/stale data states as well as success.
- Update the owning document when a contract or command becomes implemented.
  Keep proposed paths and scripts explicitly proposed until they exist.

## SCOPED_RULES

No nested AGENTS.md files are justified by the current documentation-only tree.
Add one only after a real directory-specific mandatory boundary exists.
