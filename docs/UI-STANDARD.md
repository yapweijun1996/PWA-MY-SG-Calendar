# Calendar UI and PWA Standard

Status: acceptance direction, not an approved visual design or implemented UI.
Baseline: 2026-11-12. Based on the project's selected PWA and visual-design Skills;
their private research records are not part of this public website.

## User task and hierarchy

First milestone: Gregorian + Chinese lunar calendar, per the owner's Chinese-first
direction. Build month/day navigation and source/range visibility first; regional
holiday selection and other calendar methods are later flows. Do not display
unimplemented selectors or imply those later capabilities already work.

The main task is to understand a date and its applicable local holidays.
Prioritize region + month, the calendar, selected-day details, then provenance and
settings. Avoid imposing an ERP sidebar or KPI-card dashboard on this task.

Proposed screens: month calendar, day/event detail, region selection, and settings
with language/data availability/update information. On small screens, retain
legible day cells and move long event descriptions to an accessible detail view.
Do not hide the selected region or imply that a cultural badge means a day off.

## Interaction acceptance

- Today, previous/next month and day selection are operable by keyboard and touch.
- Region switching updates applicability and does not retain stale region results.
- Locale switching retains context and handles longer Malay/Tamil labels.
- Keyboard focus, selected day and today have distinct non-color-only cues.
- Define calendar-grid keyboard behavior before implementation; manage focus when
  opening/closing detail dialogs and when changing months.
- Announce relevant date/selection changes without excessive screen-reader noise.
- Source/status details are reachable without hover and remain readable offline
  when included in the cached pack.

## States

Design initial selection, loading, covered/no events, incomplete coverage, offline
cached, offline uncached, stale pack, source conflict, storage unavailable, update
available, updating and update failed states. Unknown data must never look like a
verified empty day. Errors should state what happened and a useful recovery action.

## PWA acceptance inherited from the selected Skill

- Treat iPhone installed behavior as a primary target. Use safe areas for all
  affected controls/overlays and an intentional opaque, theme-aware top surface.
- Match manifest, launch appearance and app chrome. Test light/dark coherence if
  both themes are implemented. Avoid horizontal overflow.
- Offer updates explicitly, show immediate loader feedback, prevent duplicate
  activation and reload only after the update transition is ready.
- Define offline capability by actual cached coverage and show failure recovery.
- Smart hide/reveal top bars apply only where meaningful scrolling exists;
  contextual scroll-to-top applies to long screens, not automatically to a month grid.
- Target approximately 44x44 CSS-pixel primary controls; preserve readability,
  visible focus and reduced-motion behavior.

These are project applications of `pwa:product-standard`; its canonical procedure
remains in KB. See the testing matrix for required evidence and unrun states.

## Visual design workflow

Before a substantial visual implementation, establish a direction with concrete
desktop/mobile samples, record feedback and distinguish draft from approved anchors.
The project currently has no approved palette, typography, icon set, screenshots,
design score or visual gallery. Do not invent an approval or score.

Use a small consistent spacing/type system, plain action labels and deliberate
density. Review real desktop, tablet and mobile screenshots; machine checks cannot
establish visual quality. The canonical UI workflow owns any detailed scoring.

Accessibility target: WCAG 2.2 AA, with keyboard, focus, contrast, zoom/reflow,
text sizing and screen-reader journey checks. This is a target, not a conformance
claim. See [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
