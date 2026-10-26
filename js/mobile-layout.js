/* Compact phone reading without removing content or changing the desktop layout. */
(function () {
  'use strict';
  function initialize() {
    const media = window.matchMedia('(max-width: 700px)');
    const disclosures = Array.from(document.querySelectorAll('details.responsive-disclosure'));
    const sectionTargets = new Set(['about', 'articles', 'photos', 'videos', 'links', 'merchandise', 'history', 'contact', 'hours']);
    let mobile = media.matches;
    const collections = [
      { selector: '#photoGrid > img', container: 'photoGrid', button: 'show-more-photos', step: 6, label: 'photos', shown: 6 },
      { selector: '#merchandise .merch-grid > figure', button: 'show-more-merch', step: 4, label: 'items', shown: 4 },
      { selector: '#bandLinks .static-band-card', container: 'bandLinks', button: 'show-more-bands', step: 8, label: 'bands', shown: 8 },
      { selector: '#videos .video-grid > .video-item', button: 'show-more-videos', step: 2, label: 'videos', shown: 2 },
      { selector: '#articlesList > .static-article-item', container: 'articlesList', button: 'show-more-articles', step: 3, label: 'articles', shown: 3 }
    ].map(collection => ({ ...collection,
      items: Array.from(document.querySelectorAll(collection.selector)),
      control: document.getElementById(collection.button)
    }));

    function stopPlayers(container) {
      container.querySelectorAll('iframe[data-gni-player]').forEach(player => {
        player.dispatchEvent(new Event('gni:stop'));
      });
    }
    function renderCollection(collection) {
      collection.items.forEach((item, index) => {
        const hidden = mobile && index >= collection.shown;
        if (hidden) stopPlayers(item);
        item.hidden = hidden;
      });
      const remaining = Math.max(0, collection.items.length - collection.shown);
      if (collection.control) {
        collection.control.hidden = !mobile || remaining === 0;
        collection.control.textContent = `Show ${Math.min(collection.step, remaining)} more ${collection.label} (${remaining} remaining)`;
        if (collection.container) collection.control.setAttribute('aria-controls', collection.container);
      }
    }
    collections.forEach(collection => {
      if (collection.control) collection.control.addEventListener('click', () => {
        if (!mobile) return;
        collection.shown = Math.min(collection.items.length, collection.shown + collection.step);
        renderCollection(collection);
      });
    });

    function revealHash(hash) {
      if (!hash || hash === '#') return null;
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
      const target = document.getElementById(id);
      if (!target) return null;
      let opened = false;
      function open(disclosure) {
        if (disclosure && !disclosure.open) { disclosure.open = true; opened = true; }
      }
      // An anchor inside a disclosure may need several enclosing disclosures opened first.
      for (let element = target; element; element = element.parentElement) {
        if (element.tagName === 'DETAILS') open(element);
      }
      // Section anchors point outside their details wrapper. Home/calendar keep their optional folds.
      if (sectionTargets.has(id)) open(target.querySelector('details.responsive-disclosure'));
      return { target, opened };
    }
    function revealCurrentHash(scroll) {
      const result = revealHash(window.location.hash);
      if (scroll && result && result.opened) requestAnimationFrame(() => {
        result.target.scrollIntoView({ block: 'start', behavior: 'auto' });
      });
    }
    disclosures.forEach(disclosure => {
      const summary = Array.from(disclosure.children).find(child => child.tagName === 'SUMMARY');
      if (!summary) return;
      summary.addEventListener('click', event => { if (!mobile) event.preventDefault(); });
      summary.addEventListener('keydown', event => {
        if (!mobile && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
      });
      disclosure.addEventListener('toggle', () => {
        if (!mobile && !disclosure.open) disclosure.open = true;
        else if (mobile && !disclosure.open && disclosure.closest('#videos')) stopPlayers(disclosure);
      });
    });
    function applyLayout() {
      mobile = media.matches;
      disclosures.forEach(disclosure => {
        const summary = Array.from(disclosure.children).find(child => child.tagName === 'SUMMARY');
        if (mobile) {
          if (disclosure.hasAttribute('data-mobile-collapsed')) disclosure.open = false;
          if (summary) { summary.removeAttribute('tabindex'); summary.removeAttribute('aria-disabled'); }
        } else {
          disclosure.open = true;
          if (summary) { summary.setAttribute('tabindex', '-1'); summary.setAttribute('aria-disabled', 'true'); }
        }
      });
      collections.forEach(renderCollection);
    }
    document.addEventListener('click', event => {
      const anchor = event.target.closest && event.target.closest('a[href^="#"]');
      if (anchor) revealHash(anchor.getAttribute('href'));
    }, true);
    window.addEventListener('hashchange', () => revealCurrentHash(true));
    const onBreakpointChange = () => { applyLayout(); revealCurrentHash(false); };
    if (media.addEventListener) media.addEventListener('change', onBreakpointChange);
    else media.addListener(onBreakpointChange);
    applyLayout();
    revealCurrentHash(true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
