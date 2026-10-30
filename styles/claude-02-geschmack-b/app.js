/* Dreiland Finanzen – «Das Heft»: Kreditrechner im Hero, Formular, ruhige Einblendungen. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Zahlenformat (Schweiz) ---------- */
  function group(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "’");
  }
  function chfRound(v) {            // CHF 15’000.–
    var n = Math.round(v);
    return (n < 0 ? "–" : "") + "CHF " + group(Math.abs(n)) + ".–";
  }
  function chfExact(v) {            // CHF 476.20
    var n = Math.round(v * 20) / 20; // auf 5 Rappen
    var abs = Math.abs(n);
    var fr = Math.floor(abs), rp = Math.round((abs - fr) * 100);
    if (rp === 100) { fr += 1; rp = 0; }
    return (n < 0 ? "–" : "") + "CHF " + group(fr) + "." + (rp < 10 ? "0" : "") + rp;
  }

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Kreditrechner (Hero) ---------- */
  var ZINS_EFF = 0.089; // Platzhalter: 8.9 % effektiver Jahreszins
  var betrag = $("betrag"), einkommen = $("einkommen"), fixkosten = $("fixkosten");

  if (betrag) {
    var verdict = $("verdict");
    var TEXT = {
      ok: ["Gut tragbar", "Genügend Spielraum."],
      tight: ["Knapp", "Wenig Reserve – reden wir darüber."],
      high: ["Zu hoch", "Wir würden davon abraten."],
      none: ["Kein Spielraum", "Wir raten von einem Kredit ab."]
    };
    var laufzeitEls = document.querySelectorAll('input[name="laufzeit"]');

    function num(el) {
      var v = parseFloat(String(el.value).replace(/[’'\s]/g, ""));
      return isFinite(v) && v > 0 ? v : 0;
    }
    function laufzeit() {
      var checked = document.querySelector('input[name="laufzeit"]:checked');
      return checked ? +checked.value : 36;
    }
    function fill(el) {
      var p = (el.value - el.min) / (el.max - el.min) * 100;
      el.style.setProperty("--p", p + "%");
    }

    function update() {
      var P = +betrag.value, n = laufzeit();
      var i = Math.pow(1 + ZINS_EFF, 1 / 12) - 1;
      var rate = P * i / (1 - Math.pow(1 + i, -n));
      var total = rate * n;
      var frei = num(einkommen) - num(fixkosten);
      var anteil = frei > 0 ? rate / frei : Infinity;
      var rest = frei - rate;

      $("betrag-out").textContent = chfRound(P);
      betrag.setAttribute("aria-valuetext", chfRound(P));
      fill(betrag);

      $("r-rate").textContent = chfExact(rate);
      $("r-total").textContent = chfRound(total);
      $("r-zins").textContent = chfRound(total - P);
      $("r-frei").textContent = chfRound(frei);
      $("r-anteil").textContent = isFinite(anteil) ? Math.round(anteil * 100) + " %" : "–";
      $("r-rest").textContent = chfRound(rest);

      var level = frei <= 0 ? "none" : anteil <= 0.25 ? "ok" : anteil <= 0.4 && rest >= 800 ? "tight" : "high";
      verdict.setAttribute("data-level", level === "none" ? "high" : level);
      $("verdict-title").textContent = TEXT[level][0];
      $("verdict-text").textContent = TEXT[level][1];
    }

    betrag.addEventListener("input", update);
    [einkommen, fixkosten].forEach(function (el) { el.addEventListener("input", update); });
    Array.prototype.forEach.call(laufzeitEls, function (el) { el.addEventListener("change", update); });
    update();
  }

  /* ---------- Kontaktformular (Demo) ---------- */
  var form = $("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("form-status");
      var name = $("f-name"), kontakt = $("f-kontakt");
      var bad = [name, kontakt].filter(function (el) { return !el.value.trim(); });
      [name, kontakt].forEach(function (el) { el.setAttribute("aria-invalid", bad.indexOf(el) > -1 ? "true" : "false"); });
      if (bad.length) {
        status.className = "form__status is-error";
        status.textContent = "Bitte ergänzen Sie " + (bad.length === 2 ? "Ihren Namen und eine Kontaktmöglichkeit." : bad[0] === name ? "Ihren Namen." : "eine E-Mail-Adresse oder Telefonnummer.");
        bad[0].focus();
        return;
      }
      status.className = "form__status";
      status.textContent = "Danke, " + name.value.trim() + ". Demo – es wurde nichts versendet.";
    });
  }

  /* ---------- Ruhige Einblendungen ---------- */
  var targets = document.querySelectorAll(".sec-head, .headline, .service, .step, .pullquote, .quote-card");
  Array.prototype.forEach.call(targets, function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("is-in"); });
  }

  var y = $("year"); if (y) y.textContent = new Date().getFullYear();
})();
