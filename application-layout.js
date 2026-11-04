/* Consumer-owned layout around the unchanged credit-core progress navigation. */
export function compactStepNavigation(root) {
  const steps = root.querySelector('#request-steps');
  if (!steps || steps.closest('.application__steps')) return;
  const disclosure = document.createElement('details');
  disclosure.className = 'application__steps';
  const summary = document.createElement('summary');
  summary.textContent = 'Schritte wechseln';
  steps.before(disclosure);
  disclosure.append(summary, steps);
  steps.addEventListener('click', event => {
    const button = event.target.closest('[data-request-goto]');
    // Core validation runs first. Keep the list open when navigation is rejected.
    if (button?.getAttribute('aria-current') === 'step') disclosure.open = false;
  });
}
