# Product Requirements

Status: active requirements; partial local implementation. Owner: project owner. Updated: 2026-11-12.

## Problem and outcome

People planning across Malaysia and Singapore need to distinguish local public
holidays from cultural observances while understanding multiple calendar dates.
Success means the selected date, region and data status are clear, and previously
downloaded supported data remains usable offline.

This is a calendar-information product. Personal scheduling, accounts, cloud sync,
notifications, subscriptions and generative AI are not confirmed requirements.
The word "smart" does not by itself authorize an AI service or credential storage.

## Confirmed product direction

The owner's brief establishes the following target requirements. Implementation
status is recorded in TESTING; full launch acceptance remains incomplete.

| ID | Requirement | Observable result |
| --- | --- | --- |
| R01 | Gregorian, Chinese lunar, arithmetic Hijri and Indian national Saka dates | Date detail identifies each supported method and its limits; unsupported methods are explicit |
| R02 | Multicultural festivals | A festival is labelled as an observance unless separately verified as a public holiday |
| R03 | Singapore plus all 13 Malaysian states and 3 federal territories | Country/subdivision selection changes applicability without leaking a prior region's results |
| R04 | Four languages: en, zh-Hans, ms, ta | Locale switching preserves selected date/region and stable event identities |
| R05 | Desktop, Android, iPhone and iPad access | Primary journeys work on the tested browser and installed-device matrix |
| R06 | Offline access to cached calendar/festival information | Warm offline launch works; uncached years/regions show unavailable coverage |

## First milestone: Chinese calendar first

Owner direction: "make chinese calendar first" (2026-11-12). This changes delivery
order, not the long-term R01-R06 product goals.

The engineering baseline targets 2026-01-01 through 2027-12-31, with Gregorian month
navigation, Today, selected-day details and Chinese lunar month/day labels. Use
versioned HKO open-data tables through a deterministic date-only lookup, as specified
in [data sources and methods](DATA-SOURCES.md). The two source years have been
pinned and normalized; the implemented adapter resolves all 730 civil dates.
The local UI supports month/day navigation, four locales and explicit range limits.

Keep the four-language architecture and eventual platform/offline requirements.
Chinese-first specifies calendar priority, not permission to remove other languages.
Do not silently add almanac fortune-telling, auspicious hours or astrology.

Remaining data milestones add reviewed cultural observances and complete MY/SG
public holidays. The owner selected Indian national Saka and later explicitly
approved arithmetic Hijri estimates because MUIS redistribution permission is
unavailable. This revises the earlier regional-mapping requirement: do not claim
MUIS/JAKIM confirmation, and never derive official holidays from the algorithm.
The first milestone must not claim full R01/R03 coverage. Complete PWA release
acceptance remains required before calling this an installable offline product.

Do not advertise full R01 if only Indian festival labels have been implemented.
A full Indian-calendar date display needs an explicitly selected tradition/method.
The scope difference must remain visible in release notes and acceptance results.

## Primary journeys

- Select Malaysia and Johor, inspect applicable records, then switch to Singapore.
- Select a day, compare calendar labels, and open source/status details for an event.
- Change language without losing the current month, day or region.
- Download supported data online, reopen offline, and identify missing coverage.
- Defer an app update, continue browsing, then deliberately update with visible feedback.

## Decisions needed before related implementation

| Decision | Why it matters | Proposed approach |
| --- | --- | --- |
| First supported year range | Determines source review and fixtures | Chinese and holiday baseline 2026-2027; Saka algorithm 1900-2100 |
| Official source per jurisdiction/year | Determines holiday authority and corrections | MOM SG pack implemented; MY annual/amendment verification incomplete |
| Chinese lunar method | Determines reproducibility | HKO table lookup selected for first milestone; normalize and test before release |
| Hijri methods and libraries | Explicit owner revision, 2026-11-12 | Own `islamic-civil` arithmetic implementation; visibly estimated; official holidays independently verified. Regional official mappings are no longer a requirement for this method |
| Indian calendar tradition and date scope | Explicit owner choice | Indian national Saka selected by owner; arithmetic method, not Tamil religious calendar |
| Initial region, week start and theme | Consequential interaction preferences | Approved v1 light neutral/green, Monday configurable; visible SG initial region, persisted selection |
| Data refresh policy and ownership | Defines when cached information is trustworthy | Project owner accepted maintenance responsibility; see DEVELOPMENT |
| License and translation review | Determines redistribution and language quality | Owner selected MIT; data terms remain separate; independent four-language review pending |

No launch date, performance budget, uptime promise or complete official holiday
dataset is established by this document. Testing owns acceptance evidence;
[development](DEVELOPMENT.md) owns the staged delivery plan.
