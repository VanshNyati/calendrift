export const months = [
  'January','February','March','April','May','June', 'July','August','September','October','November','December'
];

function makeDate(y, m, d) {
  return new Date(y, m, d, 12, 0, 0, 0);
}

function asNoon(date) {
  return makeDate(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfTheMonth(date) {
  const d = asNoon(date);
  return makeDate(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(date, n) {
  const d = asNoon(date);
  return makeDate(d.getFullYear(), d.getMonth() + n, 1);
}

export function isSameDay(a, b) {
  const da = asNoon(a), db = asNoon(b);
  return (da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate());
}

export function monthKey(date) {
  const y = getYear(date);
  const m = getIndexOfMonth(date) + 1;
  return `${y}-${m}`;
}

export function startOfTheWeek(date, weekStart = 0) {
  const d = asNoon(date);
  const w = d.getDay();
  let diff;
  if (weekStart === 1) {
    const monIndex = (w + 6) % 7;
    diff = monIndex;
  } else {
    diff = w;
  }
  return makeDate(d.getFullYear(), d.getMonth(), d.getDate() - diff);
}

export function addDays(date, n) {
  const d = asNoon(date);
  return makeDate(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function getYear(date) {
  return asNoon(date).getFullYear();
}

export function getIndexOfMonth(date) {
  return asNoon(date).getMonth();
}

export function getDateNumber(date) {
  return asNoon(date).getDate();
}

export function isSameMonth(a, b) {
  const da = asNoon(a);
  const db = asNoon(b);
  return (da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth());
}

export function isToday(date) {
  const d = asNoon(date);
  const now = asNoon(new Date());
  return (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate());
}

export function toDayKey(date) {
  const d = asNoon(date);
  const y = d.getFullYear();
  const m = d.getMonth() + 1; 
  const da = d.getDate();
  return `${y}-${m}-${da}`;
}

export function parseSampleDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  const d = Number(dd);
  const m = Number(mm) - 1;
  const y = Number(yyyy);
  return makeDate(y, m, d);
}

export function buildMonthGrid(anchorDate, offset = 0, weekStart = 0) {
  const firstOfTarget = startOfTheMonth(addMonths(anchorDate, offset));
  const gridStart = startOfTheWeek(firstOfTarget, weekStart);
  const cells = new Array(42);
  for (let i = 0; i < 42; i++) {
    cells[i] = addDays(gridStart, i);
  }
  return {year: getYear(firstOfTarget), monthIndex: getIndexOfMonth(firstOfTarget), firstOfTarget, cells};
}