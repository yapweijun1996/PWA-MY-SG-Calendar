# Product Requirements

Status: design candidate. Owner: project owner. Baseline: 2026-11-12.

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
and launch completeness remain unverified.

| ID | Requirement | Observable result |
| --- | --- | --- |
| R01 | Gregorian, Chinese lunar, Hijri and Indian traditional-calendar information | Date detail identifies each supported method and its limits; unsupported methods are explicit |
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
checked for complete consecutive Gregorian-date coverage; no application exists yet.

Keep the four-language architecture and eventual platform/offline requirements.
Chinese-first specifies calendar priority, not permission to remove other languages.
Do not silently add almanac fortune-telling, auspicious hours or astrology.

Later milestones add reviewed Chinese cultural observances, complete MY/SG public
holidays, regional Hijri dates and an explicitly chosen Indian calendar tradition.
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
| First supported year range | Determines source review and fixtures | 2026-2027 engineering baseline; source coverage checked, implementation pending |
| Official source per jurisdiction/year | Determines holiday authority and corrections | Source register started in DATA-SOURCES.md; full holiday ingestion deferred |
| Chinese lunar method | Determines reproducibility | HKO table lookup selected for first milestone; normalize and test before release |
| Hijri methods and libraries | Determines regional accuracy | Deferred; prefer separately validated MUIS/JAKIM published mappings |
| Indian calendar tradition and date scope | "Indian calendar" is underspecified | Deferred by Chinese-first priority; no tradition selected |
| Initial region, week start and theme | Consequential interaction preferences | Present explicit selection; record defaults in the UI specification |
| Data refresh policy and ownership | Defines when cached information is trustworthy | Version packs and show verification dates; assign maintainer before release |
| License and translation review | Determines redistribution and language quality | Verify each source/license and obtain competent language review |

No launch date, performance budget, uptime promise or complete official holiday
dataset is established by this document. Testing owns acceptance evidence;
[development](DEVELOPMENT.md) owns the staged delivery plan.
