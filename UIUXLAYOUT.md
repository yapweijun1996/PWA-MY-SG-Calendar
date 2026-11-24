# Calendar layout: desktop and mobile

**Recommendation: use one month grid and one selected day. On a wide screen, put the day's details beside the grid. On a narrow screen, put them directly below it.** This calendar helps someone answer “What date is this?” and “Is it a public holiday *here*?” It is not an appointment planner. The grid is for finding a day; the detail area is for reading an answer with its source and limits.

This guide explains the trade-offs behind the [approved UI direction](docs/UI-STANDARD.md). The diagrams describe the current layout, not new screens. The suggested improvement below is a proposal, not an implemented or approved feature.

## Desktop: compare without losing your place

```text
MY / SG Calendar                                  Online · Language
Region [Johor, Malaysia]
February 2026                           Previous · Today · Next · Settings
+----------------------------------------+  +----------------------------+
| Mon   Tue   Wed   Thu   Fri   Sat   Sun |  | Selected day               |
|                                        |  | Thursday, 19 February 2026 |
| Six weeks; civil day over lunar label  |  | Chinese lunar date         |
|                                        |  | Source, range, verification|
+----------------------------------------+  +----------------------------+
Indian national Saka                        Arithmetic Hijri · estimate
Public holidays for selection · coverage · records and sources
Cultural observances · records and sources
Saved data / refresh                                    App update
```

Keep the month heading over the calendar and **label the detail panel with the full selected date**. Paging from February to March does not select a March day: both headings can legitimately name different months. The right panel stays in place as the user compares days; long event names and source references use the full width below, rather than squeezing the seven columns. A permanent navigation sidebar would take space from the primary task without providing another destination people need.

## Mobile: preserve the month, not the desktop columns

```text
MY / SG Calendar
Online · Language
Region [Johor, Malaysia]
February 2026
Previous · Today · Next · Settings
[ Seven-column month grid ]
Selected day: Thursday, 19 February 2026
Chinese lunar date · source and range
Saka date
Hijri date · estimate
Public holidays · coverage and sources
Cultural observances · sources
Saved data / refresh · app update
```

Keep the region visible above the grid, not inside Settings: the same civil date can have a different holiday answer across the border. Let the toolbar wrap before reducing its touch targets. A tap selects in place; do not force a scroll or open a sheet on every tap. Someone comparing the 18th, 19th and 20th should not have to dismiss three dialogs. A scrolling list of holidays alone is also a poor default: it hides uneventful dates and cannot tell the user whether a missing entry means “none” or “unknown.”

### How the existing layout adapts

| Available width (CSS pixels) | Layout decision and reason |
| --- | --- |
| Above 900 | Fluid grid plus a 260–300 px day panel, separated by 24 px; page capped at 1248 px. Extra monitor width does not stretch seven dates across the entire display. |
| 601–900 | Day detail moves below the grid; the two calendar-method cards still fit side by side. A portrait tablet is not a miniature desktop. |
| 600 and below | Method cards also stack. At 500 and below, the header stacks and outer gutters narrow. Keep all seven weekdays in view without horizontal paging. |

The breakpoints follow [the app stylesheet](app/src/styles.css), not device names. Resizing, rotating or zooming should change placement, not selection. The [390 px](design/calendar-v1-390.png), [768 px](design/calendar-v1-768.png) and [1440 px](design/calendar-v1-1440.png) images are **illustrative design anchors**, not screenshots proving current app or device behavior.

## What belongs in a cell, and what does not?

- **Grid:** Show the Gregorian day first, a short lunar label second. Keep six aligned weeks so the toolbar and weekdays don't jump between months. Use a check for selection, a dot and border for today, and a separate focus outline. A day can be all three at once. Green means *selected*, not *public holiday*.
- **Detail:** Spell out the full date and calendar method. Label arithmetic Hijri as an estimate. Put official holidays, linked substitute dates and cultural observances under unambiguous labels. Keep the coverage warning beside the result; publisher, verification date and attribution must be reachable without hover. Don't fill 42 cells with badges, four calendar dates or translated festival names.
- **Trust:** On **19 February 2026**, switching from Singapore to Johor must change a verified empty public-holiday result into **Awal Ramadan** with an **incomplete coverage** notice. The date and lunar label stay put. Offline with a saved pack is different from offline without one; neither network status nor a blank cell says whether it is a working day. See the [acceptance examples](REQUIREMENT.md).

## Interaction details that matter at both sizes

| Task | Behavior to preserve |
| --- | --- |
| Browse versus select | One Tab stop enters the grid. Arrows move focus by a day or a week; Home/End reach week edges; Page Up/Down change month (Shift: year). Enter/Space selects. A month announcement should not read all 42 cells. See the [WAI grid example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/); unlike that picker, this grid is inline and must not trap focus. |
| Jump to a known date | Keep Today beside previous/next. Settings holds the labelled date input and Monday/Sunday week start. Escape closes Settings and restores focus. Neither swipe nor hover should be the only route to an action. |
| Switch language or enlarge text | Retain date, month and region across English, Simplified Chinese, Malay and Tamil. Let real names wrap in detail; don't shrink Tamil or truncate the region to preserve symmetry. Use the same reading and focus order after reflow. |
| Tap accurately | Aim for 44 × 44 CSS px primary controls. At 320 px, seven 44 px cells plus two 12 px gutters already need 332 px **before gaps**. Make the entire cell interactive, keep its height and test actual width and spacing against the [WCAG target-size criterion](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); don't claim every cell is 44 px wide. |
| Recover without losing context | Leave cached results readable after a failed refresh. Keep **refresh data** distinct from **update app**. Offer Update or Later; only deliberate activation should interrupt browsing. On installed phones, check that notches, home indicators and zoom do not cover controls or update feedback. |

## First improvement to test: reaching the holiday answer

In the [current screen](app/src/App.tsx), the [holiday list](app/src/RegionalDetails.tsx) comes after lunar source details and both other calendar methods. On a phone, someone who tapped a day specifically to check a holiday may not know where to look. **Test one in-page link immediately after the grid**, for example “View holidays for 19 Feb · Johor.” It should lead to the existing holiday heading and coverage notice even when there are no records. Keep the label tied to the *selected* day, not the month being browsed. No second event list, sticky bar or new data query is needed.

**Decision test:** At 390 px, ask someone to select 19 February, check Singapore, switch to Johor and explain both answers. Compare the existing flow with the link: can they find the result without prompting, identify the active region and explain the incomplete notice? Also try selecting three dates in succession without following the link: the grid must retain its position. Adopt the link only if it improves that task without disrupting browsing.

## Checks before calling the layout ready

1. At 1440 and 768 px, compare adjacent days, then page to another month. Check that the grid, full selected date and corresponding detail are never ambiguous. Cross the 900 px breakpoint with a selection active.
2. At 390 and 320 px, use long Malay/Tamil content, enlarged text and both orientations. Verify all seven columns, source controls, wrapping, visible focus and no horizontal overflow. Test an out-of-range lunar date as well as a holiday.
3. On keyboard and with a screen reader, select a date, read its region-specific result, open/close Settings and return to the grid. Verify the spoken cues distinguish today, focus and selection without announcing every rerender.
4. On installed Android, iPhone and iPad, repeat the journey offline after a warm visit and through a deferred update. Record device, build, locale and pack. The [testing record](docs/TESTING.md) separates prior Chrome/axe evidence from **not-run** installed-device, real text-zoom and screen-reader checks. The layout recommendation is not a platform certification.
