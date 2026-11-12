# Calendar UI and PWA Standard

Status: v1 visual direction APPROVED by the product owner on 2026-11-12.
Baseline: 2026-11-12. Based on the project's selected PWA and visual-design Skills;
their private research records are not part of this public website.

## Approved direction v1

Preview source: `design/preview.html`; anchors: `design/calendar-v1-390.png`,
`design/calendar-v1-768.png`, `design/calendar-v1-1440.png`. These are local review
artifacts, not public-site pages. Sample content is explicitly labelled. Owner
feedback: "采用此方向（推荐）". This approves the direction; runtime accessibility
and installed-device acceptance still require their own evidence.

The primary job is selecting a civil day and understanding its lunar label and
source. A month grid is the main surface; day/source detail is adjacent on desktop
and follows the grid on mobile. Approved defaults: light theme, Monday week start
(configurable), English initial locale with four-language selection. No region
selector until region-dependent data is implemented.

| Reference pattern | Application and limit |
| --- | --- |
| [WAI date-picker grid](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) | One tab stop within the grid; arrows, Home/End and Page Up/Down move focus. This is an inline calendar, not a modal date picker; do not copy its focus trap. |
| [GOV.UK date input](https://design-system.service.gov.uk/components/date-input/) | Explicit labels for a known-date jump; month browsing remains the main interaction for exploratory use. |
| [Apple accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Readable text and alternatives to visual cues; actual installed-device acceptance is separate. |
| [WCAG target sizes](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Aim for 44px main controls; preserve reflow and usable date cells at narrow widths. |

Keyboard specification: arrows move by 1/7 civil days, Home/End to week edges,
Page Up/Down by a month, Shift+Page Up/Down by a year; Enter/Space selects. Focus
and selection are separate. Today selects regional today even outside data coverage,
where a typed unavailable state is shown. Settings uses a labelled native dialog,
Escape closes and restores focus. Date/region/locale changes retain user context.

Agent self-review (subjective design rubric, not runtime or owner approval):

| Criterion | Score | Evidence/limitation |
| --- | --- | --- |
| User purpose | 13/15 | Month grid dominates; selection reveals date/source detail. |
| Information architecture | 9/10 | Calendar, detail, language and settings; no unrelated dashboard. |
| Visual hierarchy | 13/15 | Month then dates, selected day, provenance. |
| Spacing/density | 9/10 | Consistent spacing; desktop two columns, mobile stacked. |
| Typography/content | 8/10 | Readable major text; compact lunar labels require real-language testing. |
| Feedback/recovery | 8/10 | Selection and unavailable-data sample; production states specified above. |
| Responsive | 9/10 | 390/768/1440 captures inspected; no horizontal overflow. |
| Accessibility | 8/10 | Labelled controls and visible focus; full grid and screen-reader tests pending. |
| Trust | 5/5 | Preview/sample status and calendar-versus-holiday distinction explicit. |
| Consistency | 4/5 | Restrained neutral/green palette and reused controls. |

Total: 86/100, agent self-review. Owner accepted the direction on 2026-11-12. The preview
demonstrates layout only; its toolbar and language choices are illustrative.

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
The v1 anchors above establish the approved neutral/green light palette and layout.
Additional themes and materially different directions require new review.

Use a small consistent spacing/type system, plain action labels and deliberate
density. Review real desktop, tablet and mobile screenshots; machine checks cannot
establish visual quality. The canonical UI workflow owns any detailed scoring.

Accessibility target: WCAG 2.2 AA, with keyboard, focus, contrast, zoom/reflow,
text sizing and screen-reader journey checks. This is a target, not a conformance
claim. See [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
