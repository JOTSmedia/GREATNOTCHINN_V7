/* A paced introduction with a real readiness gate and an independent exit deadline. */
(function () {
  'use strict';
  const root = document.documentElement;
  const loader = document.getElementById('site-loader');
  if (!loader || !root.classList.contains('is-loading')) return;
  const started = performance.now();
  const duration = 4000;
  const progress = document.getElementById('loader-progress');
  const status = loader.querySelector('.loader-status');
  const content = Array.from(document.body.children).filter(el =>
    el !== loader && el.tagName !== 'SCRIPT' && !el.inert);
  content.forEach(el => { el.inert = true; el.setAttribute('data-loading-inert', ''); });
  let done = false;
  let ready = false;
  let completedAt = null;
  let frame;
  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(frame);
    clearTimeout(window.gniLoadingDeadline);
    const restoreFocus = loader.contains(document.activeElement);
    root.classList.remove('is-loading');
    content.forEach(el => { el.inert = false; el.removeAttribute('data-loading-inert'); });
    loader.setAttribute('aria-hidden', 'true');
    if (restoreFocus) document.querySelector('.skip-link')?.focus({ preventScroll: true });
  }
  document.getElementById('skip-loader')?.addEventListener('click', finish);
  const hero = document.getElementById('hero-image-insert');
  const imageReady = !hero || (hero.complete && hero.naturalWidth) ? Promise.resolve() :
    new Promise(resolve => {
      hero.addEventListener('load', resolve, { once: true });
      hero.addEventListener('error', resolve, { once: true });
    });
  // The progress represents the introduction plus the hero image, not byte-transfer percentage.
  Promise.race([imageReady, new Promise(resolve => setTimeout(resolve, 6500))])
    .then(() => { ready = true; });
  function tick(now) {
    if (done) return;
    const elapsed = now - started;
    const value = Math.min(ready ? 100 : 90, elapsed / duration * 100);
    if (progress) progress.value = value;
    if (value === 100) {
      if (completedAt === null) {
        completedAt = now;
        if (status) status.textContent = 'WELCOME TO THE NOTCH.';
      }
      if (now - completedAt >= 200) { finish(); return; }
    }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
})();
