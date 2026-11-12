# Data Sources and Calendar Method Decisions

Updated: 2026-11-12. Status: Chinese and Singapore packs, Malaysian annual schedules
with selected amendments, and tested Saka/Hijri adapters. Full MY/observance coverage remains incomplete. The owner selected an independent
arithmetic Hijri estimate instead of a licensed official mapping.
Project owner accepted ongoing data-maintenance responsibility.

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

Pinned files are in `data/raw/hko/`, with exact SHA-256 and retrieval timestamps
in `sources.json`. Each CSV has 365 unique consecutive civil dates. The five fields
are Gregorian date, sexagenary year, zodiac, lunar month and lunar day.
`npm run data:build` verifies fingerprints and produces 730 normalized records.
The current version is `hko-2026-2027-862287abf7fa`.

The observed year-boundary sample is 2026-02-17 and 2027-02-06 as lunar month 1,
day 1 in their respective CSVs. These are also executed
application fixtures. Ten boundary fixtures were checked against separately
rendered HKO PDF tables on 2026-11-12; full cell-by-cell PDF comparison is not claimed. The CSV is not a solar-term or statutory-holiday dataset.

## Normalization and acceptance contract

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
packaged. Attribution is retained in the pack, UI and `data/raw/hko/NOTICE.md`.

## Later-phase source register

These sources preserve the broader research without making them first-milestone
dependencies. Discovery and accessible metadata are not full record verification.

| Domain | Preferred source | Evidence and remaining work |
| --- | --- | --- |
| SG public holidays | [MOM consolidated dataset](https://data.gov.sg/datasets/d_8ef23381f9417e4d4254ee8b4dcdb176/view), [MOM holiday page](https://www.mom.gov.sg/employment-practices/public-holidays) | Pinned complete 104-record response; 26 records for 2026-2027 packaged and compared with MOM annual dates; four observed links explicitly reviewed |
| MY public holidays | [2026 BKPP schedule](https://www.kabinet.gov.my/storage/2025/08/HKA-2026.pdf), [2027 BKPP schedule](https://www.kabinet.gov.my/storage/2026/08/HKA_2027.pdf) | Both official PDFs retrieved with certificate validation and rendered for state-column review; 99 annual records plus selected verified amendments ingested. Complete special/replacement coverage remains pending; see the MY register below |
| SG Hijri | [MUIS Islamic calendar](https://www.muis.gov.sg/resources/islamic-calendar/) | Index and linked 2026/2027 PDFs opened; mapping extraction/validation and redistribution review remain pending |
| MY Hijri | [JAKIM-labelled 2026 calendar hosted by Mufti WP](https://www.muftiwp.gov.my/images/falak/takwim/tarikh_penting/Takwim_Hijri_Miladi_2026.pdf) | PDF accessible but text extraction empty; full mapping/footnotes not verified; 2027 mapping not established |
| SG Hindu observances | [Hindu Endowments Board calendar](https://heb.org.sg/calendar/) | Calendar entry page accessible; full annual content not extracted or verified |
| MY Hindu observances | Local recognised publisher to be selected | No verified annual mapping obtained; do not substitute a generic India calendar |

The [Singapore Open Data Licence](https://data.gov.sg/open-data-licence) is linked by
the MOM dataset. This does not establish licensing of other agencies' PDFs.
Use separately validated regional published mappings for future Hijri support;
never silently substitute one country's calendar for the other.

The owner selected the Indian national Saka calendar. No employment/pay entitlement
calculator or automatic holiday substitution engine is part of this product.

## Saka implementation

`indian-national-saka`, version `saka-gregorian-v1`, supports civil dates from
1900-01-01 through 2100-12-31. The arithmetic follows the
[IMD Positional Astronomy Centre explanation](https://packolkata.imd.gov.in/panchang/en/explanation):
the year begins March 22, or March 21 in a Gregorian leap year; Chaitra has 30/31
days, the following five months have 31, and the final six have 30. The Saka year
is the Gregorian anchor year minus 78. Dates before the anchor belong to the prior
year. This is not a Tamil religious calendar or a source of Indian festival dates.

Twenty fixed references include month starts, the 1957 introduction and the
[IMD 2025 announcement](https://internal.imd.gov.in/press_release/20250322_pr_3824.pdf).
Independent ICU comparisons cover every day in 1900, 2000, 2024, 2026, 2027 and
2100; algorithm inputs and outputs remain date-only.

## Owner-selected arithmetic Hijri

On 2026-11-12 the owner approved: arithmetic Hijri labelled as an estimate,
with official holidays independently verified. This replaces the earlier required
regional-mapping dependency. No MUIS table is redistributed or used at runtime.

The independently written `islamic-civil` adapter uses a 30-year cycle, alternating
30/29-day months and leap years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26 and 29.
Its Friday epoch is Julian 622-07-16, proleptic Gregorian 622-07-19. References:
[USNO calendar explanation](https://aa.usno.navy.mil/faq/islamic) and
[Unicode calendar identifiers](https://cldr.unicode.org/development/development-process/design-proposals/islamic-calendar-types).
Method version: `tabular-friday-v1`; supported civil dates: 1900-2100.

Six independently fetched [USNO API](https://aa.usno.navy.mil/data/api.html) fixtures cover Ramadan, Shawwal and New Year
in 2026/2027. Every day from 2000 through 2030 is compared with ICU's separate
`islamic-civil` implementation, covering a full leap cycle. The runtime algorithm
does not depend on ICU calendar support, networking or third-party mapping data.

The estimate labels the civil day's daytime portion. Islamic days begin at sunset;
this application does not calculate sunset or determine religious observance.
An explicit disagreement test preserves 2026-03-20 as arithmetic 1 Shawwal while
the independently sourced SG Hari Raya Puasa holiday remains 2026-03-21.

## Official jurisdiction/year coverage and unresolved sources

Registry: SG and MY-01 through MY-16, checked against
[LHDN's ISO-based state codes](https://sdk.myinvois.hasil.gov.my/codes/state-codes/).
`app/public/data/holidays-2026-2027.json` explicitly contains a coverage row for
each of 17 jurisdictions, both years and both record categories.

| Jurisdictions | 2026 / 2027 official holiday coverage | Cultural observances | Regional Hijri |
| --- | --- | --- | --- |
| SG | Verified MOM annual snapshot; 14 / 12 records | Selected Dragon Boat/Mid-Autumn dates; incomplete | Official mapping unavailable |
| MY-01 Johor; MY-02 Kedah; MY-03 Kelantan; MY-04 Melaka | Annual schedules + selected amendments / annual schedule; incomplete | Unknown | Unavailable |
| MY-05 Negeri Sembilan; MY-06 Pahang; MY-07 Pulau Pinang; MY-08 Perak | Annual schedules + selected amendments / annual schedule; incomplete | Unknown | Unavailable |
| MY-09 Perlis; MY-10 Selangor; MY-11 Terengganu; MY-12 Sabah | Annual schedules + selected amendments / annual schedule; incomplete | Unknown | Unavailable |
| MY-13 Sarawak; MY-14 Kuala Lumpur; MY-15 Labuan; MY-16 Putrajaya | Annual schedules + applicable selected amendments / annual schedule; incomplete | Unknown | Unavailable |

The owner-selected arithmetic Hijri estimate is available in every region. The
last column describes official regional mappings, which are not used by that method.

MOM's [2027 release](https://www.mom.gov.sg/newsroom/press-releases/2026/0618-public-holidays-for-2027)
was compared with the pinned records, including February 8 as the observed day.
The four explicit links are June 1 / May 31, August 10 / August 9, November 9 /
November 8 in 2026, and February 8 / February 7 in 2027. No Saturday substitutes
are inferred. Current combined dataset version: `holidays-2026-2027-2933dc6f80cd`; retrieval and
fingerprint live in `data/raw/sg-holidays/provenance.json`. The upstream update
shown by data.gov.sg was 2026-07-03; that differs from retrieval and verification.
Pack versions hash normalized content, source metadata and coverage, so a corrected
rule or attribution produces a new identity even when the original bytes are unchanged.

Selected SG Chinese observances are curated separately in
`data/curated/chinese-observances.json`: Dragon Boat lunar 5/5 and Mid-Autumn 8/15,
excluding leap months. SCCC factual references support the rules; no article text,
images or layout is redistributed. HKO mapping supplies the civil dates. Four
fixtures are checked against the annual tables: 2026-06-19, 2027-06-09,
2026-09-25 and 2027-09-15. These are cultural records, never public holidays.
Their coverage remains incomplete rather than implying an exhaustive festival list.
The rule reference SHA identifies our curated record; its recorded/review date is
not represented as the publication timestamp of the referenced article.

### MY annual schedules and selected amendments

The authoritative curation input is `data/curated/my-holidays.json`.
`scripts/my-holidays.mjs` consumes explicit facts and corrections; it does not
calculate substitute holidays. `npm run data:build` packages them with SG data.
The current pack contains 108 MY records (107 active, one withdrawn), 26 SG
official records and four SG cultural records. All 32 MY region/year public
coverage rows remain **incomplete**; a missing entry is not proof of a working day.

Both BKPP PDFs were retrieved on 2026-11-12 using Windows HTTPS certificate
validation. Earlier browser/Node fetch failures did not establish unavailability
through every supported client. The 2026 government-library mirror was also
byte-identical to the BKPP original. Fingerprints of the original annual PDFs:

- 2026: `415023261014e30880b0fbb7a40c47a9655605183ef976204489d760fed769a3`.
- 2027: `4b13d6b956ebba64e8ca80209f838439b2956a193fa37957e6446531752f96f9`.

The combined tables on pages 4-6 and their state columns were visually reviewed,
with federal provisional footnotes checked. The 49 rows for 2026 and 52 rows for
2027 normalize to 49 and 50 records respectively: 2027 Chinese New Year day two
and Hari Raya Haji day two each combine federal/state rows with the same occurrence.
Day-two/day-three labels retain distinct record identities. Provisional footnotes
remain provisional unless an announcement independently confirms the date.

Each source in the curation records publisher, covered year, URL, retrieval and
verification dates, reviewer, SHA-256 and rights kind. `updatedAt` is a known
publication/amendment date where available; the 2026 annual PDF and Kelantan index
explicitly use the review date because an original publication date was not established.
PDF/HTML byte fingerprints and hashes of our own factual-reference objects are
distinguished in attribution. Raw publisher PDFs, prose, artwork and layouts are
not distributed; these are original factual transcriptions, not an assertion that
government pages carry the project's MIT license.

| Verified change | Authority and explicit scope |
| --- | --- |
| Kedah birthday: withdraw 2026-06-21; add 2026-07-05 | [Signed 6 May letter](https://www.kedah.gov.my/wp-content/uploads/2026/05/DOC070526-07052026114442.pdf), paragraphs 2-3; MY-02 only. Both source references remain attached to the withdrawn and replacement records |
| Kedah Thaipusam, 2026-02-01 | [20 January declaration](https://www.kedah.gov.my/wp-content/uploads/2026/01/Cuti-Peristiwa-Thaipusam-Negeri-Kedah-Darul-Aman-2026.pdf), page 1 paragraph 2; MY-02. Both pages inspected; no automatic 2027 extension |
| Penang Thaipusam replacement, 2026-02-02 | [29 January MBSP statement](https://www.mbsp.gov.my/db/kenyataan/2026/januari.pdf), page 11 section 9 explicitly names the statewide date; MY-07, linked to 2026-02-01 |
| Aidilfitri confirmed 2026-03-21 | [Keeper of the Rulers' Seal announcement](https://dmedia.penerangan.gov.my/upload/sm/19032026.1309983745.pdf), 19 March. The annual table supplies the named subsequent days; this confirmation also resolves the additional-day condition below |
| Additional Aidilfitri holiday, 2026-03-20 | [P.U. (B) 111](https://www.kabinet.gov.my/storage/2026/03/PUB-111_2026.pdf) for Peninsular Malaysia, [P.U. (B) 112](https://www.kabinet.gov.my/storage/2026/03/PUB-112_2026.pdf) for Labuan, and [Sabah Chief Minister statement](https://cm.sabah.gov.my/index.php/siaran-media/6439), all 18 March. Their conditional date is resolved by the national announcement; none establishes Sarawak scope |
| Kelantan additional Aidilfitri holiday, 2026-03-19 | [Official 2026 circular index](https://jps.kelantan.gov.my/index.php/arahan-psuk/96-2026) explicitly identifies the date and statewide scope; MY-03. Index entry reviewed; attached scanned PDF not inspected |
| Aidiladha confirmed 2026-05-27 | [17 May official Kedah report of the national announcement](https://www.kedah.gov.my/index.php/2026/05/17/hari-raya-aidiladha-1447h-disambut-pada-27-mei-2026/); second-day applicability still comes from the annual table |
| Selangor Silver Jubilee 2026-10-25 and replacement 2026-10-26 | [JPN official notice](https://www.jpn.gov.my/pengumuman/makluman-cuti-peristiwa-bagi-pusat-rekod-pendaftaran-negara-prpn-cyberjaya-sempena-sambutan-jubli-perak-25-tahun-pemerintahan-sultan-selangor-2026/), first two paragraphs explicitly state declaration and replacement; MY-10. Individual leave/pay entitlement is outside the calendar's scope |

### MY remaining evidence gaps

Annual transcription is complete for the stated snapshots. A complete independent
gazette/amendment/replacement audit is not. The following register identifies
known follow-ups rather than silently converting them to dates in the pack.

| Jurisdiction/year | Outstanding evidence and next source |
| --- | --- |
| All MY jurisdictions, 2026 and 2027 | Reconcile annual tables against jurisdiction-specific gazettes and all subsequent declarations; independently verify each substitute date and any collision. Retain future announcement-dependent dates as provisional |
| MY-01, 2026 | Verify special holidays reported for 25 May and 13 July from full [JTKSM statements](https://jtksm.gov.my/en/media/press-statements) and state declarations; direct PDF retrieval timed out |
| MY-05, 2026 | Verify 3 August special holiday from the JTKSM/state declaration; source retrieval timed out |
| MY-10, 2026 | Verify 1 September SUKMA special holiday from the JTKSM/state declaration; the October Jubilee entries above do not resolve this gap |
| MY-13, 2026 | Obtain the Sarawak Aidilfitri declaration and [19 May Wesak/Agong/Gawai circular](https://ecircular.sarawak.gov.my/view_circular.php?id=9585); direct retrieval timed out. No peninsula substitution rule is applied |
| MY-12 / MY-15, 2026 | Independently resolve Kaamatan/Wesak/Agong overlap and replacement scope; annual dates alone are insufficient |
| MY-14 / MY-15 / MY-16, 2026 | [JPA 8 January notice](https://docs.jpa.gov.my/docs/akhbar/2026/siaran_media08012026.pdf) concerns public servants. Do not generalize it to a universal employment entitlement or ingest an unrestricted date without reviewing scope |

The BKPP homepage also describes the 2026 Wesak/Agong collision, conditional on
Sunday being the weekly holiday. No date is generated by assuming a state's or
an individual's weekly rest day. Source access failures are specific to the
listed references; accessible annual data is already usable offline.

The MUIS index links 2026 and 2027 monthly mappings, but its
[Terms of Use](https://www.muis.gov.sg/terms-of-use/) require prior permission for
redistribution. No MUIS mapping or artwork is packaged. The owner confirmed there
is no current permission; redistribution remains pending. MY JAKIM 2027 mapping
and data rights are also unresolved.
The owner subsequently approved an independently implemented arithmetic Hijri
estimate, with official public holidays remaining separate. No Intl or regional
mapping is silently substituted. MY holiday source gaps still block full R03.
