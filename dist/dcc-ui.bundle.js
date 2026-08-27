/*! DCC UI Kit 2.0.0 — bundle (íconos + comportamiento) | MIT | https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit */
/*! DCC UI Kit 2.0.0 — inyector del sprite de íconos.
 *
 *  Por qué existe: <use href="https://otro-origen/icons.svg#id"> está BLOQUEADO
 *  por los navegadores. Un sprite servido desde el CDN no se puede referenciar
 *  directamente desde la app, y falla en silencio. Este script lleva el sprite
 *  embebido y lo inyecta, con lo cual <use href="#i-star"> pasa a ser una
 *  referencia local y funciona en cualquier origen.
 *
 *  Uso:  <script src=".../dcc-icons.js" defer></script>
 *        <svg class="dcc-i" viewBox="0 0 24 24"><use href="#i-star"/></svg>
 */
(function () {
  "use strict";
  var SPRITE = "<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"display:none\" aria-hidden=\"true\">\n<!-- DCC UI Kit 2.0.0 — iconos Lucide 0.544.0 (ISC). Version pineada a proposito. -->\n  <symbol id=\"i-smile\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 14s1.5 2 4 2 4-2 4-2\"/><line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\"/><line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\"/></symbol>\n  <symbol id=\"i-info\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/></symbol>\n  <symbol id=\"i-circle-check\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m9 12 2 2 4-4\"/></symbol>\n  <symbol id=\"i-circle-alert\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"/><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"/></symbol>\n  <symbol id=\"i-circle-user\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/><path d=\"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662\"/></symbol>\n  <symbol id=\"i-users\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/></symbol>\n  <symbol id=\"i-plus\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5v14\"/></symbol>\n  <symbol id=\"i-phone\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\"/></symbol>\n  <symbol id=\"i-mail\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"/><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/></symbol>\n  <symbol id=\"i-menu\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 5h16\"/><path d=\"M4 12h16\"/><path d=\"M4 19h16\"/></symbol>\n  <symbol id=\"i-linkedin\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z\"/></symbol>\n  <symbol id=\"i-instagram\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"4.5\"/><circle cx=\"17.5\" cy=\"6.5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/></symbol>\n  <symbol id=\"i-facebook\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z\"/></symbol>\n  <symbol id=\"i-youtube\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z\"/></symbol>\n  <symbol id=\"i-search\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/></symbol>\n  <symbol id=\"i-x\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/></symbol>\n  <symbol id=\"i-check\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6 9 17l-5-5\"/></symbol>\n  <symbol id=\"i-chevron-down\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m6 9 6 6 6-6\"/></symbol>\n  <symbol id=\"i-chevron-left\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m15 18-6-6 6-6\"/></symbol>\n  <symbol id=\"i-chevron-right\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></symbol>\n  <symbol id=\"i-chevrons-up-down\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></symbol>\n  <symbol id=\"i-arrow-up\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m5 12 7-7 7 7\"/><path d=\"M12 19V5\"/></symbol>\n  <symbol id=\"i-arrow-down\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 5v14\"/><path d=\"m19 12-7 7-7-7\"/></symbol>\n  <symbol id=\"i-heart\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/></symbol>\n  <symbol id=\"i-grip-vertical\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/></symbol>\n  <symbol id=\"i-star\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/></symbol>\n  <symbol id=\"i-clock\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 6v6l4 2\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/></symbol>\n  <symbol id=\"i-calendar\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 2v4\"/><path d=\"M16 2v4\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/><path d=\"M3 10h18\"/></symbol>\n  <symbol id=\"i-house\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></symbol>\n  <symbol id=\"i-bell\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/></symbol>\n  <symbol id=\"i-settings\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></symbol>\n  <symbol id=\"i-file-text\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"M10 9H8\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/></symbol>\n  <symbol id=\"i-folder\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/></symbol>\n  <symbol id=\"i-ellipsis\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"19\" cy=\"12\" r=\"1\"/><circle cx=\"5\" cy=\"12\" r=\"1\"/></symbol>\n  <symbol id=\"i-download\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 15V3\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5\"/></symbol>\n  <symbol id=\"i-map-pin\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/></symbol>\n</svg>\n";
  function inyectar() {
    if (document.getElementById("dcc-icon-sprite")) return;
    var cont = document.createElement("div");
    cont.id = "dcc-icon-sprite";
    cont.setAttribute("aria-hidden", "true");
    cont.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    cont.innerHTML = SPRITE;
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inyectar);
  } else {
    inyectar();
  }
})();

/**
 * Comportamiento de los componentes del DCC UI Kit.
 *
 * Sin dependencias, ES5, seguro con `defer`. Se auto-inicializa al cargar, así
 * que en el caso normal —una página servida por el servidor— basta con incluirlo
 * y no hay que llamar a nada.
 *
 * Para DOM que aparece después (htmx, respuestas AJAX, un modal que se inyecta):
 *
 *     DCCUI.init(elementoNuevo);
 *
 * Es idempotente: cada elemento se enlaza una sola vez, así que llamarlo de más
 * no duplica manejadores. Con htmx no hay que llamarlo siquiera; se engancha
 * solo a `htmx:afterSwap`.
 */
(function (global) {
  "use strict";

  var doc = global.document;

  /* Aplica `fn` a cada coincidencia de `sel` dentro de `raiz` —y a `raiz` misma
     si coincide, que es el caso de htmx cuando reemplaza justo el componente—.
     La llave marca el elemento para no volver a enlazarlo nunca. */
  function cada(raiz, sel, llave, fn) {
    var vistos = raiz.querySelectorAll(sel);
    for (var i = 0; i < vistos.length; i++) marcar(vistos[i], llave, fn);
    if (raiz.nodeType === 1 && raiz.matches && raiz.matches(sel)) marcar(raiz, llave, fn);
  }

  function marcar(el, llave, fn) {
    var hechos = el.__dcc || (el.__dcc = {});
    if (hechos[llave]) return;
    hechos[llave] = true;
    fn(el);
  }

  /* Enlaza los componentes que haya dentro de `raiz`. Sin argumento, el documento. */
  function init(raiz) {
    raiz = raiz || doc;

    // Checkbox indeterminado (no se puede declarar en HTML)
    cada(raiz, ".js-indeterminate", "indeterminate", function (el) {
      el.indeterminate = true;
    });

    // Menú hamburguesa del nav institucional (<768px)
    cada(raiz, ".js-nav-toggle", "nav-toggle", function (btn) {
      btn.addEventListener('click', function () {
        var nav = btn.closest('.js-nav');
        var open = nav.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      });
    });

    /* ---------- Limpiar campo de búsqueda ---------- */
    cada(raiz, ".js-clear", "clear", function (btn) {
      var input = document.getElementById(btn.dataset.target);
      if (!input) return;
      var sync = function () { btn.style.visibility = input.value ? "visible" : "hidden"; };
      btn.addEventListener("click", function () { input.value = ""; sync(); input.focus(); });
      input.addEventListener("input", sync);
      sync();
    });

    /* ---------- Favorito de las tarjetas comprimidas ---------- */
    cada(raiz, ".dcc-ccard__fav", "fav", function (btn) {
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", String(on));
        btn.setAttribute("aria-label", on ? "Quitar de favoritos" : "Marcar como favorito");
      });
    });

    /* ---------- Tarjetas arrastrables ----------
       El arrastre sólo se activa desde el asa, así se puede seleccionar texto
       dentro de la tarjeta sin dispararlo. Además se puede reordenar con el
       teclado: enfocar el asa y usar las flechas. */
    cada(raiz, ".js-dnd", "dnd", function (lista) {
      var origen = null;
      function limpiar() {
        lista.querySelectorAll(".is-over").forEach(function (n) { n.classList.remove("is-over"); });
      }
      lista.querySelectorAll(".dcc-ccard--draggable").forEach(function (card) {
        var asa = card.querySelector(".dcc-ccard__grip");
        if (asa) {
          asa.addEventListener("mousedown", function () { card.draggable = true; });
          asa.addEventListener("mouseup", function () { card.draggable = false; });
          asa.addEventListener("keydown", function (e) {
            var atras = e.key === "ArrowUp" || e.key === "ArrowLeft";
            var ade = e.key === "ArrowDown" || e.key === "ArrowRight";
            if (!atras && !ade) return;
            e.preventDefault();
            if (atras && card.previousElementSibling) lista.insertBefore(card, card.previousElementSibling);
            if (ade && card.nextElementSibling) lista.insertBefore(card.nextElementSibling, card);
            asa.focus();
          });
        }
        card.addEventListener("dragstart", function (e) {
          origen = card;
          card.classList.add("is-dragging");
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            try { e.dataTransfer.setData("text/plain", ""); } catch (err) { /* IE */ }
          }
        });
        card.addEventListener("dragend", function () {
          card.classList.remove("is-dragging");
          card.draggable = false;
          limpiar();
          origen = null;
        });
        card.addEventListener("dragover", function (e) {
          if (!origen || origen === card) return;
          e.preventDefault();
          card.classList.add("is-over");
        });
        card.addEventListener("dragleave", function () { card.classList.remove("is-over"); });
        card.addEventListener("drop", function (e) {
          e.preventDefault();
          card.classList.remove("is-over");
          if (!origen || origen === card) return;
          var hijos = Array.prototype.slice.call(lista.children);
          var i = hijos.indexOf(origen), j = hijos.indexOf(card);
          lista.insertBefore(origen, i < j ? card.nextSibling : card);
        });
      });
    });

    /* ---------- Quitar badge ---------- */
    cada(raiz, ".dcc-badge__close", "badge-close", function (btn) {
      btn.addEventListener("click", function () { btn.closest(".dcc-badge").remove(); });
    });

    /* ---------- Select propio (combobox) ---------- */
    cada(raiz, ".js-combo", "combo", function (combo) {
      var button = combo.querySelector(".dcc-combo__button");
      var list = combo.querySelector(".dcc-combo__list");
      var value = combo.querySelector(".dcc-combo__value");
      var options = Array.prototype.slice.call(combo.querySelectorAll(".dcc-combo__option"));
      var active = Math.max(0, options.findIndex(function (o) { return o.getAttribute("aria-selected") === "true"; }));

      function mark(i) {
        options.forEach(function (o, k) { o.classList.toggle("is-active", k === i); });
        active = i;
        var o = options[i];
        if (o) { o.id = o.id || (list.id + "-o" + i); button.setAttribute("aria-activedescendant", o.id); o.scrollIntoView({ block: "nearest" }); }
      }
      function open() {
        list.hidden = false;
        button.setAttribute("aria-expanded", "true");
        mark(active);
      }
      function close() {
        list.hidden = true;
        button.setAttribute("aria-expanded", "false");
        button.removeAttribute("aria-activedescendant");
      }
      function choose(i) {
        options.forEach(function (o, k) { o.setAttribute("aria-selected", String(k === i)); });
        value.textContent = options[i].textContent.trim();
        active = i;
        close();
        button.focus();
      }

      button.addEventListener("click", function () { list.hidden ? open() : close(); });
      button.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (list.hidden) { open(); return; }
          if (e.key === "Enter" || e.key === " ") { choose(active); return; }
          mark((active + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
        } else if (e.key === "Home") { e.preventDefault(); if (!list.hidden) mark(0); }
        else if (e.key === "End") { e.preventDefault(); if (!list.hidden) mark(options.length - 1); }
        else if (e.key === "Escape" && !list.hidden) { e.preventDefault(); close(); }
      });
      options.forEach(function (o, i) {
        o.addEventListener("click", function () { choose(i); });
        o.addEventListener("mousemove", function () { mark(i); });
      });
      document.addEventListener("click", function (e) {
        if (!list.hidden && !combo.contains(e.target)) close();
      });
    });

    /* ---------- Acordeón ---------- */
    cada(raiz, ".js-accordion .dcc-accordion__trigger", "accordion", function (trigger) {
      trigger.addEventListener("click", function () {
        var open = trigger.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(trigger.getAttribute("aria-controls"));
        trigger.setAttribute("aria-expanded", String(!open));
        panel.dataset.open = String(!open);
      });
    });

    /* ---------- Tabs ---------- */
    cada(raiz, ".js-tabs", "tabs", function (root) {
      var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
      function select(tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
        });
        tab.focus();
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { if (!tab.disabled) select(tab); });
        tab.addEventListener("keydown", function (e) {
          var dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
          var next = null;
          if (dir) {
            var j = i;
            do { j = (j + dir + tabs.length) % tabs.length; } while (tabs[j].disabled && j !== i);
            next = tabs[j];
          } else if (e.key === "Home") {
            next = tabs.find(function (t) { return !t.disabled; });
          } else if (e.key === "End") {
            next = tabs.slice().reverse().find(function (t) { return !t.disabled; });
          }
          if (next) { e.preventDefault(); select(next); }
        });
      });
    });

    /* ---------- Pagination (sólo demostración del estado) ---------- */
    cada(raiz, ".js-pagination", "pagination", function (root) {
      root.querySelectorAll(".dcc-pagination__btn").forEach(function (btn) {
        if (!/^\d+$/.test(btn.textContent.trim())) return;
        btn.addEventListener("click", function () {
          root.querySelectorAll("[aria-current]").forEach(function (b) { b.removeAttribute("aria-current"); });
          btn.setAttribute("aria-current", "page");
        });
      });
    });

    /* ---------- Bottom navigation ---------- */
    cada(raiz, ".js-bottomnav", "bottomnav", function (root) {
      root.querySelectorAll(".dcc-bottom-nav__item").forEach(function (item) {
        item.addEventListener("click", function () {
          root.querySelectorAll("[aria-current]").forEach(function (b) { b.removeAttribute("aria-current"); });
          item.setAttribute("aria-current", "page");
        });
      });
    });

    /* ---------- Tabla ordenable ---------- */
    cada(raiz, ".js-sortable", "sortable", function (table) {
      var body = table.tBodies[0];
      table.querySelectorAll("th.is-sortable").forEach(function (th, colIndex) {
        var index = Array.prototype.indexOf.call(th.parentNode.children, th);
        th.querySelector(".dcc-th-sort").addEventListener("click", function () {
          var current = th.getAttribute("aria-sort");
          var asc = current !== "ascending";
          table.querySelectorAll("th.is-sortable").forEach(function (o) { o.setAttribute("aria-sort", "none"); });
          th.setAttribute("aria-sort", asc ? "ascending" : "descending");

          var numeric = th.dataset.type === "number";
          var rows = Array.prototype.slice.call(body.rows);
          rows.sort(function (a, b) {
            var x = a.cells[index].textContent.trim();
            var y = b.cells[index].textContent.trim();
            var r = numeric ? (parseFloat(x) - parseFloat(y))
                            : x.localeCompare(y, "es", { sensitivity: "base" });
            return asc ? r : -r;
          });
          rows.forEach(function (r) { body.appendChild(r); });
        });
      });
    });

    /* ---------- Calendario ---------- */
    var MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                 "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    var DOW = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];
    var iso = function (d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    };

    function buildCalendar(root, onPick) {
      var selected = root.dataset.selected ? new Date(root.dataset.selected + "T00:00:00") : null;
      var view = new Date(selected || new Date());
      view.setDate(1);

      function render() {
        var today = new Date(); today.setHours(0, 0, 0, 0);
        var first = new Date(view.getFullYear(), view.getMonth(), 1);
        var offset = (first.getDay() + 6) % 7;              // lunes = 0
        var start = new Date(first); start.setDate(1 - offset);

        var html =
          '<div class="dcc-calendar__head">' +
            '<button class="dcc-calendar__nav" type="button" data-step="-1" aria-label="Mes anterior">' +
              '<svg class="dcc-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chevron-left"/></svg></button>' +
            '<span class="dcc-calendar__title" aria-live="polite">' + MESES[view.getMonth()] + " " + view.getFullYear() + "</span>" +
            '<button class="dcc-calendar__nav" type="button" data-step="1" aria-label="Mes siguiente">' +
              '<svg class="dcc-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chevron-right"/></svg></button>' +
          "</div>" +
          '<div class="dcc-calendar__grid" role="grid">';

        DOW.forEach(function (d) { html += '<span class="dcc-calendar__dow" role="columnheader">' + d + "</span>"; });

        for (var i = 0; i < 42; i++) {
          var day = new Date(start); day.setDate(start.getDate() + i);
          var cls = "dcc-calendar__day";
          if (day.getMonth() !== view.getMonth()) cls += " is-outside";
          if (day.getTime() === today.getTime()) cls += " is-today";
          var isSel = selected && iso(day) === iso(selected);
          if (isSel) cls += " is-selected";
          html += '<button class="' + cls + '" type="button" role="gridcell" data-date="' + iso(day) + '"' +
                  (isSel ? ' aria-selected="true"' : "") + ">" + day.getDate() + "</button>";
        }
        html += "</div>";
        root.innerHTML = html;
      }

      root.addEventListener("click", function (e) {
        var nav = e.target.closest(".dcc-calendar__nav");
        if (nav) {
          var step = Number(nav.dataset.step);
          view.setMonth(view.getMonth() + step);
          render();
          // render() rehace el innerHTML, así que el botón pulsado ya no existe:
          // devolvemos el foco a su reemplazo para no perder el hilo del teclado.
          var otra = root.querySelector('.dcc-calendar__nav[data-step="' + step + '"]');
          if (otra) otra.focus();
          return;
        }
        var cell = e.target.closest(".dcc-calendar__day");
        if (cell) {
          selected = new Date(cell.dataset.date + "T00:00:00");
          root.dataset.selected = cell.dataset.date;
          view = new Date(selected); view.setDate(1);
          render();
          if (onPick) onPick(selected);
        }
      });

      root.addEventListener("keydown", function (e) {
        var cell = e.target.closest(".dcc-calendar__day");
        if (!cell) return;
        var delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
        var d = new Date(cell.dataset.date + "T00:00:00");
        if (delta) { d.setDate(d.getDate() + delta); }
        else if (e.key === "Home") { d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); }
        else if (e.key === "End") { d.setDate(d.getDate() + (6 - ((d.getDay() + 6) % 7))); }
        else if (e.key === "PageUp") { d.setMonth(d.getMonth() - 1); }
        else if (e.key === "PageDown") { d.setMonth(d.getMonth() + 1); }
        else { return; }
        e.preventDefault();
        if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) {
          view = new Date(d); view.setDate(1); render();
        }
        var target = root.querySelector('[data-date="' + iso(d) + '"]');
        if (target) target.focus();
      });

      render();
    }

    cada(raiz, ".js-calendar", "calendar", function (cal) {
      var picker = cal.closest(".js-datepicker");
      if (!picker) { buildCalendar(cal, null); return; }

      var input = picker.querySelector(".dcc-input");
      var toggle = picker.querySelector(".js-dp-toggle");

      buildCalendar(cal, function (date) {
        input.value = String(date.getDate()).padStart(2, "0") + "/" +
                      String(date.getMonth() + 1).padStart(2, "0") + "/" + date.getFullYear();
        close();
        toggle.focus();
      });

      function open() {
        cal.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        var sel = cal.querySelector(".is-selected") || cal.querySelector(".dcc-calendar__day");
        if (sel) sel.focus();
      }
      function close() {
        cal.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
      toggle.addEventListener("click", function () { cal.hidden ? open() : close(); });
      document.addEventListener("click", function (e) {
        if (cal.hidden) return;
        // Al navegar de mes, render() reemplaza el innerHTML y el nodo pulsado
        // queda desconectado antes de que el evento llegue hasta aquí. En ese
        // caso contains() daría false y cerraría el popover por error: si el
        // nodo ya no está en el documento, el clic vino de adentro.
        if (!e.target.isConnected) return;
        if (!picker.contains(e.target)) close();
      });
      picker.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !cal.hidden) { close(); toggle.focus(); }
      });
    });
  }

  global.DCCUI = { init: init };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () { init(doc); });
  } else {
    init(doc);
  }

  /* htmx reemplaza trozos de página sin recargar: hay que enlazar lo que llegó.
     Si no usas htmx, este listener no hace nada. */
  doc.addEventListener("htmx:afterSwap", function (e) { init(e.target || doc); });
})(window);
