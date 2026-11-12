# Calendar and Holiday Data Contract

Status: implemented Chinese/holiday runtime validators and Saka adapter; full observance/MY data remain incomplete. Owner-selected arithmetic Hijri is
implemented with explicit estimate status. Updated: 2026-11-12.

## Separate concepts

1. Civil date: a Gregorian date-only identifier, independent of an instant.
2. Calendar conversion: a derived label from a named method/version/range.
3. Cultural observance: an event whose cultural relevance does not confer leave.
4. Official public holiday: a jurisdiction-specific, source-backed record.
5. Observed/substitute holiday: an independently verified date linked to its event.

Never turn a computed date or an unreviewed third-party API response into an
official record. Do not apply one jurisdiction's substitution/weekend logic to
another. This document defines product integrity, not legal advice or legal rules.

## Record semantics

| Field | Meaning and validation |
| --- | --- |
| id | Stable record ID, independent of translated title |
| eventId | Groups related occurrences without collapsing distinct records |
| date | Valid date-only YYYY-MM-DD; no timezone conversion of this value |
| country | MY or SG |
| subdivisionIds | Explicit applicability using a validated jurisdiction registry |
| kind | cultural-observance, public-holiday, or observed-public-holiday |
| observedFor | Related original record when applicable; never guessed |
| nameKey | Localization key with four-language completeness tracking |
| status | verified, provisional, disputed or withdrawn |
| sourceRefs | References to evidence supporting this occurrence and applicability |
| datasetVersion | Immutable release identity for the containing data pack |

The registry includes SG and MY-01 through MY-16, checked against the
[LHDN state-code list](https://sdk.myinvois.hasil.gov.my/codes/state-codes/).
Empty subdivision applicability means national scope within the record's country.
The registry validates all 13 states and 3 federal territories; available region
selection does not imply verified holiday coverage.
An applicability query may combine national and subdivision entries but must not
duplicate the same occurrence.

## Source register

Each source entry needs publisher, title, original URL, jurisdiction, covered year,
publication/amendment date when available, retrieval date, verification date,
reviewer/evidence, license/attribution and supersession relationships. Preserve a
permitted evidence snapshot or content fingerprint where practical.

The [source register and method decision](DATA-SOURCES.md) records the current
research and Chinese-first implementation baseline. Source discovery is not full
holiday verification. Before importing holiday data, check the applicable authority
and amendments. Where sources disagree, retain evidence and expose disputed
status; do not select the newest retrieval timestamp as automatic truth.

## Coverage model

Track coverage by country/subdivision, year, dataset version and record category.
An empty verified result means "no applicable records in a covered interval."
Missing, incomplete or unverified coverage means "unknown/unavailable," not zero.
The UI distinguishes `incomplete` (some source-backed records are available) from
`unknown` (coverage has not been established). Neither permits a verified-empty
message. Source disclosures are selected through the current region/year coverage
references rather than all sources belonging to a country.

MY curation keeps `annualRecords` and explicit `changes` in one owning input.
`confirm` adds declaration evidence, `replace-date` withdraws the original while
retaining its provenance and adds the corrected date, and `add` requires explicit
subdivision scope. Observed dates require an original record link. There is no
weekday-based fallback or automatic extension of a special holiday into later years.

Keep source verification date separate from download time. A pack downloaded
today can contain old or incomplete information. Make corrections versioned and
traceable; validate a replacement before atomically promoting it.

## Calendar adapter contract

Input: civil date + explicit method and applicable region settings.
Output: calendar identifier, method/version, supported range, date components,
display-label key and confidence/limitations or a typed unavailable result.

Fixtures must cover leap days, leap lunar months where relevant, month/year
boundaries and known disagreement cases. Reference expected values independently
from the implementation under test. Do not call a library-derived fixture proof
of that same library's correctness.

The Chinese adapter uses HKO annual lookup tables, with numeric month/day
and an explicit leap-month flag after normalization. Preserve raw source values and
provenance; never derive a numeric lunar year from the Gregorian year alone. Method
identifier: `hko-table`; version comes from the pinned source snapshot/pack.

The Indian method is `indian-national-saka`, version `saka-gregorian-v1`, supported
for 1900-2100 civil dates. The owner selected `islamic-civil`, version `tabular-friday-v1`, for 1900-2100.
It returns `confidence: calculated-estimate` and `regionalVerification: unavailable`;
regional official mapping is not implied. The civil date labels the daytime portion,
not an instant-based sunset calculation. Do not present a generic method as a locally confirmed
religious or official determination.
Keep any future astronomy calculation separate from official announcements.

## Localization and distribution

Translations change labels, never IDs, applicability or dates. Record fallback and
review state; do not advertise complete four-language coverage with hidden missing
translations. Preserve proper names where required and test Tamil rendering with
actual content. Confirm redistribution rights before packaging third-party data. Source
`rightsKind` distinguishes a dataset license from a factual reference; for factual
references, the rights URL points to the referenced page and does not assert an
open-content license. No third-party article prose or artwork is packaged.
