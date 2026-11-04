/* Shared responsive header. */
(() => {
  const header = document.querySelector('.header');
  const burger = header.querySelector('.burger');
  const nav = header.querySelector('.nav');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    nav.classList.toggle('is-open', open);
  };
  new ResizeObserver(([entry]) => {
    document.documentElement.style.setProperty('--header-height', `${entry.borderBoxSize[0].blockSize}px`);
  }).observe(header);
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  header.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
})();
