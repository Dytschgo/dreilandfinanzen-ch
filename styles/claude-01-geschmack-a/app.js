(function () {
  "use strict";

  /* ---------- Navigation (mobil) ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("hauptnavigation");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Zahlenformat: CHF 15’000.– ---------- */
  function group(n) {
    return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, "’");
  }
  function chf(n) {
    return (n < 0 ? "– " : "") + "CHF " + group(n) + ".–";
  }

  /* ---------- Kreditrechner (Hero) ---------- */
  var RATE_EFF = 0.089; // Beispielzinssatz, Platzhalter
  var SHARE_OK = 0.35;  // Anteil der Rate am frei verfügbaren Budget
  var SHARE_WARN = 0.6;

  var $ = function (id) { return document.getElementById(id); };
  var form = $("budgetcheck");
  var amount = $("amount"), income = $("income"), costs = $("costs");
  if (!form || !amount) return;

  var terms = form.querySelectorAll('input[name="term"]');
  var monthly = Math.pow(1 + RATE_EFF, 1 / 12) - 1;

  function annuity(p, n) {
    return p * monthly / (1 - Math.pow(1 + monthly, -n));
  }
  function principalFor(rate, n) {
    return rate * (1 - Math.pow(1 + monthly, -n)) / monthly;
  }
  function num(el) {
    var v = parseFloat(el.value);
    return isFinite(v) && v > 0 ? v : 0;
  }
  function selectedTerm() {
    for (var i = 0; i < terms.length; i++) {
      if (terms[i].checked) return Number(terms[i].value);
    }
    return 48;
  }
  function fill(el) {
    var p = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.setProperty("--p", p + "%");
  }

  var CHECK_SHORT = { ok: "tragbar", warn: "knapp", high: "zu hoch" };

  function update() {
    var P = Number(amount.value), n = selectedTerm();
    var inc = num(income), cost = num(costs);
    var rate = annuity(P, n);
    var total = rate * n;
    var free = inc - cost;
    var share = free > 0 ? rate / free : Infinity;

    $("amount-out").textContent = chf(P);
    amount.setAttribute("aria-valuetext", chf(P));
    fill(amount);

    $("r-rate").textContent = chf(rate);
    $("r-interest").textContent = chf(total - P);
    $("r-total").textContent = chf(total);
    $("r-free").textContent = chf(free);
    $("r-share").textContent = isFinite(share) ? Math.round(share * 100) + " %" : "–";

    var level, label, text;
    var suggestion = free > 0 ? Math.floor(principalFor(free * SHARE_OK, n) / 500) * 500 : 0;

    if (inc === 0) {
      level = "warn";
      label = "Bitte Einkommen angeben";
      text = "Ohne Einkommen lässt sich die Tragbarkeit nicht einschätzen.";
    } else if (!isFinite(share) || share > SHARE_WARN) {
      level = "high";
      label = "Zu hoch – davon raten wir ab";
      text = free <= 0
        ? "Ihre Ausgaben übersteigen das Einkommen. Gemeinsam suchen wir Luft."
        : (suggestion >= 1000
          ? "Tragbarer wäre ca. <strong>" + chf(suggestion) + "</strong> über " + n + " Monate – oder gar kein Kredit."
          : "Die Rate bindet zu viel Spielraum. Wir raten davon ab.");
    } else if (share > SHARE_OK) {
      level = "warn";
      label = "Knapp – sprechen wir darüber";
      text = "Machbar, aber mit wenig Reserve. Ca. <strong>" + chf(suggestion) + "</strong> oder eine längere Laufzeit schaffen Luft.";
    } else {
      level = "ok";
      label = "Voraussichtlich tragbar";
      text = "Es bleibt Spielraum neben der Rate. Im Gespräch prüfen wir genauer.";
    }

    $("verdict").setAttribute("data-level", level);
    $("verdict-label").textContent = label;
    $("verdict-text").innerHTML = text;

    var state = $("check-state");
    state.setAttribute("data-level", level);
    state.textContent = CHECK_SHORT[level] || "–";
  }

  [amount, income, costs].forEach(function (el) {
    el.addEventListener("input", update);
  });
  Array.prototype.forEach.call(terms, function (r) {
    r.addEventListener("change", update);
  });
  // Enter in einem Feld soll die Seite nicht neu laden
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  update();

  /* ---------- Kontaktformular (Demo) ---------- */
  var contact = $("contact-form");
  if (contact) {
    contact.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("form-status");
      if (!contact.checkValidity()) {
        contact.reportValidity();
        return;
      }
      status.textContent = "Danke! (Demo: Dieses Formular wird nicht versendet – bitte melden Sie sich vorerst telefonisch oder per E-Mail.)";
    });
  }
})();
