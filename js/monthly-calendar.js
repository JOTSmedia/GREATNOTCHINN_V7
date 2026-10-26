/* The venue's monthly schedule, excluding all-day records in every rendering path. */
(function () {
  'use strict';
  const zone = 'America/New_York';
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayFormat = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeFormat = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' });
  const labelFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });

  function dateKey(value) {
    const parts = dayFormat.formatToParts(new Date(value));
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
  }
  function keyForCivilDate(value) { return value.toISOString().slice(0, 10); }
  function monthModel(year, month) {
    // Civil calendar arithmetic uses UTC; event dates are converted to New Jersey time separately.
    const first = new Date(Date.UTC(year, month, 1));
    const start = new Date(Date.UTC(year, month, 1 - first.getUTCDay()));
    const last = new Date(Date.UTC(year, month + 1, 0));
    const end = new Date(Date.UTC(year, month + 1, 7 - last.getUTCDay()));
    const dates = [];
    for (let date = new Date(start); date < end; date.setUTCDate(date.getUTCDate() + 1)) dates.push(keyForCivilDate(date));
    return { year, month, first, start, end, dates, key: `${year}-${String(month + 1).padStart(2, '0')}` };
  }
  function timedEvents(items, model) {
    const first = model.dates[0];
    const after = keyForCivilDate(model.end);
    return items.filter(event => {
      if (!event || event.status === 'cancelled' || !event.start || event.start.date ||
          typeof event.start.dateTime !== 'string' || !Number.isFinite(Date.parse(event.start.dateTime))) return false;
      const day = dateKey(event.start.dateTime);
      return day >= first && day < after;
    }).sort((a, b) => Date.parse(a.start.dateTime) - Date.parse(b.start.dateTime));
  }

  function initialize() {
    const calendar = document.getElementById('monthly-calendar');
    if (!calendar) return;
    const grid = document.getElementById('month-grid');
    const title = document.getElementById('month-title');
    const status = document.getElementById('month-status');
    const previous = document.getElementById('month-prev');
    const next = document.getElementById('month-next');
    const today = document.getElementById('month-today');
    if (!grid || !title || !status || !previous || !next || !today) return;
    const current = dateKey(new Date()).split('-').map(Number);
    let year = current[0], month = current[1] - 1;
    let sequence = 0;
    let activeController = null;
    const cache = new Map();
    const api = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent('greatnotchinn@gmail.com') + '/events';
    const apiKey = 'AIzaSyDXDA1_OaHw-OV3JQwdIT6RmV8yl3rNVvM';

    function render(model, events) {
      const fragment = document.createDocumentFragment();
      weekdays.forEach(day => {
        const heading = document.createElement('div');
        heading.className = 'month-weekday';
        heading.textContent = day.slice(0, 3);
        heading.setAttribute('aria-label', day);
        fragment.appendChild(heading);
      });
      const byDate = new Map();
      timedEvents(events, model).forEach(event => {
        const key = dateKey(event.start.dateTime);
        if (!byDate.has(key)) byDate.set(key, []);
        byDate.get(key).push(event);
      });
      const todayKey = dateKey(new Date());
      model.dates.forEach(key => {
        const cell = document.createElement('div');
        cell.className = 'month-day';
        const civil = new Date(key + 'T12:00:00Z');
        const dayEvents = byDate.get(key) || [];
        cell.classList.toggle('is-outside', civil.getUTCMonth() !== model.month);
        cell.classList.toggle('is-today', key === todayKey);
        cell.classList.toggle('is-empty', !dayEvents.length);
        cell.classList.toggle('has-events', Boolean(dayEvents.length));
        const label = document.createElement('time');
        label.className = 'month-date';
        label.dateTime = key;
        label.textContent = labelFormat.format(civil);
        if (key === todayKey) label.setAttribute('aria-current', 'date');
        cell.appendChild(label);
        dayEvents.forEach(event => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'month-event';
          const time = document.createElement('span');
          time.className = 'month-event-time';
          time.textContent = timeFormat.format(new Date(event.start.dateTime));
          const name = document.createElement('span');
          name.className = 'month-event-title';
          name.textContent = event.summary || 'Live Music';
          button.append(time, document.createTextNode(' '), name);
          button.setAttribute('aria-label', `${event.summary || 'Live Music'}, ${labelFormat.format(civil)}, ${time.textContent} Eastern time: show details`);
          button.addEventListener('click', () => {
            if (typeof window.gniOpenEvent === 'function') window.gniOpenEvent(event, button);
          });
          cell.appendChild(button);
        });
        fragment.appendChild(cell);
      });
      grid.replaceChildren(fragment);
    }

    async function loadMonth() {
      const request = ++sequence;
      if (activeController) activeController.abort();
      const model = monthModel(year, month);
      title.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(model.first);
      grid.setAttribute('aria-label', title.textContent + ' live music schedule');
      grid.setAttribute('aria-busy', 'true');
      status.textContent = 'Loading the monthly schedule…';
      render(model, []);
      const saved = cache.get(model.key);
      if (saved && Date.now() - saved.savedAt < 15 * 60 * 1000) {
        const events = timedEvents(saved.events, model);
        render(model, events);
        status.textContent = events.length ? 'All show times are Eastern time.' : 'No timed events are listed for these dates.';
        grid.setAttribute('aria-busy', 'false');
        return;
      }
      const controller = new AbortController();
      activeController = controller;
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const events = [];
        const seenTokens = new Set();
        let token = '';
        do {
          // UTC padding catches early and late New York dates around DST and month boundaries.
          const params = new URLSearchParams({ key: apiKey, singleEvents: 'true', orderBy: 'startTime', timeZone: zone,
            timeMin: new Date(model.start.getTime() - 86400000).toISOString(),
            timeMax: new Date(model.end.getTime() + 86400000).toISOString(), maxResults: '2500' });
          if (token) params.set('pageToken', token);
          const response = await fetch(api + '?' + params.toString(), { signal: controller.signal });
          if (!response.ok) throw new Error('Monthly calendar unavailable');
          const page = await response.json();
          events.push(...(Array.isArray(page.items) ? page.items : []));
          token = page.nextPageToken || '';
          if (token && seenTokens.has(token)) throw new Error('Invalid calendar pagination');
          if (token) seenTokens.add(token);
        } while (token && request === sequence);
        if (request !== sequence) return;
        const filtered = timedEvents(events, model);
        cache.set(model.key, { events: filtered, savedAt: Date.now() });
        render(model, filtered);
        status.textContent = filtered.length ? 'All show times are Eastern time.' : 'No timed events are listed for these dates.';
      } catch {
        if (request !== sequence) return;
        status.textContent = 'The monthly schedule is temporarily unavailable. Please use the Google Calendar link below.';
      } finally {
        clearTimeout(timeout);
        if (request === sequence) { grid.setAttribute('aria-busy', 'false'); activeController = null; }
      }
    }
    function move(delta) {
      const target = new Date(Date.UTC(year, month + delta, 1));
      year = target.getUTCFullYear(); month = target.getUTCMonth();
      loadMonth();
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    today.addEventListener('click', () => {
      const currentDay = dateKey(new Date()).split('-').map(Number);
      year = currentDay[0]; month = currentDay[1] - 1;
      loadMonth();
    });
    loadMonth();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
