// Port of Slope/Domain/DailyScheduleGenerator.swift (5098b91).
// Fresh plans only: no logged detours or custom phase overrides.
export const presets = [-3, -2, 1, 2, 3, 4, 5, 7];
export function normalize(value) {
  return value < 0 ? Math.max(-7, Math.min(-2, value)) : Math.min(14, Math.max(1, value));
}
export function ratio(value) {
  value = normalize(value);
  return { off: value < 0 ? 1 : value, mogul: value < 0 ? Math.abs(value) : 1 };
}
export function generate(totalDays, initialOff) {
  if (!Number.isInteger(totalDays) || totalDays < 0 || totalDays > 3660 || !Number.isInteger(initialOff)) {
    throw new RangeError('Use a valid number of days and starting ratio.');
  }
  const days = [], phases = [];
  let value = normalize(initialOff);
  while (days.length < totalDays) {
    const { off, mogul } = ratio(value);
    const cycleLength = off + mogul;
    const cycles = Math.max(2, Math.ceil(totalDays / (cycleLength * 8)));
    const start = days.length;
    const count = Math.min(totalDays - start, cycles * cycleLength);
    for (let offset = 0; offset < count; offset++) {
      const position = offset % cycleLength;
      const isMogul = value < 0 ? position < mogul : position >= off;
      days.push({ index: days.length, phase: phases.length, isMogul });
    }
    phases.push({ value, off, mogul, cycles, start, end: days.length, count });
    value = value < -2 ? value + 1 : value === -2 ? 1 : normalize(value + 1);
  }
  return { days, phases };
}
// Calendar dates use UTC arithmetic to avoid daylight-saving length changes.
export function dateNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const timestamp = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
    ? timestamp / 86400000 : NaN;
}
export function dateString(day) {
  return new Date(day * 86400000).toISOString().slice(0, 10);
}
