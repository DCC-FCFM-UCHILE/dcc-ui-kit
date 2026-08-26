/*! DCC UI Kit 1.1.0 — comportamiento de los componentes | MIT | https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit */
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
