/* Dreiland consumer bootstrap; only the credit wish crosses from the calculator. */
const root = document.querySelector('#application-form');
const status = document.querySelector('#application-status');
const base = new URL('credit-runtime/', location.href);
let api;
try {
  const response = await fetch(new URL('shared/runtime.json', base), { cache: 'no-store' });
  if (!response.ok) throw new Error('Runtime unavailable');
  const descriptor = await response.json();
  if (descriptor.namespace !== 'dreilandfinanzen' || descriptor.mode !== 'prepare' || !/^[a-z0-9-]+-[a-f0-9]{10}$/.test(descriptor.assetVersion)) throw new Error('Runtime configuration mismatch');
  const { loadRuntime, mountCreditRequest } = await import(new URL(`js/runtime.js?v=${descriptor.assetVersion}`, base));
  const runtime = await loadRuntime(base.href);
  if (runtime.namespace !== 'dreilandfinanzen' || runtime.mode !== 'prepare'
      || runtime.assetVersion !== descriptor.assetVersion || runtime.revision !== descriptor.revision) throw new Error('Runtime changed during initialization');
  const { queryCredit } = await import(runtime.entrypoints.query);
  const credit = queryCredit(location.search);
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet'; sheet.href = runtime.entrypoints.requestCss;
  const stylesReady = new Promise((resolve, reject) => { sheet.onload = resolve; sheet.onerror = reject; });
  document.head.insertBefore(sheet, document.querySelector('link[rel="stylesheet"]'));
  await stylesReady;
  const backLink = document.querySelector('#application-back');
  const returnURL = value => `./?amount=${value.amount}&months=${value.months}#rechner`;
  api = await mountCreditRequest(root, runtime, {
    locale: 'de-CH', ...credit,
    onBackToCalculator(value) { location.href = returnURL(value); },
  });
  const attribution = await fetch(new URL(`fragments/attribution.html?v=${runtime.assetVersion}`, base));
  if (!attribution.ok) throw new Error('Attribution unavailable');
  document.querySelector('#application-attribution').innerHTML = await attribution.text();
  // A deliberate calculator handoff takes precedence over an older local draft's credit wish.
  if (credit.enteredFields.length || credit.invalid) api.setCredit(credit);
  backLink.href = returnURL(api.getCredit());
  backLink.addEventListener('click', () => { backLink.href = returnURL(api.getCredit()); });
  root.setAttribute('aria-busy', 'false');
  status.hidden = !credit.invalid;
  if (credit.invalid) status.textContent = 'Die übergebenen Kreditangaben waren ungültig. Bitte prüfen Sie Betrag und Laufzeit im Formular.';
} catch {
  api?.destroy();
  root.replaceChildren();
  root.setAttribute('aria-busy', 'false');
  status.hidden = false;
  status.textContent = 'Das Antragsformular ist im Moment nicht verfügbar. Bitte versuchen Sie es später erneut oder nehmen Sie über «Beratung» Kontakt auf.';
}
