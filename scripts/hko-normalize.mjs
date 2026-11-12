const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const days = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

export function normalizeHko(csv, year) {
  if (!Number.isInteger(year) || year < 2000 || year > 2099) throw new Error('Unsupported source year');
  const lines = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (lines.shift() !== 'Gregorian Date,Chinese year (Gan-Zhi),Chinese year (Zodiac),Lunar month,Lunar Date') throw new Error('Unexpected HKO CSV header');
  const rows = lines.map((line, index) => {
    const fields = line.split(',');
    if (fields.length !== 5) throw new Error(`Invalid field count on row ${index + 2}`);
    const [rawDate, yearCycle, zodiac, monthLabel, dayLabel] = fields;
    const match = /^(\d{1,2})-([A-Z][a-z]{2})-(\d{2})$/.exec(rawDate);
    if (!match || Number(match[3]) !== year % 100) throw new Error('Invalid Gregorian source date');
    const month = months.indexOf(match[2]) + 1;
    const day = Number(match[1]);
    const instant = new Date(Date.UTC(year, month - 1, day));
    if (month === 0 || instant.getUTCFullYear() !== year || instant.getUTCMonth() + 1 !== month || instant.getUTCDate() !== day) throw new Error('Invalid civil date');
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const leapMonth = monthLabel.startsWith('閏');
    const lunarMonth = lunarMonths.indexOf(monthLabel.replace(/^閏/, '').replace(/^一月$/, '正月')) + 1;
    const lunarDay = days.indexOf(dayLabel) + 1;
    if (!lunarMonth || !lunarDay || !/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/.test(yearCycle) || !/^[鼠牛虎兔龍蛇馬羊猴雞狗豬]$/.test(zodiac)) throw new Error('Unknown lunar label');
    return { date, month: lunarMonth, day: lunarDay, leapMonth, yearCycle, zodiac, sourceId: `hko-${year}` };
  });
  const expected = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  if (rows.length !== expected) throw new Error('Incomplete annual coverage');
  rows.forEach((row, index) => {
    if (row.date !== new Date(Date.UTC(year, 0, index + 1)).toISOString().slice(0, 10)) throw new Error('Duplicate, unordered or missing date');
  });
  return rows;
}
