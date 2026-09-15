import { presets, ratio, generate, dateNumber, dateString } from './schedule.mjs';

const $ = id => document.getElementById(id);
const startInput = $('start-date'), targetInput = $('target-date');
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const longFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const format = (day, long = false) => (long ? longFormat : dateFormat).format(new Date(day * 86400000));
let selectedRatio = 3, currentPlan, calendarMonth;

for (const value of presets) {
  const { off, mogul } = ratio(value);
  const label = document.createElement('label');
  label.className = 'ratio';
  const input = document.createElement('input');
  input.type = 'radio'; input.name = 'ratio'; input.value = value; input.checked = value === 3;
  input.setAttribute('aria-label', `${off} off ${off === 1 ? 'day' : 'days'} to ${mogul} mogul ${mogul === 1 ? 'day' : 'days'}`);
  const text = document.createElement('span'); text.textContent = `${off}:${mogul}`;
  label.append(input, text); $('ratios').append(label);
  input.addEventListener('change', () => { selectedRatio = value; describeRatio(); markDraft(); });
}
function describeRatio() {
  const { off, mogul } = ratio(selectedRatio);
  $('ratio-description').textContent = selectedRatio < 0
    ? `Begin with ${mogul} mogul days, then 1 off day.`
    : `Begin with ${off} off ${off === 1 ? 'day' : 'days'}, then 1 mogul day.`;
}
function markDraft() {
  if (currentPlan) $('summary').textContent = 'Settings changed. Select “Preview my slope” to update this plan.';
}
function bounds() {
  const start = dateNumber(startInput.value);
  if (Number.isFinite(start)) {
    targetInput.min = dateString(start + 14);
    targetInput.max = dateString(start + 365);
  }
}
startInput.addEventListener('input', () => { bounds(); markDraft(); });
targetInput.addEventListener('input', markDraft);
function render() {
  const start = dateNumber(startInput.value), target = dateNumber(targetInput.value);
  const total = target - start;
  if (!Number.isInteger(total) || total < 14 || total > 365) {
    $('error').textContent = 'Choose valid dates with a completion date 14–365 days after your start date.';
    $('error').hidden = false;
    return;
  }
  $('error').hidden = true;
  const plan = generate(total, selectedRatio);
  currentPlan = { ...plan, start, target };
  const moguls = plan.days.filter(day => day.isMogul).length;
  $('total-days').textContent = total;
  $('off-days').textContent = total - moguls;
  $('mogul-days').textContent = moguls;
  $('summary').textContent = `${plan.phases.length} phases · ${format(start)} to ${format(target, true)}. A little more space, phase by phase.`;
  $('phase-rows').replaceChildren();
  for (const [index, phase] of plan.phases.entries()) {
    const row = document.createElement('tr');
    for (const text of [String(index + 1).padStart(2, '0'), `${phase.off}:${phase.mogul}`, `${format(start + phase.start)} – ${format(start + phase.end - 1)}`, phase.count]) {
      const cell = document.createElement('td'); cell.textContent = text; row.append(cell);
    }
    $('phase-rows').append(row);
  }
  renderTrail();
  const first = new Date(start * 86400000);
  calendarMonth = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1) / 86400000;
  renderCalendar();
  $('completion-note').textContent = `Complete on ${format(target, true)}. Your last scheduled day is ${format(target - 1)}.`;
}
function svgElement(name, attrs) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  return element;
}
function renderTrail() {
  const svg = $('trail'); svg.replaceChildren();
  const point = i => {
    const t = i / Math.max(1, currentPlan.days.length - 1);
    return [18 + t * 524, 25 + 115 * t + 9 * Math.sin(t * Math.PI * 4)];
  };
  const path = currentPlan.days.map((day, i) => `${i ? 'L' : 'M'}${point(i).join(',')}`).join(' ');
  svg.append(svgElement('path', { d: path, fill: 'none', stroke: '#ccc', 'stroke-width': 1.5 }));
  for (const day of currentPlan.days) {
    const [cx, cy] = point(day.index);
    const dot = svgElement('circle', { cx, cy, r: currentPlan.days.length > 100 ? 2 : 4, fill: day.isMogul ? '#000' : '#fff', stroke: day.isMogul ? '#000' : '#bbb' });
    const title = svgElement('title', {}); title.textContent = `${format(currentPlan.start + day.index)}: ${day.isMogul ? 'mogul' : 'off'} day`;
    dot.append(title); svg.append(dot);
  }
  const title = svgElement('title', {}); title.textContent = 'Day-by-day trail. The slope is illustrative; dots represent the scheduled off and mogul days.';
  svg.prepend(title);
}
function shiftMonth(day, offset) {
  const date = new Date(day * 86400000);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1) / 86400000;
}
function renderCalendar() {
  const date = new Date(calendarMonth * 86400000);
  $('calendar-title').textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  const grid = $('calendar'); grid.replaceChildren();
  for (const name of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
    const cell = document.createElement('span'); cell.className = 'weekday'; cell.textContent = name; grid.append(cell);
  }
  for (let i = 0; i < date.getUTCDay(); i++) grid.append(document.createElement('span'));
  const end = shiftMonth(calendarMonth, 1);
  for (let day = calendarMonth; day < end; day++) {
    const scheduleDay = currentPlan.days[day - currentPlan.start];
    const cell = document.createElement('span');
    cell.className = `day ${scheduleDay ? scheduleDay.isMogul ? 'mogul' : 'off' : 'outside'}`;
    cell.textContent = day - calendarMonth + 1;
    const label = `${format(day, true)}: ${scheduleDay ? scheduleDay.isMogul ? 'mogul day' : 'off day' : day === currentPlan.target ? 'completion day' : 'outside your plan'}`;
    cell.setAttribute('aria-label', label); cell.title = label; grid.append(cell);
  }
  $('previous-month').disabled = calendarMonth <= currentPlan.start;
  $('next-month').disabled = end > currentPlan.target;
}
$('previous-month').addEventListener('click', () => { calendarMonth = shiftMonth(calendarMonth, -1); renderCalendar(); });
$('next-month').addEventListener('click', () => { calendarMonth = shiftMonth(calendarMonth, 1); renderCalendar(); });
$('calculator-form').addEventListener('submit', event => { event.preventDefault(); render(); });
const now = new Date();
startInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
targetInput.value = dateString(dateNumber(startInput.value) + 30);
bounds(); describeRatio(); render();
