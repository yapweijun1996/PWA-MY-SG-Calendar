# Calendar feature map

**Preview scope:** Pick a day, compare its calendar dates, and check what applies in Singapore or a Malaysian state or federal territory. The app answers two separate questions: *What date is this in another calendar?* and *Is this a public holiday here?* Only sourced holiday records answer the second question.

## Screen map: where each task happens

| Surface, in reading order | User action | What changes |
| --- | --- | --- |
| Header | Check connectivity or switch among English, Simplified Chinese, Malay and Tamil | Language changes labels and date formatting, not the selected day, region or event identity. Online status alone does not mean a pack is cached. |
| Region and month toolbar | Choose one of 17 regions; browse previous/next month; select Today | Region changes holiday applicability. Paging changes the **visible month**, not the **selected day**. Today selects the current regional civil date. |
| Month grid | Scan six weeks of Gregorian dates with compact Chinese lunar labels; pick a day | Clicking selects the day. Arrow keys move focus without selecting; Enter or Space selects. A check marks the selection; a dot and border identify today. |
| Selected-day panel | Read the full date, lunar month/day, source, supported range and pack version when available | The panel follows the selection, not keyboard focus. If lunar data is missing or outside its range, the Gregorian date stays usable. |
| Regional details | Compare Saka and estimated Hijri dates, then inspect public holidays and cultural observances in separate lists | Calendar conversions depend on the date; event lists depend on **date and region**. Event sources and coverage warnings sit with the results. |
| Data and app controls | Refresh calendar data, check for a new app version, or defer an offered update | Refresh replaces validated data packs. An app update activates a new worker and reloads the accepting tab. These are separate actions. |
| Settings dialog (opened from toolbar) | Choose Monday/Sunday week start or jump to a known date | Week start rearranges the grid without changing the selected date. A valid date jump changes both selection and visible month. |

**Layout:** Above 900 CSS pixels, the month grid is on the left and selected-day detail on the right. At 900 pixels and below, detail follows the grid. The Saka and Hijri cards sit below both and stack at 600 pixels and below. Holidays follow across the full width. See [screen composition](../app/src/App.tsx), [regional details](../app/src/RegionalDetails.tsx) and [layout rules](../app/src/styles.css).

## Decision map: how a day becomes an answer

| PRD requirement | Implemented rule | Limit or open work |
| --- | --- | --- |
| R01 · Calendar dates | A [Gregorian civil date](../app/src/domain/civil-date.ts) is a `YYYY-MM-DD` key, not a device-local timestamp. [Chinese lunar](../app/src/domain/chinese-calendar.ts) reads Hong Kong Observatory daily tables. [Indian national Saka](../app/src/domain/saka-calendar.ts) and [arithmetic Hijri](../app/src/domain/hijri-calendar.ts) calculate from the same civil date. | Chinese: 2026–2027. Saka and Hijri: 1900–2100. Hijri is an estimate, not a local religious determination; Saka is not a Tamil religious calendar. |
| R02 · Cultural observances | [Event lookup](../app/src/domain/holidays.ts) separates observances, official holidays and sourced observed dates. An observed holiday links to its original holiday; weekends do not automatically create replacements. | Selected observances only. A festival label is not proof of a day off. |
| R03 · Regional holidays | Query by country, subdivision, date and category. Exclude withdrawn records; merge matching national/local entries for the same event, day and kind while retaining sources. Look up coverage separately by region, year and category. | 2026–2027 packs cover Singapore and Malaysian annual schedules with selected amendments. Malaysian special and replacement holiday coverage remains incomplete. |
| R04 · Language | [UI messages](../app/src/messages/catalogs.ts) and [event labels](../app/src/messages/events.ts) are separate from stable event IDs. | Four locales implemented; independent language review pending. |
| R05 · Platform access | Responsive layout, keyboard grid navigation, visible focus and a labelled settings dialog support the same selection flow. | Desktop Chrome automation is not installed-device or screen-reader acceptance. |
| R06 · Offline use | The [worker](../app/src/pwa/sw.ts) caches the app shell; the [repository](../app/src/data/repository.ts) stores validated packs and preferences in IndexedDB. | Warm offline use depends on local storage. A cold first visit offline cannot fetch the app; an evicted pack cannot answer its lookups. |

### Worked example: one date, two regions

Select **2026-02-19** in Singapore. The public-holiday query returns **verified coverage and no records**: the app can say there is no public holiday listed for that day. Switch to **Johor** without changing the date. The same query now returns **Awal Ramadan**, alongside an **incomplete coverage** notice. The date conversions do not change. A known event and an incomplete annual list can both be true.

This is why the UI checks *coverage before interpreting an empty list*. Missing coverage means **unknown**, not “no holiday.” See the [Singapore empty-day fixture](../app/src/domain/holidays.test.ts) and the [Malaysian state applicability fixtures](../app/src/domain/my-holidays.test.ts).

## What survives a restart or update?

- **Selection:** The [calendar state hook](../app/src/data/use-calendar.ts) restores the selected date, region, locale and week start. Browsed month and keyboard focus are transient. If storage is unavailable, the UI warns that the session is not persistent.
- **Data:** Startup reads local packs first and downloads missing packs when online. Downloads must match the manifest checksum, version and schema. Each pack is saved independently; if an active pack fails validation on read, the repository tries its previous version.
- **App version:** The [update controller](../app/src/pwa/use-pwa.ts) offers Update or Later. Accepting saves pending preferences before reloading; another open tab is not forced to reload alongside it.

The [PRD](PRD.md) owns requirements, [data sources and methods](DATA-SOURCES.md) owns source scope, and [testing and release](TESTING.md) records the evidence. Chrome browser and offline/update checks are documented there; installed Android/iPhone/iPad and screen-reader journeys remain **not run**.
