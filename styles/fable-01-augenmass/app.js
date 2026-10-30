/* Dreiland Finanzen – «Augenmass»: Kreditrechner mit Zinsanteil pro Monat und Tragbarkeit */
(function () {
  "use strict";

  var EFF = 0.089;                               // Beispiel: 8.9 % eff. Jahreszins
  var I = Math.pow(1 + EFF, 1 / 12) - 1;         // Monatszins aus effektivem Jahreszins
  var LIMIT_OK = 0.35;                            // Rate ≤ 35 % des freien Budgets: tragbar
  var LIMIT_KNAPP = 0.6;                          // bis 60 %: knapp, darüber: lieber weniger

  var $ = function (id) { return document.getElementById(id); };
  var betrag = $("betrag"), betragOut = $("betrag-out"), rateEl = $("rate"), zinsenEl = $("zinsen");
  var strip = $("strip"), einkommen = $("einkommen"), fixkosten = $("fixkosten");
  var ampel = $("ampel"), vorschlag = $("vorschlag");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function chf(n, cents) {
    var v = cents ? n.toFixed(2) : String(Math.round(n));
    var parts = v.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return "CHF " + parts[0] + (cents ? "." + parts[1] : ".–");
  }

  function laufzeit() {
    var r = document.querySelector('input[name="laufzeit"]:checked');
    return r ? parseInt(r.value, 10) : 36;
  }

  function annuitaet(p, n) { return p * I / (1 - Math.pow(1 + I, -n)); }

  function drawStrip(p, n, rate) {
    var W = 360, H = 44, gap = n > 36 ? 1 : 2;
    var w = (W - gap * (n - 1)) / n;
    var rest = p, html = "";
    var frag = document.createDocumentFragment();
    var ns = "http://www.w3.org/2000/svg";
    var old = strip.querySelectorAll("rect");
    for (var k = 0; k < n; k++) {
      var zins = rest * I;
      var tilg = rate - zins;
      rest -= tilg;
      var hZ = H * (zins / rate);
      var x = k * (w + gap);
      var r1 = document.createElementNS(ns, "rect");
      r1.setAttribute("x", x); r1.setAttribute("y", hZ); r1.setAttribute("width", w); r1.setAttribute("height", H - hZ);
      r1.setAttribute("fill", "#0A4682");
      var r2 = document.createElementNS(ns, "rect");
      r2.setAttribute("x", x); r2.setAttribute("y", 0); r2.setAttribute("width", w); r2.setAttribute("height", hZ);
      r2.setAttribute("fill", "#C69D49");
      frag.appendChild(r1); frag.appendChild(r2);
    }
    for (var j = 0; j < old.length; j++) old[j].remove();
    strip.appendChild(frag);
  }

  function tragbarkeit(rate) {
    var e = parseFloat(einkommen.value), f = parseFloat(fixkosten.value);
    vorschlag.hidden = true;
    if (!(e > 0) || isNaN(f)) {
      ampel.dataset.state = "leer";
      ampel.textContent = "Tragen Sie Einkommen und Fixkosten ein – wir rechnen offen.";
      return;
    }
    var frei = e - f;
    if (frei <= 0) {
      ampel.dataset.state = "nein";
      ampel.textContent = "Ihre Fixkosten übersteigen das Einkommen. Ein Kredit wäre hier nicht verantwortbar – reden wir trotzdem.";
      return;
    }
    var q = rate / frei;
    if (q <= LIMIT_OK) {
      ampel.dataset.state = "ok";
      ampel.textContent = "Das passt. Nach der Rate bleiben Ihnen rund " + chf(frei - rate) + " im Monat.";
    } else if (q <= LIMIT_KNAPP) {
      ampel.dataset.state = "knapp";
      ampel.textContent = "Das wird knapp. Nach der Rate bleiben rund " + chf(frei - rate) + " – wenig Reserve für Unvorhergesehenes.";
      schlageVor(frei);
    } else {
      ampel.dataset.state = "nein";
      ampel.textContent = "Ehrlich gesagt: lieber weniger. Diese Rate würde Sie zu stark belasten.";
      schlageVor(frei);
    }
  }

  function schlageVor(frei) {
    var n = laufzeit();
    var maxRate = frei * LIMIT_OK;
    var maxP = maxRate * (1 - Math.pow(1 + I, -n)) / I;
    maxP = Math.floor(maxP / 500) * 500;
    if (maxP >= 1000 && maxP < parseInt(betrag.value, 10)) {
      vorschlag.hidden = false;
      vorschlag.textContent = "Tragbar wären etwa " + chf(maxP) + " – übernehmen";
      vorschlag.dataset.value = maxP;
    }
  }

  function update() {
    var p = parseInt(betrag.value, 10), n = laufzeit();
    var rate = annuitaet(p, n);
    var total = rate * n;
    betragOut.value = chf(p);
    betragOut.textContent = chf(p);
    betrag.setAttribute("aria-valuetext", chf(p));
    var pct = (p - betrag.min) / (betrag.max - betrag.min) * 100;
    betrag.style.setProperty("--p", pct.toFixed(2) + "%");
    rateEl.textContent = chf(rate, true);
    zinsenEl.textContent = chf(total - p, true);
    drawStrip(p, n, rate);
    tragbarkeit(rate);
  }

  betrag.addEventListener("input", update);
  document.querySelectorAll('input[name="laufzeit"]').forEach(function (r) { r.addEventListener("change", update); });
  einkommen.addEventListener("input", update);
  fixkosten.addEventListener("input", update);
  vorschlag.addEventListener("click", function () {
    betrag.value = vorschlag.dataset.value;
    update();
    betrag.focus();
  });
  document.getElementById("rechner").addEventListener("submit", function (e) { e.preventDefault(); });

  if (reduced) strip.classList.add("static");
  update();
})();
