# Data Sources and Calendar Method Decisions

Research date: 2026-11-12. Status: documented implementation baseline; no app or
production data pack has been generated. Owner priority: Chinese calendar first.

## First milestone decision

Target 2026-01-01 through 2027-12-31. Implement civil Gregorian navigation and
Chinese lunar month/day detail first. The range is an engineering choice based on
available source coverage, not a promise of complete holiday coverage.

Select `hko-table`: normalize the Hong Kong Observatory annual open-data CSVs into
a small versioned lookup pack. Runtime lookup uses a date-only key. This is simpler
for two years than building an astronomy engine and makes outputs reproducible
across browsers. No calendar npm dependency or Rust/WASM is selected.

HKO provides conversion references, not authority for Malaysian/Singapore public
holidays. Any Chinese cultural event names/rules need separate review; lunar date
coverage alone does not prove festival or statutory leave coverage.

## Method comparison

| Candidate | Assessment | Decision |
| --- | --- | --- |
| Pinned HKO annual lookup | Bounded coverage, inspectable inputs, deterministic offline behavior | Selected for first milestone |
| Browser Intl Chinese calendar | Useful for formatting/comparison; output depends on supported engine behavior | Optional secondary check, not data authority |
| Third-party lunar library | Could support broader ranges; needs independent fixtures, license and maintenance review | Defer until a real wider-range need |
| Custom astronomical engine / WASM | Adds method, precision and validation responsibilities | Defer; unnecessary for a two-year table lookup |

[MDN documents calendar identifiers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf),
including `chinese`, multiple Hijri variants and `indian` (the national Saka calendar).
Do not equate `indian` with a selected Tamil tradition or treat an Intl Hijri
variant as MUIS/JAKIM confirmation.

## Chinese-calendar source register

| ID | Source | Read/verification status |
| --- | --- | --- |
| HKO-INDEX | [Gregorian-Lunar conversion index](https://www.hko.gov.hk/en/gts/time/conversion.htm) | Opened; annual references available; broad index range is not app support |
| HKO-2026 | [2026 catalog record](https://data.gov.hk/tc-data/dataset/hk-hko-rss-gregorian-lunar-calendar-conversion-table/resource/2825dae5-b532-4cdd-85a3-fdfd2eef5518) and [CSV](https://data.weather.gov.hk/weatherAPI/hko_data/calendar/nongli_calendar_2026.csv) | CSV fetched and date coverage checked |
| HKO-2027 | [2027 catalog record](https://data.gov.hk/en-data/dataset/hk-hko-rss-gregorian-lunar-calendar-conversion-table/resource/bc159cbb-e99c-435b-881e-74d4b03bd60a) and [CSV](https://data.weather.gov.hk/weatherAPI/hko_data/calendar/nongli_calendar_2027.csv) | CSV fetched and date coverage checked |
| HKO-PDF | [2026 table](https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2026e.pdf), [2027 table](https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2027e.pdf) | Opened as second representation; full cell-by-cell comparison not performed |

Catalog records report Traditional Chinese content and a last update of 2024-11-08.
Retrieval date and source publication/update date must remain separate.

In-memory coverage check: each CSV returned 365 rows, 365 unique Gregorian dates,
and all dates in consecutive order from January 1 to December 31. The five fields
are Gregorian date, sexagenary year, zodiac, lunar month and lunar day. Files were
not installed into the repository and no upstream content hash was pinned yet.

The observed year-boundary sample is 2026-02-17 and 2027-02-06 as lunar month 1,
day 1 in their respective CSVs. These are source observations, not executed
application tests. The CSV is not a solar-term or statutory-holiday dataset.

## Normalization and acceptance before implementation completion

1. Pin the two raw sources with retrieval timestamp and SHA-256; generate outputs
   through a reproducible importer, preserving provenance and attribution.
2. Parse the known CSV date format explicitly. Do not rely on browser parsing of
   English month abbreviations or implicit two-digit-year pivot behavior.
3. Map lunar month/day labels to numeric values; retain a separate leap-month flag.
   Normalize display text separately for Simplified Chinese. Unknown labels fail
   validation instead of silently becoming a regular month.
4. Preserve year-cycle/zodiac metadata across Lunar New Year. Do not infer a lunar
   numeric year solely from the Gregorian year; add it only with a defined convention.
5. Compare boundary fixtures against the published table by a separate review path.
   A CSV/PDF comparison verifies import fidelity, not independent astronomy.
6. Test every covered civil date for valid lookup, adjacent-date navigation and
   timezone invariance. Use 2025 or a clearly labelled synthetic fixture to exercise
   leap-month representation; this does not expand advertised coverage.
7. Outside the range, show lunar information unavailable. A month grid's leading/
   trailing civil days may be shown, but must not fabricate out-of-range lunar labels.
8. Test warm offline access and clear cache/storage failures once the app exists.

## Attribution and distribution

The [DATA.GOV.HK terms](https://data.gov.hk/en/terms-and-conditions) permit reuse
subject to their conditions, including identification of source and attribution to
the Government, relevant organisation and DATA.GOV.HK. Keep an attribution record
for the selected open dataset. Do not assume that separate HKO publication artwork,
logos or PDF layouts have identical reuse terms; only the open-data mapping is
proposed for packaging. Review applicable notices when pinning the source release.

## Later-phase source register

These sources preserve the broader research without making them first-milestone
dependencies. Discovery and accessible metadata are not full record verification.

| Domain | Preferred source | Evidence and remaining work |
| --- | --- | --- |
| SG public holidays | [MOM consolidated dataset](https://data.gov.sg/datasets/d_8ef23381f9417e4d4254ee8b4dcdb176/view), [MOM holiday page](https://www.mom.gov.sg/employment-practices/public-holidays) | Dataset page states 2020-2027 coverage; annual records/amendments need import review; preserve observed-day conditions |
| MY public holidays | [BKPP official portal](https://www.kabinet.gov.my/), [2026 schedule](https://www.kabinet.gov.my/storage/2025/08/HKA-2026.pdf) | Official search index exposes a 2027 notice; portal and schedule fetches timed out. Exact 2027 annual artifact and complete state/amendment review remain pending |
| SG Hijri | [MUIS Islamic calendar](https://www.muis.gov.sg/resources/islamic-calendar/) | Index and linked 2026/2027 PDFs opened; mapping extraction/validation and redistribution review remain pending |
| MY Hijri | [JAKIM-labelled 2026 calendar hosted by Mufti WP](https://www.muftiwp.gov.my/images/falak/takwim/tarikh_penting/Takwim_Hijri_Miladi_2026.pdf) | PDF accessible but text extraction empty; full mapping/footnotes not verified; 2027 mapping not established |
| SG Hindu observances | [Hindu Endowments Board calendar](https://heb.org.sg/calendar/) | Calendar entry page accessible; full annual content not extracted or verified |
| MY Hindu observances | Local recognised publisher to be selected | No verified annual mapping obtained; do not substitute a generic India calendar |

The [Singapore Open Data Licence](https://data.gov.sg/open-data-licence) is linked by
the MOM dataset. This does not establish licensing of other agencies' PDFs.
Use separately validated regional published mappings for future Hijri support;
never silently substitute one country's calendar for the other.

India/Tamil tradition selection is deferred following the owner's Chinese-first
instruction. No employment/pay entitlement calculator or automatic holiday
substitution engine is part of this milestone.
