// @ts-nocheck
// 🎮 CodinGame Puzzle - how-time-flies
// https://www.codingame.com/training/easy/how-time-flies

const begin = readline();
const end = readline();

// Parse dates from dd.mm.yyyy
function parseDate(s) {
  const [dd, mm, yyyy] = s.split('.').map(Number);
  return { day: dd, month: mm, year: yyyy };
}

function toTimestamp(d) {
  return Date.UTC(d.year, d.month - 1, d.day);
}

const b = parseDate(begin);
const e = parseDate(end);

// Total days
const msPerDay = 86400000;
const totalDays = Math.round((toTimestamp(e) - toTimestamp(b)) / msPerDay);

// Full years: how many complete calendar years between b and e
// A full year has passed when the anniversary is <= e
let years = e.year - b.year;
// Check if the anniversary hasn't happened yet in e's year
const annivMonth = b.month;
const annivDay = b.day;
if (
  e.month < annivMonth ||
  (e.month === annivMonth && e.day < annivDay)
) {
  years--;
}
if (years < 0) years = 0;

// Full months: after accounting for full years, how many full months remain
// Start from the date that is `years` years after b
let afterYearsMonth = b.month;
let afterYearsDay = b.day;
let afterYearsYear = b.year + years;

// Count full months between afterYears date and e
let months = (e.year - afterYearsYear) * 12 + (e.month - afterYearsMonth);
// Check if the day of month hasn't been reached yet
if (e.day < afterYearsDay) {
  months--;
}
if (months < 0) months = 0;

// Build output
const parts = [];
if (years > 0) {
  parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
}
if (months > 0) {
  parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
}
parts.push(`total ${totalDays} days`);

console.log(parts.join(', '));
