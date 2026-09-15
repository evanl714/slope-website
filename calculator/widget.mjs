// Calculator markup shared by /calculator/ and the habit-specific pages.
// Pages provide an empty <section class="calculator" id="calculator"> and this fills it.
export const widget = `
  <form class="setup" id="calculator-form">
    <p class="eyebrow">01 / your starting point</p>
    <h2>build your slope</h2>
    <p class="help">Off days are breaks from your habit. Mogul days are planned days when you may engage in it.</p>
    <fieldset>
      <legend>Starting ratio · off : mogul</legend>
      <div class="ratios" id="ratios"></div>
      <p class="small" id="ratio-description"></p>
    </fieldset>
    <label class="field-label" for="start-date">Start date</label>
    <input class="date-input" id="start-date" type="date" required>
    <label class="field-label" for="target-date">Completion date</label>
    <input class="date-input" id="target-date" type="date" required aria-describedby="timeline-help">
    <p class="help" id="timeline-help">Allow at least 14 days, just like in the app. Preview up to one year.</p>
    <button class="calculate" type="submit">Preview my slope ↗</button>
    <p class="error" id="error" role="alert" hidden></p>
    <p class="private-note">Your dates and ratio stay in your browser.</p>
  </form>
  <div class="results" id="results">
    <div class="result-heading"><h2>your trail map</h2><span class="eyebrow">daily taper</span></div>
    <p class="help" id="summary" role="status" aria-live="polite"></p>
    <div class="stats">
      <div><strong id="total-days">—</strong><span>days on your slope</span></div>
      <div><strong id="off-days">—</strong><span>off days</span></div>
      <div><strong id="mogul-days">—</strong><span>mogul days</span></div>
    </div>
    <svg class="trail" id="trail" viewBox="0 0 560 180" role="img" aria-label="A descending trail with dots marking planned mogul days"></svg>
    <div class="legend"><span><i class="key"></i>off day</span><span><i class="key mogul"></i>mogul day</span></div>
    <table class="phases"><caption class="small">Your phases · off days : mogul days</caption><thead><tr><th scope="col">Phase</th><th scope="col">Ratio</th><th scope="col">Dates</th><th scope="col">Days</th></tr></thead><tbody id="phase-rows"></tbody></table>
    <p class="small">Each phase adds more space between moguls. The last phase ends at your completion date, even partway through a cycle.</p>
    <section class="calendar-section" aria-label="Day-by-day schedule">
      <div class="calendar-header"><h3 id="calendar-title"></h3><div class="month-controls"><button type="button" id="previous-month" aria-label="Previous month">←</button><button type="button" id="next-month" aria-label="Next month">→</button></div></div>
      <div class="calendar-grid" id="calendar"></div>
      <p class="small" id="completion-note"></p>
    </section>
  </div>
`;
