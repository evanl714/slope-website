import test from 'node:test';
import assert from 'node:assert/strict';
import { generate, normalize, ratio, presets, dateNumber, dateString } from './schedule.mjs';

// Expected results from SlopeTests/DailyScheduleGeneratorTests.swift.
test('app fixture: off days precede moguls', () => {
  const result = generate(9, 2);
  assert.deepEqual(result.days.slice(0, 6).map(d => d.isMogul), [false, false, true, false, false, true]);
  assert.deepEqual(result.days.filter(d => d.isMogul).map(d => d.index), [2, 5]);
  assert.equal(result.days.filter(d => !d.isMogul).length, 7);
});
test('app fixture: inverted ratios begin with moguls', () => {
  const result = generate(6, -2);
  assert.deepEqual(result.days.map(d => d.isMogul), [true, true, false, true, true, false]);
  assert.equal(result.phases[0].value, -2);
});
test('app fixture: sixty-day phase formula', () => {
  for (const value of [2, -2]) {
    const result = generate(60, value);
    assert.equal(result.days.length, 60);
    assert.equal(result.phases[0].cycles, 3);
    assert.equal(result.phases[0].end, 9);
    assert.equal(result.phases[1].start, 9);
    assert.equal(result.phases[1].value, value === 2 ? 3 : 1);
  }
});
test('app fixture: short and empty schedules', () => {
  assert.equal(generate(5, 4).phases.length, 1);
  assert.deepEqual(generate(5, 4).days.map(d => d.isMogul), [false, false, false, false, true]);
  assert.deepEqual(generate(0, 2), { days: [], phases: [] });
});
test('normalization and maximum ratio match the app', () => {
  assert.equal(normalize(-1), -2);
  assert.equal(normalize(-100), -7);
  assert.equal(normalize(0), 1);
  assert.equal(normalize(100), 14);
  assert.deepEqual(ratio(-3), { off: 1, mogul: 3 });
  assert.equal(generate(365, 14).phases.at(-1).value, 14);
});
test('every offered timeline and ratio is contiguous and exactly fills the timeline', () => {
  for (const preset of presets) for (let length = 14; length <= 365; length++) {
    const plan = generate(length, preset);
    assert.equal(plan.days.length, length);
    assert.equal(plan.phases.at(-1).end, length);
    assert.equal(plan.phases.reduce((sum, p) => sum + p.count, 0), length);
    for (const [index, phase] of plan.phases.entries()) {
      assert.equal(phase.start, index === 0 ? 0 : plan.phases[index - 1].end);
      assert.ok(phase.cycles >= 2);
    }
  }
});
test('calendar dates handle leap years and DST without changing day counts', () => {
  assert.equal(dateNumber('2026-03-09') - dateNumber('2026-03-07'), 2);
  assert.equal(dateNumber('2026-11-02') - dateNumber('2026-10-31'), 2);
  assert.equal(dateString(dateNumber('2028-02-28') + 2), '2028-03-01');
  assert.ok(Number.isNaN(dateNumber('2026-02-30')));
  assert.ok(Number.isNaN(dateNumber('')));
});
