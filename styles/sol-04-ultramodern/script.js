(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js-enabled');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let motionEnabled = !reduceMotion.matches;
  let pendingScroll = 0;
  let numberFrame = 0;
  let announceTimer;
  const motionButton = document.querySelector('.motion-toggle');
  const hero = document.querySelector('.hero');
  const hasScrollTimeline = CSS.supports('animation-timeline', 'view()');
  const hasPathMorph = CSS.supports('d', 'path("M0 0L1 1")');
  const orbit = document.querySelector('.morph-orbit');
  const orbitStart = [62,456,62,371,192,302,352,302,512,302,642,371,642,456,642,541,512,610,352,610,192,610,62,541,62,456];
  const orbitEnd = [62,456,62,456,352,289,352,289,352,289,642,456,642,456,642,456,352,623,352,623,352,623,62,456,62,456];
  function morphOrbit(progress) {
    if (!orbit) return;
    const v = orbitStart.map((value,index) => (value + (orbitEnd[index] - value) * progress).toFixed(2));
    orbit.setAttribute('d', `M${v[0]} ${v[1]}C${v.slice(2,8).join(' ')}C${v.slice(8,14).join(' ')}C${v.slice(14,20).join(' ')}C${v.slice(20).join(' ')}Z`);
  }

  function syncMotion() {
    motionEnabled = !reduceMotion.matches && !paused;
    root.classList.toggle('motion-on', motionEnabled);
    root.classList.toggle('motion-off', !motionEnabled);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.innerHTML = paused ? 'Bewegung aktivieren <span aria-hidden="true">▷</span>' : 'Bewegung pausieren <span aria-hidden="true">Ⅱ</span>';
    }
    if (!motionEnabled) {
      cancelAnimationFrame(numberFrame);
      document.querySelectorAll('.draw-ready').forEach(el => el.classList.add('draw-visible'));
      morphOrbit(0);
      if (currentResult) {
        displayedMonthly = currentResult.monthly;
        document.querySelector('#monthly').textContent = moneyNumber(currentResult.monthly);
      }
    }
    requestScroll();
  }
  function updateScroll() {
    pendingScroll = 0;
    if (!motionEnabled || (hasScrollTimeline && hasPathMorph) || document.hidden) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / (rect.height * .85)));
    if (!hasScrollTimeline) hero.style.setProperty('--assembly', progress.toFixed(4));
    morphOrbit(progress);
  }
  function requestScroll() {
    if (!pendingScroll) pendingScroll = requestAnimationFrame(updateScroll);
  }
  if (!hasScrollTimeline || !hasPathMorph) {
    addEventListener('scroll', requestScroll, {passive: true});
    addEventListener('resize', requestScroll, {passive: true});
  }
  document.addEventListener('visibilitychange', requestScroll);
  if (motionButton) motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reduceMotion.addEventListener('change', syncMotion);

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('draw-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .18});
    document.querySelectorAll('.service, .process-grid article, .regional-art').forEach(el => {
      el.classList.add('draw-ready');
      observer.observe(el);
    });
  }

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu(restoreFocus = false) {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menü öffnen');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('is-open')) closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());

  const amount = document.querySelector('#amount');
  const income = document.querySelector('#income');
  const expenses = document.querySelector('#expenses');
  const form = document.querySelector('#calculator-form');
  const monthlyOutput = document.querySelector('#monthly');
  const numberFormatter = new Intl.NumberFormat('de-CH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const integerFormatter = new Intl.NumberFormat('de-CH', {maximumFractionDigits: 0});
  const moneyNumber = value => numberFormatter.format(value).replace(/[’\u2019]/g, "'");
  const money = value => 'CHF ' + (Math.abs(value - Math.round(value)) < .005 ? integerFormatter.format(value).replace(/[’\u2019]/g, "'") + '.–' : moneyNumber(value));
  let currentResult = null;
  let displayedMonthly = 0;

  function animateMonthly(target, initial) {
    cancelAnimationFrame(numberFrame);
    if (!motionEnabled || initial) {
      monthlyOutput.textContent = moneyNumber(target);
      displayedMonthly = target;
      return;
    }
    const start = performance.now();
    const from = displayedMonthly;
    function tick(time) {
      const progress = Math.min(1, (time - start) / 360);
      displayedMonthly = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      monthlyOutput.textContent = moneyNumber(displayedMonthly);
      if (progress < 1) numberFrame = requestAnimationFrame(tick);
    }
    numberFrame = requestAnimationFrame(tick);
  }

  function calculate(initial = false) {
    const principal = Number(amount.value);
    const term = Number(form.elements.term.value);
    const net = Number(income.value);
    const costs = Number(expenses.value);
    document.querySelector('#amount-label').textContent = money(principal);
    amount.setAttribute('aria-valuetext', money(principal));
    amount.style.setProperty('--range', ((principal - 5000) / 95000 * 100) + '%');
    const valid = income.value.trim() !== '' && expenses.value.trim() !== '' && income.validity.valid && expenses.validity.valid;
    document.querySelector('#calculator-error').hidden = valid;
    income.setAttribute('aria-invalid', String(!income.validity.valid || income.value === ''));
    expenses.setAttribute('aria-invalid', String(!expenses.validity.valid || expenses.value === ''));
    document.querySelector('#calculator-result').dataset.valid = String(valid);
    const discuss = document.querySelector('#discuss-result');
    if (!valid) {
      currentResult = null;
      cancelAnimationFrame(numberFrame);
      monthlyOutput.textContent = '—';
      ['principal','interest','total'].forEach(id => document.getElementById(id).textContent = '—');
      document.querySelector('.budget-status').dataset.state = 'yellow';
      document.querySelector('#status-title').textContent = 'Angaben bitte vervollständigen';
      document.querySelector('#status-copy').textContent = 'Für die Orientierung brauchen wir Einkommen und Ausgaben.';
      document.querySelector('#expense-bar').setAttribute('width', '0');
      document.querySelector('#credit-bar').setAttribute('width', '0');
      discuss.textContent = 'Budget gemeinsam besprechen ↗';
      clearTimeout(announceTimer);
      document.querySelector('#calculator-announcement').textContent = 'Berechnung nicht möglich. Bitte prüfen Sie Ihre Angaben.';
      return;
    }
    // Effective annual example interest converted to the equivalent monthly rate.
    const monthlyInterest = Math.pow(1.089, 1 / 12) - 1;
    const monthly = principal * monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -term));
    const total = monthly * term;
    const free = net - costs - monthly;
    const state = free <= 0 ? 'red' : free < net * .1 ? 'yellow' : 'green';
    currentResult = {principal, term, monthly, total, interest: total - principal, free, net, costs, state};
    animateMonthly(monthly, initial);
    document.querySelector('#principal').textContent = money(principal);
    document.querySelector('#interest').textContent = money(total - principal);
    document.querySelector('#total').textContent = money(total);
    const status = document.querySelector('.budget-status');
    status.dataset.state = state;
    document.querySelector('#status-title').textContent = {green:'Rechnerisch Spielraum vorhanden',yellow:'Ihr Spielraum ist knapp',red:'Diese Belastung passt nicht ins Budget'}[state];
    document.querySelector('#status-copy').textContent = free <= 0 ? money(Math.abs(free)) + ' fehlen monatlich. Wir raten, die Belastung zu reduzieren.' : money(free) + ' nach Ausgaben und Kreditrate.';
    const base = Math.max(net, costs + monthly, 1);
    const expenseWidth = Math.min(440, costs / base * 440);
    const creditWidth = Math.max(0, Math.min(440 - expenseWidth - 3, monthly / base * 440 - 3));
    document.querySelector('#expense-bar').setAttribute('width', expenseWidth.toFixed(2));
    document.querySelector('#credit-bar').setAttribute('x', (Math.min(440, expenseWidth + 3)).toFixed(2));
    document.querySelector('#credit-bar').setAttribute('width', creditWidth.toFixed(2));
    document.querySelector('.budget-graphic').setAttribute('aria-label', 'Monatliches Beispielbudget. Ausgaben ' + money(costs) + ', Kreditrate ' + money(monthly) + ', verbleibender Spielraum ' + money(free));
    discuss.innerHTML = state === 'red' ? 'Alternativen besprechen <span aria-hidden="true">↗</span>' : 'Beratung vereinbaren <span aria-hidden="true">↗</span>';
    clearTimeout(announceTimer);
    if (!initial) announceTimer = setTimeout(() => {
      document.querySelector('#calculator-announcement').textContent = 'Beispielrate ' + money(monthly) + ' pro Monat. Gesamtrückzahlung ' + money(total) + '. ' + document.querySelector('#status-title').textContent + '. ' + document.querySelector('#status-copy').textContent;
    }, 450);
  }
  form.addEventListener('input', () => calculate());
  form.addEventListener('submit', event => event.preventDefault());
  calculate(true);
  syncMotion();

  document.querySelectorAll('[data-topic]').forEach(link => link.addEventListener('click', () => {document.querySelector('#contact-topic').value = link.dataset.topic;}));
  document.querySelector('#discuss-result').addEventListener('click', () => {
    document.querySelector('#contact-topic').value = 'Budgetcheck';
    if (currentResult) {
      const r = currentResult;
      document.querySelector('#contact-message').value = 'Ich möchte diese Beispielrechnung besprechen: ' + money(r.principal) + ' über ' + r.term + ' Monate, Beispielrate ' + money(r.monthly) + ' bei 8,9 % effektivem Jahreszins (Platzhalter).';
    }
  });

  const noteDialog = document.querySelector('#note-dialog');
  let noteText = '';
  document.querySelector('#contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    noteText = 'DREILAND FINANZEN\nPersönliche Gesprächsnotiz — Designvorschau\n\n' +
      'Name: ' + (String(data.get('name')).trim() || 'Nicht angegeben') + '\n' +
      'Anliegen: ' + data.get('topic') + '\n' +
      'Gespräch: ' + data.get('channel') + '\n\n' +
      (String(data.get('message')).trim() || 'Noch keine weiteren Angaben.') + '\n\n' +
      'Diese Notiz wurde nur lokal erstellt und nicht versendet. Es ist kein Termin gebucht.\n' +
      'Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).';
    document.querySelector('#note-content').textContent = noteText;
    noteDialog.showModal();
  });
  document.querySelector('#download-note').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([noteText], {type:'text/plain;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'dreiland-gespraechsnotiz.txt';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('.dialog-close,.dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  const information = {
    impressum: ['Impressum · Platzhalter', 'Dies ist eine lokale Designstudie für Dreiland Finanzen. Firmenadresse, verantwortliche Person, Rechtsform, Registerangaben und Kontaktangaben müssen vor einer Veröffentlichung ergänzt und geprüft werden.'],
    datenschutz: ['Datenschutz · Designvorschau', 'Diese statische Vorschau lädt Schriften und Grafiken lokal. Sie verwendet keine Analysewerkzeuge, Cookies oder externe Dienste. Rechner- und Kontaktangaben werden ausschliesslich im Arbeitsspeicher Ihres Browsers verarbeitet. Eine Notiz wird nur auf Ihre ausdrückliche Aktion heruntergeladen. Für einen produktiven Betrieb muss eine vollständige Datenschutzerklärung mit den tatsächlichen Betreiberdaten und Verarbeitungen ergänzt werden.']
  };
  document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
    const [title, body] = information[button.dataset.info];
    document.querySelector('#info-title').textContent = title;
    document.querySelector('#info-content').textContent = body;
    document.querySelector('#info-dialog').showModal();
  }));
})();
