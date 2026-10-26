/* Phone content stays visible in swipe rails; only the optional monthly view folds. */
(function () {
  'use strict';
  function initialize() {
    const media = window.matchMedia('(max-width: 700px)');
    const months = Array.from(document.querySelectorAll('details.month-disclosure'));
    const collectionItems = Array.from(document.querySelectorAll(
      '#photoGrid > img, .video-grid > .video-item, .merch-grid > figure, #bandLinks .static-band-card, #articlesList > .static-article-item'
    ));
    const videoRail = document.querySelector('.video-grid');
    let mobile = media.matches;
    let videoObserver = null;

    function stopPlayers(container) {
      container.querySelectorAll('iframe[data-gni-player]').forEach(player => {
        player.dispatchEvent(new Event('gni:stop'));
      });
    }
    function revealHash(hash) {
      if (!hash || hash === '#') return null;
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
      const target = document.getElementById(id);
      if (!target) return null;
      let opened = false;
      // Deep links into the monthly view reveal it. Section links leave optional content alone.
      for (let element = target; element; element = element.parentElement) {
        if (element.tagName === 'DETAILS' && !element.open) { element.open = true; opened = true; }
      }
      return { target, opened };
    }
    function revealCurrentHash(scroll) {
      const result = revealHash(window.location.hash);
      if (scroll && result && result.opened) requestAnimationFrame(() => {
        result.target.scrollIntoView({ block: 'start', behavior: 'auto' });
      });
    }
    months.forEach(month => {
      const summary = Array.from(month.children).find(child => child.tagName === 'SUMMARY');
      if (!summary) return;
      summary.addEventListener('click', event => { if (!mobile) event.preventDefault(); });
      summary.addEventListener('keydown', event => {
        if (!mobile && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
      });
      month.addEventListener('toggle', () => { if (!mobile && !month.open) month.open = true; });
    });
    function observePhoneVideos() {
      if (videoObserver) { videoObserver.disconnect(); videoObserver = null; }
      if (!mobile || !videoRail || !('IntersectionObserver' in window)) return;
      videoObserver = new IntersectionObserver(entries => {
        if (!mobile) return;
        entries.forEach(entry => {
          if (!entry.isIntersecting || entry.intersectionRatio === 0) stopPlayers(entry.target);
        });
      }, { root: videoRail, threshold: 0 });
      videoRail.querySelectorAll('.video-item').forEach(card => videoObserver.observe(card));
    }
    function applyLayout() {
      mobile = media.matches;
      // Clear any visibility state left by an earlier compact layout; never remove collection content.
      collectionItems.forEach(item => { item.hidden = false; });
      months.forEach(month => {
        month.open = !mobile;
        const summary = Array.from(month.children).find(child => child.tagName === 'SUMMARY');
        if (!summary) return;
        if (mobile) { summary.removeAttribute('tabindex'); summary.removeAttribute('aria-disabled'); }
        else { summary.setAttribute('tabindex', '-1'); summary.setAttribute('aria-disabled', 'true'); }
      });
      observePhoneVideos();
    }
    document.addEventListener('click', event => {
      const target = event.target;
      const facade = target.closest && target.closest('.yt-facade');
      // Capture runs before the facade's own play handler creates the new player.
      if (mobile && facade) stopPlayers(document);
      const anchor = target.closest && target.closest('a[href^="#"]');
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
