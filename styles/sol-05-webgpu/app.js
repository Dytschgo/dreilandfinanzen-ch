(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const form = $('budget-form');
  const format = value => new Intl.NumberFormat('de-CH', {minimumFractionDigits:2,maximumFractionDigits:2}).format(value).replace(/[’\u2019]/g,"'");
  const chf = value => 'CHF ' + format(value);
  function update() {
    const amount = +$('amount').value, months = +$('months').value;
    const income = +$('income').value, expenses = +$('expenses').value;
    const valid = $('income').value !== '' && $('expenses').value !== '' && $('income').validity.valid && $('expenses').validity.valid;
    $('amount-label').textContent='CHF '+new Intl.NumberFormat('de-CH').format(amount).replace(/[’\u2019]/g,"'")+'.–';
    $('months-label').textContent=months+' Monate';
    for(const id of ['amount','months']){const input=$(id);input.style.setProperty('--fill',((input.value-input.min)/(input.max-input.min)*100)+'%');}
    // Effective annual example rate converted to the equivalent monthly rate.
    const rate = Math.pow(1+.089,1/12)-1;
    const payment = amount*rate/(1-Math.pow(1+rate,-months));
    const total=payment*months, remaining=income-expenses-payment, reserve=income>0?remaining/income:-1;
    $('monthly').textContent=chf(payment);$('total').textContent=chf(total);$('interest').textContent=chf(total-amount);
    let status=reserve>=.15?'good':reserve>=.05?'warning':'danger';
    if(!valid)status='invalid';
    const titles={good:'Spielraum vorhanden',warning:'Der Spielraum ist knapp',danger:'Diese Belastung ist zu hoch',invalid:'Bitte prüfen Sie Ihre Eingaben'};
    $('affordability').dataset.state=status;
    $('status-title').textContent=titles[status];
    $('status-text').textContent=!valid?'Bitte geben Sie für Einkommen und Ausgaben gültige Beträge ab CHF 0 ein.':remaining<0?'Ausgaben und Rate übersteigen Ihr Einkommen um '+chf(Math.abs(remaining))+' pro Monat.': 'Nach Ausgaben und Rate bleiben '+chf(remaining)+' pro Monat.';
    $('affordability').querySelector('.status-icon').textContent=status==='good'?'✓':status==='warning'?'!':'×';
    window.dispatchEvent(new CustomEvent('budgetchange',{detail:{pressure:valid?Math.max(0,Math.min(1,1-reserve*3)):1,reserve:valid?Math.max(-1,Math.min(1,reserve)):0,status,payment,total,remaining}}));
  }
  form.addEventListener('input',update);for(const id of ['income','expenses'])$(id).addEventListener('input',update);form.addEventListener('submit',event=>event.preventDefault());update();
  const dialog=$('contact-dialog');
  for (const id of ['contact-button','contact-button-footer']) $(id).addEventListener('click',()=>dialog.showModal());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
})();
