/**
 * THE GREAT NOTCH INN — Main Interactive Engine
 * Est. 1939 • Little Falls, NJ
 * Google Calendar integration, lightbox gallery, image error handling & event modal
 */

document.addEventListener('DOMContentLoaded', function() {
  // 1. Live Tonight Jump Button
  const liveTonightBtn = document.getElementById('liveTonightBtn');
  if (liveTonightBtn) {
    liveTonightBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const cal = document.querySelector('#calendar');
      if (cal) cal.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }

  // 2. Lazy section backgrounds + calendar embed, mobile nav, lightbox
  setupLazyLoading();
  setupNav();
  setupLightbox();

  // 3. Setup Contact Form
  setupContactForm();

  // 4. Initialize Google Calendar API & Table
  initGoogleCalendar();

  // 5. YouTube click-to-play (loads the player only when asked)
  setupVideoFacades();
});

function setupVideoFacades() {
  document.querySelectorAll('.yt-facade').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id = btn.getAttribute('data-yt');
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=1';
      iframe.title = btn.querySelector('.yt-title') ? btn.querySelector('.yt-title').textContent : 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      iframe.tabIndex = 0;
      iframe.setAttribute('data-gni-player', '');
      // Restoring this original button preserves its play handler and removes the active player.
      iframe.addEventListener('gni:stop', () => iframe.replaceWith(btn), { once: true });
      btn.replaceWith(iframe);
      iframe.focus();
    });
  });
}

/* --------------------------------------------------------------------------
   Dialog helpers: focus goes into the dialog, Tab stays inside, focus returns on close
   -------------------------------------------------------------------------- */
function trapFocus(container, e) {
  if (e.key !== 'Tab') return;
  const f = Array.from(container.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.disabled && el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* --------------------------------------------------------------------------
   Lazy loading: section background photos and the Google Calendar embed
   -------------------------------------------------------------------------- */
function setupLazyLoading() {
  const sections = document.querySelectorAll('.parallax:not(#home)');
  const cal = document.querySelector('.calendar-embed iframe[data-src]');
  const loadCal = () => { if (cal && !cal.getAttribute('src')) cal.src = cal.dataset.src; };
  if (!('IntersectionObserver' in window)) {
    sections.forEach(s => s.classList.add('bg-in'));
    loadCal();
    return;
  }
  const bgObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('bg-in'); obs.unobserve(en.target); } });
  }, { rootMargin: '600px 0px' });
  sections.forEach(s => bgObs.observe(s));
  if (cal) {
    const calObs = new IntersectionObserver((entries, obs) => {
      if (entries.some(en => en.isIntersecting)) { loadCal(); obs.disconnect(); }
    }, { rootMargin: '300px 0px' });
    calObs.observe(cal);
  }
}

/* --------------------------------------------------------------------------
   Mobile navigation (hamburger)
   -------------------------------------------------------------------------- */
function setupNav() {
  const nav = document.getElementById('site-nav');
  const toggle = nav ? nav.querySelector('.nav-toggle') : null;
  if (!nav || !toggle) return;
  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-inner a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); } });
}

/* --------------------------------------------------------------------------
   Lightbox Gallery for Photos & Merch
   -------------------------------------------------------------------------- */
function setupLightbox() {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  if (!lb || !lbImg) return;

  const allImages = Array.from(document.querySelectorAll('#photos .gallery img, #merchandise figure img'));
  let currentIndex = 0;
  let lastFocus = null;

  function show(i) {
    currentIndex = (i + allImages.length) % allImages.length;
    const img = allImages[currentIndex];
    lbImg.src = img.dataset.full || img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
  }
  function openLightbox(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    lb.classList.add('open');
    setPageDialogState(true);
    document.getElementById('lbClose').focus();
  }
  function closeLightbox() {
    lb.classList.remove('open');
    lb.hidden = true;
    lbImg.removeAttribute('src');
    setPageDialogState(false);
    if (lastFocus) lastFocus.focus();
  }
  function navLightbox(dir) { if (allImages.length) show(currentIndex + dir); }

  window.closeLightbox = closeLightbox;
  window.navLightbox = navLightbox;

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => navLightbox(-1));
  document.getElementById('lbNext').addEventListener('click', () => navLightbox(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') navLightbox(1);
    else if (e.key === 'ArrowLeft') navLightbox(-1);
    else trapFocus(lb, e);
  });

  // Swipe left/right on touch screens
  let startX = null;
  lb.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) navLightbox(dx < 0 ? 1 : -1);
    startX = null;
  });

  // Every photo/merch image opens the viewer; make them keyboard-reachable too
  allImages.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'View larger: ' + (img.alt || 'photo'));
    img.addEventListener('click', () => openLightbox(i));
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
  });
}

/* --------------------------------------------------------------------------
   Contact Form Handler (Mailto & Direct Client)
   -------------------------------------------------------------------------- */
function setupContactForm() {
  const contactForm = document.getElementById('contactForm');
  const openMailBtn = document.getElementById('openMailBtn');

  if (contactForm) {
    contactForm.addEventListener('input', function(e) {
      if (e.target.setCustomValidity) e.target.setCustomValidity('');
    });
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const fields = contactForm.elements;
      const field = key => fields.namedItem(key);
      const value = key => field(key) ? field(key).value.trim() : '';
      const name = value('name');
      const email = value('email');
      const phone = value('phone');
      const message = value('message');

      // The HTML uses novalidate so validate explicitly before opening an email app.
      ['name', 'message'].forEach(key => {
        if (field(key)) field(key).setCustomValidity(value(key) ? '' : 'Please complete this field.');
      });
      if (!contactForm.reportValidity()) return;

      const subject = encodeURIComponent('Inquiry from ' + name + ' — The Great Notch Inn');
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n\n' +
        'Message:\n' + message
      );

      window.location.href = 'mailto:greatnotchinn@gmail.com?subject=' + subject + '&body=' + body;
    });
  }

  if (openMailBtn) {
    openMailBtn.addEventListener('click', function() {
      window.location.href = 'mailto:greatnotchinn@gmail.com';
    });
  }
}

/* --------------------------------------------------------------------------
   Google Calendar API Fetcher & Table Generator
   -------------------------------------------------------------------------- */
// Calendar entries always use the venue's Eastern time, including for visitors elsewhere.
const CALENDAR_TIME_ZONE = 'America/New_York';
function isTimedCalendarEvent(event) {
  return Boolean(event && event.status !== 'cancelled' && event.start &&
    typeof event.start.dateTime === 'string' && !event.start.date &&
    Number.isFinite(Date.parse(event.start.dateTime)));
}
function calendarDateKey(value) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CALENDAR_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(value));
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
}
function calendarStart(start) {
  // Date-only values are civil dates. UTC noon stays on that date in New Jersey all year.
  return new Date(start.dateTime || start.date + 'T12:00:00Z');
}
function calendarDay(start) {
  return start.date || calendarDateKey(start.dateTime);
}
function calendarDateLabel(start, options) {
  return calendarStart(start).toLocaleDateString('en-US', { ...options, timeZone: CALENDAR_TIME_ZONE });
}
function calendarTimeLabel(value) {
  return new Date(value).toLocaleTimeString('en-US', {
    timeZone: CALENDAR_TIME_ZONE, hour: 'numeric', minute: '2-digit'
  });
}
function setPageDialogState(open) {
  ['main', '.site-header', '.action-bar', 'footer'].forEach(selector => {
    const element = document.querySelector(selector);
    if (element) element.inert = open;
  });
  document.body.style.overflow = open ? 'hidden' : '';
}

function initGoogleCalendar() {
  const calendarId = encodeURIComponent('greatnotchinn@gmail.com');
  const apiKey = 'AIzaSyDXDA1_OaHw-OV3JQwdIT6RmV8yl3rNVvM';
  const CACHE_KEY = 'gni_calendar_cache_v7';
  const CACHE_TTL = 15 * 60 * 1000; // 15 mins

  const now = new Date();
  const todayStr = calendarDateKey(now);

  const futureBody = document.querySelector('#future tbody');
  const pastBody = document.querySelector('#past tbody');
  const showMoreBtn = document.getElementById('showMoreBtn');
  const togglePastBtn = document.getElementById('togglePastBtn');
  const eventModal = document.getElementById('eventModal');

  let allFutureEvents = [];
  let displayedCount = 0;
  const compactEvents = window.matchMedia('(max-width: 700px)').matches;
  const INITIAL_EVENTS = compactEvents ? 5 : 10;
  const MORE_EVENTS = compactEvents ? 5 : 10;

  function getCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Number.isFinite(parsed.timestamp) || Date.now() - parsed.timestamp > CACHE_TTL ||
          !parsed.data || !Array.isArray(parsed.data.future) || !Array.isArray(parsed.data.past)) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return {
        future: parsed.data.future.filter(isTimedCalendarEvent),
        past: parsed.data.past.filter(isTimedCalendarEvent)
      };
    } catch {
      // Private browsing and file previews may not permit access to storage.
      return null;
    }
  }

  function setCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
    } catch(e) {}
  }

  function fetchEvents() {
    const pastStart = new Date();
    pastStart.setDate(pastStart.getDate() - 30);

    const futureUrl =
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events` +
      `?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${now.toISOString()}&maxResults=250`;

    const pastUrl =
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events` +
      `?key=${apiKey}&singleEvents=true&orderBy=startTime` +
      `&timeMin=${pastStart.toISOString()}&timeMax=${now.toISOString()}&maxResults=250`;

    const request = async url => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Calendar status ${response.status}`);
        const result = await response.json();
        return (result.items || []).filter(isTimedCalendarEvent);
      } finally {
        clearTimeout(timeout);
      }
    };

    Promise.allSettled([request(futureUrl), request(pastUrl)]).then(([future, past]) => {
      // An unavailable history request must not hide a working upcoming schedule.
      const payload = {
        future: future.status === 'fulfilled' ? future.value : [],
        past: past.status === 'fulfilled' ? past.value : []
      };
      if (future.status === 'fulfilled' && past.status === 'fulfilled') setCache(payload);
      renderEvents(payload);
      if (future.status === 'rejected') renderFallbackEvents();
      if (past.status === 'rejected' && pastBody) {
        pastBody.innerHTML = '<tr><td colspan="3">Past events are temporarily unavailable. Please use the calendar link below.</td></tr>';
      }
    });
  }

  function renderFallbackEvents() {
    // No invented events: if the calendar can't be reached, point people to the real Google Calendar.
    if (!futureBody) return;
    futureBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">Couldn\'t load the schedule right now. ' +
      '<a href="https://calendar.google.com/calendar/u/0/embed?src=greatnotchinn@gmail.com" target="_blank" rel="noopener noreferrer">Open the Google Calendar</a>.</td></tr>';
    if (showMoreBtn) showMoreBtn.style.display = 'none';
  }

  function renderEvents({ future, past }) {
    if (!futureBody) return;
    allFutureEvents = future.filter(isTimedCalendarEvent);
    past = past.filter(isTimedCalendarEvent);
    displayedCount = 0;
    futureBody.innerHTML = '';
    if (pastBody) pastBody.innerHTML = '';

    if (!allFutureEvents.length) {
      futureBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">No upcoming timed events are currently scheduled. Check the monthly calendar below.</td></tr>';
      if (showMoreBtn) showMoreBtn.style.display = 'none';
    } else {
      loadMoreEvents();
    }

    if (pastBody && !past.length) {
      pastBody.innerHTML = '<tr><td colspan="3">No recent past timed events are available.</td></tr>';
    }
    if (pastBody && past.length) {
      const recentPast = past
        .sort((a, b) => calendarStart(b.start) - calendarStart(a.start))
        .slice(0, 14);
      recentPast.forEach(e => renderRow(e, pastBody));
    }
  }

  function loadMoreEvents() {
    const eventsToLoad = displayedCount === 0 ? INITIAL_EVENTS : MORE_EVENTS;
    const nextBatch = allFutureEvents.slice(displayedCount, displayedCount + eventsToLoad);
    nextBatch.forEach(e => renderRow(e, futureBody));
    displayedCount += nextBatch.length;

    if (showMoreBtn) {
      showMoreBtn.style.display = displayedCount >= allFutureEvents.length ? 'none' : 'block';
    }
  }

  function renderRow(event, tbody) {
    if (!isTimedCalendarEvent(event)) return;

    const date = calendarDateLabel(event.start, { weekday: 'short', month: 'short', day: 'numeric' });
    const time = calendarTimeLabel(event.start.dateTime) + ' ET';
    const isToday = calendarDay(event.start) === todayStr;

    const tr = document.createElement('tr');
    const tdDate = document.createElement('td');
    const strong = document.createElement('strong');
    strong.textContent = date;
    tdDate.appendChild(strong);

    const tdTitle = document.createElement('td');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'event-link';
    btn.textContent = event.summary || 'Live Music';
    btn.setAttribute('aria-label', (event.summary || 'Live Music') + ', ' + date + ' ' + time + ': show details');
    tdTitle.appendChild(btn);
    if (isToday) {
      const badge = document.createElement('span');
      badge.className = 'live-badge';
      badge.textContent = event.start.dateTime && tbody === futureBody && !/^(?:open|closed)\b/i.test(event.summary || '') ? 'LIVE TONIGHT' : 'TODAY';
      tdTitle.appendChild(badge);
    }

    const tdTime = document.createElement('td');
    const t = document.createElement('span');
    t.className = 'event-time';
    t.textContent = time;
    tdTime.appendChild(t);

    tr.append(tdDate, tdTitle, tdTime);
    if (isToday) tr.classList.add('today');
    tr.addEventListener('click', e => { if (e.target !== btn) openEventModal(event); });
    btn.addEventListener('click', () => openEventModal(event));
    tbody.appendChild(tr);
  }

  let modalLastFocus = null;
  function openEventModal(event, trigger) {
    if (!eventModal || !isTimedCalendarEvent(event)) return;
    const dateStr = calendarDateLabel(event.start, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = calendarTimeLabel(event.start.dateTime) +
      (event.end && event.end.dateTime ? ' – ' + calendarTimeLabel(event.end.dateTime) : '') + ' ET';

    const titleEl = document.getElementById('modalTitle');
    const timeEl = document.getElementById('modalTime');
    const descEl = document.getElementById('modalDesc');
    const locEl = document.getElementById('modalLocation');
    const linkEl = document.getElementById('modalLink');

    if (titleEl) titleEl.textContent = event.summary || 'Live Music Performance';
    if (timeEl) timeEl.textContent = `${dateStr} • ${timeStr}`;
    if (descEl) descEl.textContent = event.description || 'Live rock & blues at The Great Notch Inn. No cover charge.';
    if (locEl) locEl.textContent = event.location ? `📍 ${event.location}` : '📍 The Great Notch Inn, 400 Route 46 West, Little Falls, NJ';
    if (linkEl) {
      const fallback = 'https://calendar.google.com/calendar/u/0/embed?src=greatnotchinn@gmail.com';
      try {
        const target = new URL(event.htmlLink || fallback);
        linkEl.href = target.protocol === 'https:' && /(^|\.)google\.com$/.test(target.hostname) ? target.href : fallback;
      } catch {
        linkEl.href = fallback;
      }
    }

    modalLastFocus = trigger && typeof trigger.focus === 'function' ? trigger : document.activeElement;
    eventModal.hidden = false;
    eventModal.classList.add('active');
    setPageDialogState(true);
    const closeBtn = document.getElementById('modalClose');
    if (closeBtn) closeBtn.focus();
  }

  function closeEventModal() {
    if (eventModal) {
      eventModal.classList.remove('active');
      eventModal.hidden = true;
      setPageDialogState(false);
      if (modalLastFocus) modalLastFocus.focus();
    }
  }

  function togglePast() {
    const p = document.getElementById('past-wrap');
    if (!p || !togglePastBtn) return;
    const open = p.style.display === 'none';
    p.style.display = open ? 'block' : 'none';
    togglePastBtn.textContent = open ? 'Hide Past Events ▲' : 'Show Past Events ▼';
    togglePastBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }


  // Shared with the onsite monthly calendar. The trigger receives focus when the dialog closes.
  window.gniOpenEvent = openEventModal;
  window.openEventModal = openEventModal;
  window.closeEventModal = closeEventModal;
  window.togglePast = togglePast;

  if (eventModal) {
    eventModal.addEventListener('click', function(e) {
      if (e.target === eventModal) closeEventModal();
    });
  }

  const modalCloseBtn = document.getElementById('modalClose');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEventModal);

  document.addEventListener('keydown', function(e) {
    if (!eventModal || eventModal.hidden) return;
    if (e.key === 'Escape') closeEventModal();
    else trapFocus(eventModal, e);
  });

  if (showMoreBtn) showMoreBtn.addEventListener('click', loadMoreEvents);
  if (togglePastBtn) togglePastBtn.addEventListener('click', togglePast);

  // Initialize
  const cached = getCache();
  if (cached) {
    renderEvents(cached);
  } else {
    fetchEvents();
  }
}
