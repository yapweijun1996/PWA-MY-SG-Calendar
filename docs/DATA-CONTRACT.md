# Calendar and Holiday Data Contract

Status: proposed semantic contract. No production dataset or executable schema
has been created. Baseline: 2026-11-12.

## Separate concepts

1. Civil date: a Gregorian date-only identifier, independent of an instant.
2. Calendar conversion: a derived label from a named method/version/range.
3. Cultural observance: an event whose cultural relevance does not confer leave.
4. Official public holiday: a jurisdiction-specific, source-backed record.
5. Observed/substitute holiday: an independently verified date linked to its event.

Never turn a computed date or an unreviewed third-party API response into an
official record. Do not apply one jurisdiction's substitution/weekend logic to
another. This document defines product integrity, not legal advice or legal rules.

## Proposed record semantics

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

The jurisdiction registry must distinguish national coverage from subdivision
coverage and validate all targeted Malaysian states/federal territories. Use a
stable code system after verifying its authoritative mapping; do not invent codes.
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

The first Chinese adapter will use HKO annual lookup tables, with numeric month/day
and an explicit leap-month flag after normalization. Preserve raw source values and
provenance; never derive a numeric lunar year from the Gregorian year alone. Method
identifier: `hko-table`; version comes from the pinned source snapshot/pack.

The Hijri method and Indian-calendar tradition remain deferred choices. Do not present
a generic method as the locally confirmed religious or official determination.
Keep any future astronomy calculation separate from official announcements.

## Localization and distribution

Translations change labels, never IDs, applicability or dates. Record fallback and
review state; do not advertise complete four-language coverage with hidden missing
translations. Preserve proper names where required and test Tamil rendering with
actual content. Confirm redistribution rights before packaging third-party data.
