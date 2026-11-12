const jurisdictions = Array.from({ length: 16 }, (_, index) => `MY-${String(index + 1).padStart(2, '0')}`);
const eventId = key => key.replace(/-day-[23]$/, '');
const recordId = (key, date) => `my-${key}-${date}`;

// Curated facts are authoritative inputs. Never calculate a replacement holiday here.
export function normalizeMyHolidays(curation) {
  if (curation.schemaVersion !== 1 || !Array.isArray(curation.annualRecords)
    || !Array.isArray(curation.changes) || !Array.isArray(curation.sources)) throw new Error('Invalid MY curation');
  const sourceIds = new Set(curation.sources.map(source => source.id));
  const requireRefs = refs => {
    if (!Array.isArray(refs) || refs.length === 0 || refs.some(id => !sourceIds.has(id))) throw new Error('Unknown MY source');
  };
  const records = curation.annualRecords.map(row => {
    requireRefs(row.sourceRefs);
    if (!row.evidence || !Array.isArray(row.subdivisionIds)
      || row.subdivisionIds.some(region => !jurisdictions.includes(region))) throw new Error('Invalid MY annual evidence or scope');
    return {
      id: recordId(row.nameKey, row.date), eventId: eventId(row.nameKey), date: row.date,
      country: 'MY', subdivisionIds: [...row.subdivisionIds], kind: 'public-holiday',
      nameKey: row.nameKey, status: row.status, sourceRefs: [...row.sourceRefs],
    };
  });
  for (const change of curation.changes) {
    requireRefs(change.sourceRefs);
    if (!change.evidence) throw new Error('Missing MY amendment evidence');
    if (change.action === 'add') {
      const record = change.record;
      if (!record || !Array.isArray(record.subdivisionIds) || record.subdivisionIds.length === 0
        || record.subdivisionIds.some(region => !jurisdictions.includes(region))) throw new Error('Explicit MY amendment scope required');
      records.push({ ...record, country: 'MY', sourceRefs: [...change.sourceRefs] });
      continue;
    }
    const original = records.find(record => record.id === change.targetId);
    if (!original || original.status === 'withdrawn') throw new Error('Missing or withdrawn MY amendment target');
    if (change.action === 'confirm') {
      original.status = 'verified';
      original.sourceRefs = [...new Set([...original.sourceRefs, ...change.sourceRefs])];
    } else if (change.action === 'replace-date') {
      if (change.date === original.date) throw new Error('MY correction must change the date');
      original.status = 'withdrawn';
      original.sourceRefs = [...new Set([...original.sourceRefs, ...change.sourceRefs])];
      records.push({ ...original, id: recordId(original.nameKey, change.date), date: change.date, status: 'verified' });
    } else throw new Error('Unknown MY amendment action');
  }
  if (new Set(records.map(record => record.id)).size !== records.length) throw new Error('Duplicate MY record');
  const coverage = jurisdictions.flatMap(region => [2026, 2027].map(year => ({
    region, year, category: 'public-holiday', status: 'incomplete',
    sourceRefs: [...new Set(records.filter(record => record.date.startsWith(`${year}-`)
      && (!record.subdivisionIds.length || record.subdivisionIds.includes(region)))
      .flatMap(record => record.sourceRefs))],
  })));
  return { records, sources: curation.sources, coverage };
}
