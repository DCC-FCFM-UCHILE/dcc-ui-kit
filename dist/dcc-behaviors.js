/*! DCC UI Kit 2.8.0 — comportamiento de los componentes | MIT | https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit */
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

    /* ---------- Campo con adornos ----------
       Un clic en el contenedor —en un adorno de texto, o en el espacio que
       queda— enfoca el campo, como si todo fuera el input. Los botones del
       adorno conservan su propio clic. */
    cada(raiz, ".dcc-adorned", "adorned", function (caja) {
      caja.addEventListener("mousedown", function (e) {
        var campo = caja.querySelector(".dcc-adorned__input");
        if (!campo || campo.disabled || e.target === campo || e.target.closest("button, a, input, select, textarea")) return;
        e.preventDefault();
        campo.focus();
      });
    });

    /* ---------- Mostrar u ocultar la contraseña ---------- */
    cada(raiz, ".js-password-toggle", "password-toggle", function (btn) {
      var campo = doc.getElementById(btn.getAttribute("aria-controls"));
      if (!campo) return;
      btn.addEventListener("click", function () {
        var visible = campo.type === "password";
        campo.type = visible ? "text" : "password";
        btn.setAttribute("aria-pressed", String(visible));
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

    /* ---------- Menú desplegable ---------- */
    cada(raiz, ".js-menu", "menu", function (menu) {
      var trigger = menu.querySelector(".dcc-menu__trigger");
      var list = menu.querySelector(".dcc-menu__list");
      if (!trigger || !list) return;

      var items = function () {
        return Array.prototype.slice.call(list.querySelectorAll(".dcc-menu__item"))
          .filter(function (i) { return i.getAttribute("aria-disabled") !== "true"; });
      };

      function abrir() {
        list.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
      }
      function cerrar(devolverFoco) {
        if (list.hidden) return;
        list.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        if (devolverFoco) trigger.focus();
      }
      function enfocar(i) {
        var xs = items();
        if (!xs.length) return;
        var j = (i + xs.length) % xs.length;
        xs.forEach(function (x, k) { x.classList.toggle("is-active", k === j); });
        xs[j].focus();
      }

      trigger.addEventListener("click", function () {
        list.hidden ? abrir() : cerrar(false);
      });

      trigger.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir();
          enfocar(0);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          abrir();
          enfocar(-1);
        } else if (e.key === "Escape") {
          cerrar(true);
        }
      });

      list.addEventListener("keydown", function (e) {
        var xs = items();
        var i = xs.indexOf(document.activeElement);
        if (e.key === "ArrowDown") { e.preventDefault(); enfocar(i + 1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); enfocar(i - 1); }
        else if (e.key === "Home") { e.preventDefault(); enfocar(0); }
        else if (e.key === "End") { e.preventDefault(); enfocar(-1); }
        else if (e.key === "Escape") { e.preventDefault(); cerrar(true); }
        else if (e.key === "Tab") { cerrar(false); }
      });

      // Al activar una opción el menú se cierra: son acciones, no un valor que
      // se quede seleccionado.
      list.addEventListener("click", function (e) {
        // Elegir una opción devuelve el foco al disparador, como en MUI: si no,
        // queda en un ítem que acaba de esconderse y el teclado se pierde.
        if (e.target.closest(".dcc-menu__item")) cerrar(true);
      });

      document.addEventListener("click", function (e) {
        if (!list.hidden && !menu.contains(e.target)) cerrar(false);
      });
    });

    /* ---------- Grupo desplegable de la barra lateral ---------- */
    /* No es el acordeón: ahí el panel se anima con `data-open` y sólo uno puede
       estar abierto. Acá cada grupo es independiente y se esconde de verdad,
       porque un panel a media altura dentro de una lista que scrollea deja el
       resto de los ítems fuera de alcance. */
    cada(raiz, ".js-sidebar-group", "sidebarGroup", function (trigger) {
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;
      trigger.addEventListener("click", function () {
        var abierto = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!abierto));
        panel.hidden = abierto;
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
    /* ---------- Seleccionar todas las filas ----------
       La casilla de la cabecera (`.js-select-all`) marca o desmarca todas las
       de las filas —las de `td.dcc-cell--check` del cuerpo—, y al revés: queda
       marcada si están todas, vacía si no hay ninguna e indeterminada si hay
       algunas. Las filas se buscan cada vez, así que sirve también si la tabla
       se reordena o le llegan filas nuevas. */
    cada(raiz, ".js-select-all", "select-all", function (todas) {
      var tabla = todas.closest("table");
      if (!tabla) return;
      function filas() {
        var lista = [];
        for (var i = 0; i < tabla.tBodies.length; i++) {
          var ins = tabla.tBodies[i].querySelectorAll("td.dcc-cell--check input[type=\"checkbox\"]");
          for (var j = 0; j < ins.length; j++) if (!ins[j].disabled) lista.push(ins[j]);
        }
        return lista;
      }
      function sincronizar() {
        var lista = filas();
        var marcadas = lista.filter(function (c) { return c.checked; }).length;
        todas.checked = lista.length > 0 && marcadas === lista.length;
        todas.indeterminate = marcadas > 0 && marcadas < lista.length;
      }
      todas.addEventListener("change", function () {
        filas().forEach(function (c) { c.checked = todas.checked; });
        todas.indeterminate = false;
      });
      tabla.addEventListener("change", function (e) {
        if (e.target !== todas && e.target.closest && e.target.closest("td.dcc-cell--check")) sincronizar();
      });
      sincronizar();
    });

    /* Lee un número escrito a la chilena: coma decimal y punto de miles
       ("6,2", "4.250.000", "$ 1.500"). parseFloat se detenía en la coma y
       ordenaba 6,2 y 6,8 como si fueran iguales. Sin coma, un punto seguido de
       grupos de tres cifras se toma como separador de miles. */
    function numero(texto) {
      var t = String(texto).replace(/[^\d,.\-]/g, "");
      if (t.indexOf(",") >= 0) t = t.replace(/\./g, "").replace(",", ".");
      else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
      return parseFloat(t);
    }

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
            var r;
            if (numeric) {
              var nx = numero(x), ny = numero(y);
              // Las celdas sin número (un guion, "sin nota") van siempre al final.
              if (isNaN(nx) || isNaN(ny)) return isNaN(nx) - isNaN(ny);
              r = nx - ny;
            } else {
              r = x.localeCompare(y, "es", { sensitivity: "base" });
            }
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

  /* Componentes en archivos aparte (src/componentes/*.js). Cada uno se
     registra con DCCUI.registrar(function (raiz, cada) { … }): su función
     corre en cada init() —también con htmx y DCCUI.init(elemento)— y, si el
     documento ya se enlazó, corre de inmediato sobre él. Así el orden en que
     se cargan los archivos no importa. */
  var registrados = [];
  var enlazado = false;
  function registrar(fn) {
    registrados.push(fn);
    if (enlazado) fn(doc, cada);
  }

  function initCompleto(raiz) {
    raiz = raiz || doc;
    init(raiz);
    for (var i = 0; i < registrados.length; i++) registrados[i](raiz, cada);
    if (raiz === doc) enlazado = true;
  }

  global.DCCUI = { init: initCompleto, registrar: registrar };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () { initCompleto(doc); });
  } else {
    initCompleto(doc);
  }

  /* htmx reemplaza trozos de página sin recargar: hay que enlazar lo que llegó.
     Si no usas htmx, este listener no hace nada. */
  doc.addEventListener("htmx:afterSwap", function (e) { initCompleto(e.target || doc); });
})(window);

/* Área de texto que crece (TextareaAutosize de MUI).

   Ajusta el alto de un `textarea.dcc-input.js-autosize` al de su texto, para
   que no aparezca una barra de desplazamiento mientras se escribe ni sobre
   espacio vacío. Límites, en filas de texto:
     data-min-filas="2"   el alto mínimo (por omisión, 1 fila),
     data-max-filas="6"   el máximo; pasado ese alto vuelve la barra.

   El alto se mide poniéndolo un instante en 0 y leyendo `scrollHeight`, que
   entonces es justo el del contenido. Ese instante no se pinta, pero la
   página puede acortarse y mover el scroll; por eso se guarda y se repone.

   Se vuelve a medir al escribir, al cambiar el ancho (un ResizeObserver: el
   texto se reparte en otras líneas) y al reiniciar el formulario. Si el valor
   se cambia por código, que no emite `input`, hay que pedirlo:

       DCCUI.autoajustar(textarea); */
(function () {
  "use strict";

  function px(v) { return parseFloat(v) || 0; }

  function ajustar(el) {
    var cs = window.getComputedStyle(el);
    var linea = px(cs.lineHeight) || px(cs.fontSize) * 1.2;
    var extra = px(cs.paddingTop) + px(cs.paddingBottom);
    var borde = px(cs.borderTopWidth) + px(cs.borderBottomWidth);
    var minFilas = px(el.getAttribute("data-min-filas")) || 1;
    var maxFilas = px(el.getAttribute("data-max-filas")) || Infinity;
    var minimo = minFilas * linea + extra + borde;
    var maximo = maxFilas * linea + extra + borde;

    var x = window.pageXOffset, y = window.pageYOffset;
    el.style.height = "0px";
    var contenido = el.scrollHeight + borde;
    var alto = Math.ceil(Math.min(maximo, Math.max(minimo, contenido)));
    el.style.height = alto + "px";
    // Con el texto pasado del máximo, la barra vuelve para poder recorrerlo.
    el.style.overflowY = contenido > maximo + 1 ? "auto" : "hidden";
    if (window.pageXOffset !== x || window.pageYOffset !== y) window.scrollTo(x, y);
  }

  var observador = window.ResizeObserver ? new ResizeObserver(function (entradas) {
    entradas.forEach(function (e) {
      // Sólo importa el ancho: el alto lo cambia este mismo archivo.
      var ancho = e.contentRect.width;
      if (ancho && ancho !== e.target.__dccAncho) {
        e.target.__dccAncho = ancho;
        ajustar(e.target);
      }
    });
  }) : null;

  DCCUI.autoajustar = ajustar;

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-autosize", "autosize", function (el) {
      if (el.tagName !== "TEXTAREA") return;
      el.addEventListener("input", function () { ajustar(el); });
      if (el.form) el.form.addEventListener("reset", function () { setTimeout(function () { ajustar(el); }, 0); });
      if (observador) observador.observe(el);
      ajustar(el);
    });
  });
})();

/* Autocompletar: un campo con una lista que se filtra mientras se escribe.

   Sigue el patrón combobox de ARIA 1.2 con lista emergente: el foco se queda
   siempre en el <input role="combobox"> y la opción activa se anuncia con
   aria-activedescendant, así que se puede seguir escribiendo mientras se
   recorre la lista.

   Las opciones salen del propio HTML —los <li role="option"> de la lista—, de
   modo que la página funciona servida por el servidor y sin una sola línea de
   configuración. Opciones en el contenedor `.js-autocomplete`:

     data-multiple          varios valores, cada uno como chip dentro del campo
     data-libre             acepta texto que no está en la lista (freeSolo de MUI)
     data-name="cursos"     crea <input type="hidden" name="cursos"> con los
                            valores elegidos, para enviarlos en un formulario
     data-sin-resultados    el texto del aviso cuando nada coincide

   Cada opción usa su `data-value` como valor, o su texto si no lo tiene. Una
   opción que ya viene con aria-selected="true" queda elegida al cargar.

   Teclado: flechas para recorrer (abren la lista si está cerrada), Enter para
   elegir, Escape para cerrar, Retroceso con el campo vacío para quitar el
   último chip, flecha izquierda al principio del texto para pasar a los
   chips —y ahí Retroceso o Suprimir quitan el chip con foco—.

   Tras cada cambio de valor emite `dcc-autocompletar` en el contenedor, con
   `detail.valor`: un texto (o null) en el simple y una lista en el múltiple. */
(function () {
  "use strict";

  var uid = 0;
  var slice = function (xs) { return Array.prototype.slice.call(xs); };

  /* Sin tildes y en minúsculas: "practica" encuentra "Práctica profesional".
     Al quitar las marcas de la forma descompuesta, cada letra con tilde vuelve
     a medir un carácter, así que los índices sirven para resaltar el original. */
  function normalizar(s) {
    s = s.normalize ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s;
    return s.toLowerCase();
  }
  function escapar(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  var CRUZ = '<svg class="dcc-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>';

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-autocomplete", "autocomplete", function (root) {
      var input = root.querySelector(".dcc-autocomplete__input");
      var control = root.querySelector(".dcc-autocomplete__control");
      var list = root.querySelector(".dcc-combo__list");
      var limpiar = root.querySelector(".dcc-autocomplete__clear");
      var flecha = root.querySelector(".dcc-autocomplete__toggle");
      if (!input || !control || !list) return;

      var multiple = root.hasAttribute("data-multiple");
      var libre = root.hasAttribute("data-libre");
      var nombre = root.getAttribute("data-name");
      var base = list.id || ("dcc-ac-" + (++uid));
      list.id = base;
      list.hidden = true;
      input.setAttribute("aria-controls", base);
      input.setAttribute("aria-expanded", "false");
      if (!input.hasAttribute("aria-autocomplete")) input.setAttribute("aria-autocomplete", "list");
      if (multiple) list.setAttribute("aria-multiselectable", "true");

      /* ---------- Opciones ---------- */
      // El texto de cada opción pasa a un <span> propio, para poder resaltar lo
      // escrito sin tocar el check que la acompaña.
      var opciones = slice(list.querySelectorAll('[role="option"]')).map(function (li, i) {
        if (!li.id) li.id = base + "-o" + i;
        if (!li.hasAttribute("aria-selected")) li.setAttribute("aria-selected", "false");
        var etiqueta = li.textContent.replace(/\s+/g, " ").trim();
        var span = document.createElement("span");
        var textos = slice(li.childNodes).filter(function (n) { return n.nodeType === 3; });
        li.insertBefore(span, textos.filter(function (n) { return n.nodeValue.trim(); })[0] || li.firstChild);
        textos.forEach(function (n) { li.removeChild(n); });
        span.textContent = etiqueta;
        return {
          el: li, span: span, etiqueta: etiqueta, clave: normalizar(etiqueta),
          valor: li.getAttribute("data-value") || etiqueta
        };
      });
      var grupos = slice(list.querySelectorAll(".dcc-autocomplete__group"));

      var vacio = root.querySelector(".dcc-autocomplete__empty");
      if (!vacio) {
        vacio = document.createElement("div");
        vacio.className = "dcc-autocomplete__empty";
        vacio.textContent = root.getAttribute("data-sin-resultados") || "Sin resultados";
        root.appendChild(vacio);
      }
      vacio.hidden = true;
      var estado = document.createElement("div");
      estado.className = "dcc-autocomplete__status";
      estado.setAttribute("role", "status");
      root.appendChild(estado);

      /* ---------- Estado ---------- */
      var seleccion = [];     // [{ etiqueta, valor, opcion }]
      var visibles = [];      // opciones que pasan el filtro, en orden
      var activa = -1;        // índice en `visibles`
      var abierto = false;
      var escrito = false;    // si el filtro sigue lo escrito o muestra todo

      opciones.forEach(function (o) {
        if (o.el.getAttribute("aria-selected") === "true" && (multiple || !seleccion.length))
          seleccion.push({ etiqueta: o.etiqueta, valor: o.valor, opcion: o });
      });
      if (!multiple && seleccion.length && !input.value) input.value = seleccion[0].etiqueta;

      function deshabilitado() { return input.disabled; }
      function elegida(o) {
        return seleccion.some(function (s) { return s.opcion === o; });
      }
      function anunciar(texto) { estado.textContent = texto; }

      /* ---------- Lista ---------- */
      function resaltar(o, q) {
        var i = q && o.clave.length === o.etiqueta.length ? o.clave.indexOf(q) : -1;
        if (i < 0) { o.span.textContent = o.etiqueta; return; }
        o.span.innerHTML = escapar(o.etiqueta.slice(0, i)) +
          '<span class="dcc-autocomplete__match">' + escapar(o.etiqueta.slice(i, i + q.length)) + "</span>" +
          escapar(o.etiqueta.slice(i + q.length));
      }

      function filtrar() {
        var q = escrito ? normalizar(input.value.trim()) : "";
        visibles = [];
        opciones.forEach(function (o) {
          var pasa = !q || o.clave.indexOf(q) !== -1;
          o.el.hidden = !pasa;
          if (pasa) visibles.push(o);
          resaltar(o, pasa ? q : "");
        });
        grupos.forEach(function (g) {
          g.hidden = !g.querySelector('[role="option"]:not([hidden])');
        });
      }

      function mostrar() {
        var hay = visibles.length > 0;
        list.hidden = !(abierto && hay);
        // En texto libre no hay aviso: escribir algo que no está es válido.
        vacio.hidden = !(abierto && !hay && !libre);
        input.setAttribute("aria-expanded", String(!list.hidden));
        root.classList.toggle("is-open", abierto && (hay || !libre));
      }

      function marcar(i) {
        activa = i;
        opciones.forEach(function (o) { o.el.classList.remove("is-active"); });
        var o = visibles[i];
        if (!o) { input.removeAttribute("aria-activedescendant"); return; }
        o.el.classList.add("is-active");
        input.setAttribute("aria-activedescendant", o.el.id);
        o.el.scrollIntoView({ block: "nearest" });
      }

      function abrir() {
        if (deshabilitado()) return;
        abierto = true;
        filtrar();
        mostrar();
      }

      function cerrar() {
        abierto = false;
        escrito = false;
        marcar(-1);
        mostrar();
      }

      // Al abrir con el teclado, la activa es la elegida —o la primera—, como
      // en el select.
      function activaInicial(haciaArriba) {
        for (var i = 0; i < visibles.length; i++) if (elegida(visibles[i])) return i;
        return haciaArriba ? visibles.length - 1 : 0;
      }

      function mover(paso) {
        var n = visibles.length;
        if (!n) return;
        var i = activa;
        for (var k = 0; k < n; k++) {
          i = i < 0 ? (paso > 0 ? 0 : n - 1) : (i + paso + n) % n;
          if (visibles[i].el.getAttribute("aria-disabled") !== "true") { marcar(i); return; }
        }
      }

      /* ---------- Valor ---------- */
      function chip(s, i) {
        var c = document.createElement("span");
        c.className = "dcc-chip dcc-chip--sm";
        c.setAttribute("data-indice", String(i));
        c.innerHTML = '<span class="dcc-chip__label"></span>' +
          '<button class="dcc-chip__delete" type="button" tabindex="-1">' + CRUZ + "</button>";
        c.firstChild.textContent = s.etiqueta;
        var b = c.lastChild;
        b.setAttribute("aria-label", "Quitar " + s.etiqueta);
        b.disabled = deshabilitado();
        return c;
      }

      function pintar() {
        opciones.forEach(function (o) { o.el.setAttribute("aria-selected", String(elegida(o))); });
        if (multiple) {
          slice(control.querySelectorAll(".dcc-chip")).forEach(function (c) { c.remove(); });
          seleccion.forEach(function (s, i) { control.insertBefore(chip(s, i), input); });
        }
        if (nombre) {
          slice(root.querySelectorAll("input[data-dcc-autocompletar]")).forEach(function (h) { h.remove(); });
          var valores = seleccion.length ? seleccion : (multiple ? [] : [{ valor: "" }]);
          valores.forEach(function (s) {
            var h = document.createElement("input");
            h.type = "hidden";
            h.name = nombre;
            h.value = s.valor;
            h.setAttribute("data-dcc-autocompletar", "");
            root.appendChild(h);
          });
        }
        actualizarLimpiar();
      }

      function actualizarLimpiar() {
        if (limpiar) limpiar.hidden = deshabilitado() || !(seleccion.length || input.value);
      }

      function emitir() {
        var valor = multiple
          ? seleccion.map(function (s) { return s.valor; })
          : (seleccion[0] ? seleccion[0].valor : null);
        root.dispatchEvent(new CustomEvent("dcc-autocompletar", { bubbles: true, detail: { valor: valor } }));
      }

      function elegir(o) {
        if (!o || o.el.getAttribute("aria-disabled") === "true") return;
        if (!multiple) {
          seleccion = [{ etiqueta: o.etiqueta, valor: o.valor, opcion: o }];
          input.value = o.etiqueta;
          cerrar();
          pintar();
          emitir();
          return;
        }
        // En el múltiple la lista queda abierta: se eligen varios seguidos, y
        // volver a elegir uno lo quita, como en una lista de casillas.
        var ya = elegida(o);
        if (ya) seleccion = seleccion.filter(function (s) { return s.opcion !== o; });
        else seleccion.push({ etiqueta: o.etiqueta, valor: o.valor, opcion: o });
        input.value = "";
        escrito = false;
        filtrar();
        mostrar();
        marcar(visibles.indexOf(o));
        pintar();
        anunciar(o.etiqueta + (ya ? " quitado" : " agregado"));
        emitir();
      }

      // Texto libre: si coincide con una opción, se elige esa; si no, entra tal
      // cual como valor.
      function aceptarTexto(texto) {
        var clave = normalizar(texto);
        var igual = opciones.filter(function (o) { return o.clave === clave; })[0];
        if (igual) { if (!multiple || !elegida(igual)) elegir(igual); else { input.value = ""; pintar(); } return; }
        if (!multiple) {
          seleccion = [{ etiqueta: texto, valor: texto, opcion: null }];
          input.value = texto;
          cerrar();
          pintar();
          emitir();
          return;
        }
        var repetido = seleccion.some(function (s) { return normalizar(s.etiqueta) === clave; });
        if (!repetido) seleccion.push({ etiqueta: texto, valor: texto, opcion: null });
        input.value = "";
        escrito = false;
        filtrar();
        mostrar();
        pintar();
        if (!repetido) { anunciar(texto + " agregado"); emitir(); }
      }

      function quitar(i, enfocar) {
        var s = seleccion[i];
        if (!s || deshabilitado()) return;
        seleccion.splice(i, 1);
        // El foco pasa antes al campo: si se quedara en la cruz, al rehacer los
        // chips desaparecería con ella y el navegador lo mandaría al <body>.
        if (enfocar) input.focus();
        pintar();
        anunciar(s.etiqueta + " quitado");
        emitir();
        if (enfocar) {
          var botones = control.querySelectorAll(".dcc-chip__delete");
          (botones[Math.min(i, botones.length - 1)] || input).focus();
        }
      }

      function borrarTodo() {
        seleccion = [];
        input.value = "";
        escrito = false;
        pintar();
        emitir();
        if (abierto) { filtrar(); mostrar(); marcar(-1); }
      }

      /* ---------- Eventos del campo ---------- */
      input.addEventListener("input", function () {
        escrito = true;
        // En el simple, vaciar el texto es quitar el valor.
        if (!multiple && !input.value && seleccion.length) { seleccion = []; pintar(); emitir(); }
        abrir();
        marcar(-1);
        actualizarLimpiar();
        anunciar(visibles.length
          ? visibles.length + (visibles.length === 1 ? " resultado" : " resultados")
          : (libre ? "" : vacio.textContent));
      });

      input.addEventListener("click", function () { if (!abierto) abrir(); });

      input.addEventListener("keydown", function (e) {
        var k = e.key;
        if (k === "ArrowDown" || k === "ArrowUp") {
          e.preventDefault();
          if (!abierto) { abrir(); marcar(visibles.length ? activaInicial(k === "ArrowUp") : -1); return; }
          mover(k === "ArrowDown" ? 1 : -1);
        } else if (k === "Enter") {
          if (abierto && visibles[activa]) { e.preventDefault(); elegir(visibles[activa]); }
          else if (libre && input.value.trim()) { e.preventDefault(); aceptarTexto(input.value.trim()); }
          else if (abierto) e.preventDefault();
        } else if (k === "Escape") {
          if (abierto) { e.preventDefault(); cerrar(); }
        } else if (k === "Backspace") {
          if (multiple && !input.value && seleccion.length) quitar(seleccion.length - 1, false);
        } else if (k === "ArrowLeft") {
          if (multiple && seleccion.length && input.selectionStart === 0 && input.selectionEnd === 0) {
            e.preventDefault();
            cerrar();
            var bs = control.querySelectorAll(".dcc-chip__delete");
            bs[bs.length - 1].focus();
          }
        }
      });

      /* ---------- Chips (múltiple) ---------- */
      function indiceDe(boton) {
        return parseInt(boton.closest(".dcc-chip").getAttribute("data-indice"), 10);
      }
      control.addEventListener("click", function (e) {
        var b = e.target.closest(".dcc-chip__delete");
        if (b && control.contains(b)) { quitar(indiceDe(b), false); input.focus(); }
      });
      control.addEventListener("keydown", function (e) {
        var b = e.target.closest(".dcc-chip__delete");
        if (!b) return;
        var bs = slice(control.querySelectorAll(".dcc-chip__delete"));
        var i = bs.indexOf(b);
        if (e.key === "ArrowLeft") { e.preventDefault(); (bs[i - 1] || b).focus(); }
        else if (e.key === "ArrowRight") { e.preventDefault(); (bs[i + 1] || input).focus(); }
        else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); quitar(indiceDe(b), true); }
        else if (e.key === "Escape") { e.preventDefault(); input.focus(); }
      });

      // Un clic en la caja —en el borde, entre los chips o sobre su texto—
      // lleva el foco al campo, como si la caja entera fuera el input.
      control.addEventListener("mousedown", function (e) {
        // La cruz de un chip tampoco se lleva el foco: se quita el chip y el
        // foco sigue en el campo.
        if (e.target.closest(".dcc-chip__delete")) { e.preventDefault(); return; }
        if (e.target === input || e.target.closest("button") || deshabilitado()) return;
        e.preventDefault();
        input.focus();
        if (!abierto) abrir();
      });

      /* ---------- Botones ---------- */
      // mousedown sin acción por omisión: el foco no se va del campo.
      [limpiar, flecha].forEach(function (b) {
        if (!b) return;
        b.setAttribute("tabindex", "-1");
        b.disabled = deshabilitado();
        b.addEventListener("mousedown", function (e) { e.preventDefault(); });
      });
      if (limpiar) limpiar.addEventListener("click", function () { borrarTodo(); input.focus(); });
      if (flecha) flecha.addEventListener("click", function () {
        if (abierto) { cerrar(); return; }
        input.focus();
        escrito = false;
        abrir();
      });

      /* ---------- Lista con el mouse ---------- */
      list.addEventListener("mousedown", function (e) { e.preventDefault(); });
      list.addEventListener("click", function (e) {
        var li = e.target.closest('[role="option"]');
        if (li) elegir(opciones.filter(function (o) { return o.el === li; })[0]);
      });
      list.addEventListener("mousemove", function (e) {
        var li = e.target.closest('[role="option"]');
        if (!li || li.classList.contains("is-active")) return;
        for (var i = 0; i < visibles.length; i++) if (visibles[i].el === li) { marcar(i); return; }
      });

      /* ---------- Salida ---------- */
      // Al irse el foco, el texto se concilia con el valor: en el simple sin
      // texto libre vuelve a la etiqueta elegida —lo escrito a medias no es un
      // valor—; con texto libre, lo escrito pasa a ser el valor.
      root.addEventListener("focusout", function (e) {
        if (e.relatedTarget && root.contains(e.relatedTarget)) return;
        cerrar();
        var texto = input.value.trim();
        if (!multiple) {
          var actual = seleccion[0] ? seleccion[0].etiqueta : "";
          if (texto === actual) return;
          if (libre) { if (texto) aceptarTexto(texto); else borrarTodo(); }
          else input.value = actual;
          pintar();
        } else if (!libre) {
          input.value = "";
          actualizarLimpiar();
        }
      });
      document.addEventListener("mousedown", function (e) {
        if (abierto && !root.contains(e.target)) cerrar();
      });

      filtrar();
      pintar();
    });
  });
})();

/* Botón alternable: cada clic invierte `aria-pressed`.

   - `.js-toggle` en un botón suelto: alterna sólo ese botón.
   - `.js-toggle-group` en el contenedor: alterna los botones `.dcc-toggle` de
     adentro. Con `data-exclusivo`, presionar uno suelta los demás, como la
     alineación de un párrafo; con `data-exclusivo="obligatorio"`, además, no
     se puede soltar el único presionado —siempre queda un valor, como en el
     ejemplo "enforce value set" de MUI—.

   Tras cada cambio emite `dcc-alternar` en el grupo (o en el botón suelto),
   con `detail.valores`: el `value` de los botones presionados, en orden. Los
   botones siguen siendo <button> normales en el orden de tabulación, que es
   lo que hace MUI y lo que esperan quienes llegan con Tab a una barra de
   formato. */
(function () {
  "use strict";

  function presionados(contenedor) {
    return Array.prototype.slice.call(contenedor.querySelectorAll(".dcc-toggle"))
      .filter(function (b) { return b.getAttribute("aria-pressed") === "true"; })
      .map(function (b) { return b.value || b.getAttribute("aria-label") || b.textContent.trim(); });
  }

  function avisar(el, valores) {
    el.dispatchEvent(new CustomEvent("dcc-alternar", { bubbles: true, detail: { valores: valores } }));
  }

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-toggle", "toggle", function (btn) {
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        var ahora = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", String(ahora));
        avisar(btn, ahora ? [btn.value || btn.getAttribute("aria-label") || btn.textContent.trim()] : []);
      });
    });

    cada(raiz, ".js-toggle-group", "toggle-group", function (grupo) {
      var modo = grupo.getAttribute("data-exclusivo");
      var exclusivo = modo !== null;
      var obligatorio = modo === "obligatorio";

      grupo.addEventListener("click", function (e) {
        var btn = e.target.closest(".dcc-toggle");
        if (!btn || !grupo.contains(btn) || btn.disabled) return;
        var estaba = btn.getAttribute("aria-pressed") === "true";
        if (estaba && obligatorio) return;
        if (exclusivo && !estaba) {
          Array.prototype.forEach.call(grupo.querySelectorAll(".dcc-toggle"), function (b) {
            if (b !== btn) b.setAttribute("aria-pressed", "false");
          });
        }
        btn.setAttribute("aria-pressed", String(!estaba));
        avisar(grupo, presionados(grupo));
      });
    });
  });
})();

/* Drawer (cajón): abre y cierra los cajones temporales y persistentes.

   Ganchos en el HTML, sin JS propio:
     data-dcc-abrir="id"   en el botón que abre. En un cajón persistente
                           alterna: abre si está cerrado y cierra si está
                           abierto, y mantiene su `aria-expanded` al día.
     data-dcc-cerrar       en un botón dentro del cajón.

   Otros componentes del kit (el diálogo) usan los mismos atributos. Por eso
   este archivo sólo actúa cuando el destino es un `.dcc-drawer`: con cualquier
   otro destino no hace nada y deja que lo resuelva su dueño.

   El temporal es un <dialog>: `showModal()` ya deja inerte el resto de la
   página —el foco queda atrapado—, cierra con Escape y, al cerrar, devuelve el
   foco a donde estaba. Lo único que falta es cerrar con un clic en el fondo,
   que es un clic sobre el propio <dialog> (el panel lo llena entero). Se exige
   que el clic también haya empezado ahí: si no, arrastrar para seleccionar
   texto del cajón y soltar afuera lo cerraría.

   API para abrir y cerrar desde código (aceptan el elemento o su id):
     DCCUI.cajon.abrir(cajon)
     DCCUI.cajon.cerrar(cajon)
     DCCUI.cajon.alternar(cajon) */
(function () {
  "use strict";

  function resolver(c) {
    var el = typeof c === "string" ? document.getElementById(c) : c;
    return el && el.classList && el.classList.contains("dcc-drawer") ? el : null;
  }
  function esModal(el) { return typeof el.showModal === "function"; }
  function abierto(el) { return esModal(el) ? el.open : el.classList.contains("is-open"); }

  // Los botones que abren un persistente reflejan su estado.
  function sincronizar(el) {
    if (!el.id) return;
    var bs = document.querySelectorAll('[data-dcc-abrir="' + el.id + '"]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-expanded", String(abierto(el)));
  }

  function abrir(c) {
    var el = resolver(c);
    if (!el || abierto(el)) return;
    if (esModal(el)) el.showModal();
    else { el.classList.add("is-open"); sincronizar(el); }
  }

  function cerrar(c) {
    var el = resolver(c);
    if (!el || !abierto(el)) return;
    if (esModal(el)) { el.close(); return; }
    // Si el foco estaba adentro, se perdería al esconderse el cajón: vuelve al
    // primer botón que lo abre.
    var foco = el.contains(document.activeElement);
    el.classList.remove("is-open");
    sincronizar(el);
    if (foco && el.id) {
      var b = document.querySelector('[data-dcc-abrir="' + el.id + '"]');
      if (b) b.focus();
    }
  }

  function alternar(c) {
    var el = resolver(c);
    if (el) (abierto(el) ? cerrar : abrir)(el);
  }

  DCCUI.cajon = { abrir: abrir, cerrar: cerrar, alternar: alternar };

  DCCUI.registrar(function (raiz, cada) {
    // El destino se busca al hacer clic y no al enlazar: con htmx el cajón
    // puede llegar después que el botón.
    cada(raiz, "[data-dcc-abrir]", "cajon-abrir", function (btn) {
      btn.addEventListener("click", function () {
        var el = resolver(btn.getAttribute("data-dcc-abrir"));
        if (!el) return;
        if (esModal(el)) abrir(el); else alternar(el);
      });
      var el = resolver(btn.getAttribute("data-dcc-abrir"));
      if (el && !esModal(el)) btn.setAttribute("aria-expanded", String(abierto(el)));
    });

    cada(raiz, "[data-dcc-cerrar]", "cajon-cerrar", function (btn) {
      btn.addEventListener("click", function () {
        var el = btn.closest(".dcc-drawer");
        if (el) cerrar(el);
      });
    });

    cada(raiz, "dialog.dcc-drawer", "cajon-fondo", function (dlg) {
      var desdeFondo = false;
      dlg.addEventListener("pointerdown", function (e) { desdeFondo = e.target === dlg; });
      dlg.addEventListener("click", function (e) {
        if (e.target === dlg && desdeFondo) cerrar(dlg);
        desdeFondo = false;
      });
    });
  });
})();

/* Calificación (Rating de MUI).

   La calificación funciona sin JS: son radios nativos y el CSS pinta las
   estrellas. Este archivo agrega dos cosas que el HTML solo no puede hacer:

     · La etiqueta del valor (`.dcc-rating__label`): muestra el `data-etiqueta`
       del radio marcado —"Excelente"— y, mientras el cursor está sobre una
       estrella, el de esa estrella, para que se sepa qué se va a elegir.
       Sin nada marcado muestra el `data-vacio` de la pieza.
     · Borrar la nota: un clic sobre la estrella ya marcada la desmarca, como
       en MUI. Un radio nativo no se puede desmarcar con el mouse. Con
       `data-requerida` en la pieza no se borra.

   Gancho: `.js-rating` en el `.dcc-rating`. Al borrar emite `change`. */
(function () {
  "use strict";

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-rating", "rating", function (el) {
      var etiqueta = el.querySelector(".dcc-rating__label");
      var previa = false;

      function nombre(input) {
        if (!input) return el.getAttribute("data-vacio") || "";
        return input.getAttribute("data-etiqueta") || input.value;
      }
      function marcada() { return el.querySelector(".dcc-rating__input:checked"); }
      function mostrar(input) { if (etiqueta) etiqueta.textContent = nombre(input); }

      el.addEventListener("change", function () { mostrar(marcada()); });
      el.addEventListener("mouseover", function (e) {
        var item = e.target.closest(".dcc-rating__item");
        if (item) mostrar(item.querySelector(".dcc-rating__input"));
      });
      el.addEventListener("mouseleave", function () { mostrar(marcada()); });

      // El clic del <label> llega al radio después del pointerdown: ahí se
      // sabe si la estrella ya estaba marcada antes de este clic.
      el.addEventListener("pointerdown", function (e) {
        var item = e.target.closest(".dcc-rating__item");
        var input = item && item.querySelector(".dcc-rating__input");
        previa = !!(input && input.checked);
      });
      el.addEventListener("pointerup", function () { setTimeout(function () { previa = false; }, 0); });
      el.addEventListener("click", function (e) {
        var input = e.target;
        if (!input.classList || !input.classList.contains("dcc-rating__input")) return;
        if (previa && !el.hasAttribute("data-requerida")) {
          input.checked = false;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        previa = false;
      });

      mostrar(marcada());
    });
  });
})();

/* Chip eliminable: la cruz (`.dcc-chip__delete.js-chip-delete`) quita el chip.
   Antes de quitarlo emite `dcc-chip-eliminar` en el chip, cancelable: una
   aplicación que tiene que confirmar con el servidor llama a
   `e.preventDefault()` y lo quita ella cuando corresponda. Después de quitarlo
   el foco pasa a la cruz del chip vecino —o al contenedor—, para que quien
   navega con teclado no quede en el vacío al principio de la página.
   Suprimir y Retroceso sobre la cruz hacen lo mismo que el clic, como en MUI. */
(function () {
  "use strict";
  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-chip-delete", "chip-delete", function (btn) {
      function eliminar() {
        var chip = btn.closest(".dcc-chip");
        if (!chip || btn.disabled) return;
        var ev = new CustomEvent("dcc-chip-eliminar", { bubbles: true, cancelable: true });
        if (!chip.dispatchEvent(ev)) return;

        var vecino = chip.nextElementSibling || chip.previousElementSibling;
        var destino = vecino && vecino.querySelector(".dcc-chip__delete:not(:disabled)");
        var padre = chip.parentNode;
        var teniaFoco = chip.contains(document.activeElement);
        chip.remove();
        if (!teniaFoco) return;
        if (destino) { destino.focus(); return; }
        if (padre && padre.nodeType === 1) {
          if (!padre.hasAttribute("tabindex")) padre.setAttribute("tabindex", "-1");
          padre.focus();
        }
      }
      btn.addEventListener("click", eliminar);
      btn.addEventListener("keydown", function (e) {
        if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); eliminar(); }
      });
    });
  });
})();

/* Deslizador (Slider de MUI).

   Con un valor, el control es un <input type="range"> nativo y este archivo
   sólo pinta: lleva el relleno de la pista hasta el valor, escribe la etiqueta
   flotante y ubica las marcas. El teclado y el lector de pantalla los pone el
   navegador, así que sin JS el control funciona igual, sólo sin relleno.

   Con dos manillas (`.dcc-slider__thumb`, role="slider") el JS es el control:
   HTML no tiene un range doble. Sigue el patrón de WAI-ARIA para deslizadores
   con varias manillas —flechas, Inicio/Fin, RePág/AvPág— y cada manilla
   limita a la otra: el mínimo de la de arriba es el valor de la de abajo.

   Atributos de la pieza (`.dcc-slider.js-slider`):
     data-min, data-max, data-step  sólo para el rango; el nativo usa los suyos.
     data-sufijo=" °C"              se agrega al valor en la etiqueta y en
                                    aria-valuetext.
     data-marcas="pasos"            dibuja un punto en cada paso (hasta 100).
   Las marcas escritas a mano son `.dcc-slider__mark` con `data-valor`.
   Si hay <input type="hidden"> dentro del rango, el JS les escribe el valor de
   cada manilla, en orden, para que viajen con el formulario.
   Emite `input` mientras se mueve y `change` al soltar, como el nativo. */
(function () {
  "use strict";

  function num(v, def) {
    var n = parseFloat(v);
    return isNaN(n) ? def : n;
  }

  /* Decimales del paso, para que 0,1 + 0,2 no se muestre como 0,30000000000000004. */
  function decimales(paso) {
    var s = String(paso);
    return s.indexOf(".") < 0 ? 0 : s.length - s.indexOf(".") - 1;
  }

  function texto(v, sufijo) {
    return Number(v).toLocaleString("es-CL") + (sufijo || "");
  }

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-slider", "slider", function (el) {
      var vertical = el.classList.contains("dcc-slider--vertical");
      var sufijo = el.getAttribute("data-sufijo") || "";
      var nativo = el.querySelector(".dcc-slider__input");
      var manillas = Array.prototype.slice.call(el.querySelectorAll(".dcc-slider__thumb"));
      var min, max, paso;

      if (nativo) {
        min = num(nativo.min, 0);
        max = num(nativo.max, 100);
        paso = nativo.step === "any" ? 0 : num(nativo.step, 1);
      } else {
        min = num(el.getAttribute("data-min"), 0);
        max = num(el.getAttribute("data-max"), 100);
        paso = num(el.getAttribute("data-step"), 1);
      }
      var rango = max - min || 1;
      var pct = function (v) { return (v - min) / rango * 100; };
      var lado = vertical ? "bottom" : "left";

      // Puntos en cada paso, si se pidieron y no son demasiados.
      if (el.getAttribute("data-marcas") === "pasos" && paso > 0 && rango / paso <= 100) {
        var caja = el.querySelector(".dcc-slider__marks");
        if (!caja) {
          caja = document.createElement("span");
          caja.className = "dcc-slider__marks";
          caja.setAttribute("aria-hidden", "true");
          el.appendChild(caja);
        }
        for (var v = min; v <= max + paso / 2; v += paso) {
          var m = document.createElement("span");
          m.className = "dcc-slider__mark";
          m.setAttribute("data-valor", v.toFixed(decimales(paso)));
          caja.appendChild(m);
        }
      }
      var marcas = Array.prototype.slice.call(el.querySelectorAll(".dcc-slider__mark"));
      marcas.forEach(function (m) { m.style[lado] = pct(num(m.getAttribute("data-valor"), min)) + "%"; });

      function pintar(desde, hasta) {
        el.style.setProperty("--dcc-slider-desde", pct(desde) + "%");
        el.style.setProperty("--dcc-slider-hasta", pct(hasta) + "%");
        marcas.forEach(function (m) {
          var v = num(m.getAttribute("data-valor"), min);
          m.classList.toggle("is-active", v >= desde && v <= hasta);
        });
      }

      /* ---------- Un valor: range nativo ---------- */
      if (nativo) {
        var etiqueta = el.querySelector(".dcc-slider__value");
        var sincronizar = function () {
          var v = num(nativo.value, min);
          pintar(min, v);
          if (etiqueta) etiqueta.textContent = texto(v, sufijo);
          if (sufijo) nativo.setAttribute("aria-valuetext", texto(v, sufijo));
        };
        nativo.addEventListener("input", sincronizar);
        nativo.addEventListener("change", sincronizar);
        // Un reset del formulario cambia el valor sin emitir `input`.
        if (nativo.form) nativo.form.addEventListener("reset", function () { setTimeout(sincronizar, 0); });
        sincronizar();
        return;
      }

      /* ---------- Rango: manillas ARIA ---------- */
      if (!manillas.length) return;
      var ocultos = el.querySelectorAll('input[type="hidden"]');
      var valores = manillas.map(function (t) { return num(t.getAttribute("aria-valuenow"), min); });
      var dec = decimales(paso);

      function ajustar(v) {
        if (paso > 0) v = Math.round((v - min) / paso) * paso + min;
        return +Math.min(max, Math.max(min, v)).toFixed(dec);
      }

      function render() {
        manillas.forEach(function (t, i) {
          var v = valores[i];
          t.style[lado] = pct(v) + "%";
          t.setAttribute("aria-valuenow", String(v));
          t.setAttribute("aria-valuetext", texto(v, sufijo));
          t.setAttribute("aria-valuemin", String(i > 0 ? valores[i - 1] : min));
          t.setAttribute("aria-valuemax", String(i < valores.length - 1 ? valores[i + 1] : max));
          var et = t.querySelector(".dcc-slider__value");
          if (et) et.textContent = texto(v, sufijo);
          if (ocultos[i]) ocultos[i].value = String(v);
        });
        if (valores.length > 1) pintar(valores[0], valores[valores.length - 1]);
        else pintar(min, valores[0]);
      }

      function emitir(tipo) { el.dispatchEvent(new Event(tipo, { bubbles: true })); }

      /* Mueve la manilla i sin pasar a sus vecinas. Devuelve si cambió. */
      function poner(i, v) {
        v = ajustar(v);
        if (i > 0) v = Math.max(v, valores[i - 1]);
        if (i < valores.length - 1) v = Math.min(v, valores[i + 1]);
        if (v === valores[i]) return false;
        valores[i] = v;
        render();
        emitir("input");
        return true;
      }

      function deshabilitado() { return el.getAttribute("aria-disabled") === "true"; }

      // Teclado: el paso, un décimo del recorrido con RePág/AvPág, y los
      // extremos con Inicio/Fin (los extremos que permite la otra manilla).
      manillas.forEach(function (t, i) {
        t.addEventListener("keydown", function (e) {
          if (deshabilitado()) return;
          var p = paso || rango / 100;
          var grande = Math.max(p, rango / 10);
          var v = valores[i];
          switch (e.key) {
            case "ArrowRight": case "ArrowUp": v += p; break;
            case "ArrowLeft": case "ArrowDown": v -= p; break;
            case "PageUp": v += grande; break;
            case "PageDown": v -= grande; break;
            case "Home": v = min; break;
            case "End": v = max; break;
            default: return;
          }
          e.preventDefault();
          if (poner(i, v)) emitir("change");
        });
      });

      // Puntero: un clic en el riel lleva ahí la manilla más cercana, y se
      // puede seguir arrastrando sin soltar.
      function valorEn(e) {
        var r = el.getBoundingClientRect();
        var f = vertical ? (r.bottom - e.clientY) / r.height : (e.clientX - r.left) / r.width;
        return min + Math.min(1, Math.max(0, f)) * rango;
      }
      var activa = -1, movio = false, empate = false;
      function tomar(i) {
        if (activa >= 0) manillas[activa].classList.remove("is-active");
        activa = i;
        manillas[i].classList.add("is-active");
        manillas[i].focus({ preventScroll: true, focusVisible: false });
      }
      el.addEventListener("pointerdown", function (e) {
        if (deshabilitado() || e.button !== 0) return;
        var v = valorEn(e);
        // La manilla más cercana; si empatan, la que puede ir hacia allá.
        var tocada = 0;
        for (var i = 1; i < valores.length; i++) {
          var d = Math.abs(valores[i] - v), dMejor = Math.abs(valores[tocada] - v);
          if (d < dMejor || (d === dMejor && v > valores[i])) tocada = i;
        }
        // Dos manillas en el mismo punto: se decide cuál es con el primer
        // movimiento, o la de arriba quedaría trabada contra la de abajo.
        empate = valores.filter(function (x) { return x === valores[tocada]; }).length > 1;
        tomar(tocada);
        movio = poner(activa, v);
        if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      el.addEventListener("pointermove", function (e) {
        if (activa < 0) return;
        var v = valorEn(e);
        if (empate && ajustar(v) !== valores[activa]) {
          var iguales = [];
          valores.forEach(function (x, i) { if (x === valores[activa]) iguales.push(i); });
          tomar(v < valores[activa] ? iguales[0] : iguales[iguales.length - 1]);
          empate = false;
        }
        if (poner(activa, v)) movio = true;
      });
      function soltar() {
        if (activa < 0) return;
        manillas[activa].classList.remove("is-active");
        activa = -1;
        if (movio) emitir("change");
        movio = false;
      }
      el.addEventListener("pointerup", soltar);
      el.addEventListener("pointercancel", soltar);
      el.addEventListener("lostpointercapture", soltar);

      manillas.forEach(function (t) { if (deshabilitado()) t.setAttribute("tabindex", "-1"); });
      render();
    });
  });
})();

/* Diálogo: abre y cierra los <dialog class="dcc-dialog"> como modales.

   El <dialog> nativo con showModal() ya atrapa el foco, deja inerte el resto
   de la página y se cierra con Escape. Este módulo agrega lo que el navegador
   no hace solo:

     - ganchos declarativos: un botón con `data-dcc-abrir="id"` abre el diálogo
       con ese id, y cualquier elemento con `data-dcc-cerrar` dentro del diálogo
       lo cierra (su valor, si tiene, queda en `dialog.returnValue`);
     - cierre por clic en el fondo, sólo si el diálogo lo pide con
       `data-dcc-cierre-fondo`: una confirmación no debería perderse por un
       clic distraído, así que por omisión el fondo no cierra;
     - bloqueo del scroll de la página mientras está abierto;
     - cierre animado —con Escape y al enviar un <form method="dialog">
       también—, salvo con movimiento reducido;
     - devolver el foco al elemento que lo abrió.

   API, para abrir y cerrar desde código:

     DCCUI.dialogo.abrir(el, disparador)    el: el <dialog> o su id
     DCCUI.dialogo.cerrar(el, valor)

   El <dialog> emite su evento nativo `close` al terminar de cerrarse, con el
   valor en `returnValue`: es el lugar para reaccionar a lo que se eligió. */
(function () {
  "use strict";

  var doc = document;
  var abiertos = [];

  function sinMovimiento() {
    return !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Sólo los `.dcc-dialog`: otros componentes (el cajón) usan los mismos
     atributos `data-dcc-abrir` y `data-dcc-cerrar`, y cada uno atiende sólo a
     los suyos. */
  function resolver(el) {
    el = typeof el === "string" ? doc.getElementById(el) : el;
    return el && el.classList && el.classList.contains("dcc-dialog") && el.tagName === "DIALOG" ? el : null;
  }

  /* El scroll se bloquea con el primer diálogo y se libera con el último: un
     diálogo puede abrir otro encima. */
  function bloquearScroll() {
    var html = doc.documentElement;
    if (abiertos.length !== 1) return;
    var barra = window.innerWidth - html.clientWidth;
    html.classList.add("dcc-dialog-abierto");
    if (barra > 0) html.style.paddingRight = barra + "px";
  }
  function liberarScroll() {
    var html = doc.documentElement;
    if (abiertos.length) return;
    html.classList.remove("dcc-dialog-abierto");
    html.style.paddingRight = "";
  }

  function enlazar(dlg) {
    var hechos = dlg.__dcc || (dlg.__dcc = {});
    if (hechos.dialogo) return;
    hechos.dialogo = true;

    // Escape dispara `cancel`: se intercepta para cerrar con la animación.
    dlg.addEventListener("cancel", function (e) {
      e.preventDefault();
      cerrar(dlg);
    });

    // `close` llega por cualquier camino —cerrar(), un <form method="dialog">,
    // dlg.close() desde la app—, así que la limpieza vive aquí.
    dlg.addEventListener("close", function () {
      dlg.classList.remove("is-closing");
      var i = abiertos.indexOf(dlg);
      if (i > -1) abiertos.splice(i, 1);
      liberarScroll();
      var volver = dlg.__dccDisparador;
      dlg.__dccDisparador = null;
      if (volver && volver.isConnected && typeof volver.focus === "function") volver.focus();
    });

    // Un <form method="dialog"> cierra el diálogo al enviarse, pero de golpe.
    // Se intercepta para cerrar con la animación; `submit` sólo llega si el
    // formulario pasó la validación, así que ésta sigue funcionando.
    dlg.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form || (form.getAttribute("method") || "").toLowerCase() !== "dialog") return;
      if (form.closest("dialog") !== dlg) return;
      e.preventDefault();
      cerrar(dlg, e.submitter && e.submitter.value ? e.submitter.value : undefined);
    });

    // El clic en el fondo llega al propio <dialog>: se distingue de un clic en
    // su borde mirando si cae fuera del rectángulo. Además tiene que haber
    // empezado ahí, para no cerrar al soltar fuera una selección de texto.
    var empezoFuera = false;
    function fuera(e) {
      var r = dlg.getBoundingClientRect();
      return e.target === dlg && (e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top || e.clientY > r.bottom);
    }
    dlg.addEventListener("mousedown", function (e) { empezoFuera = fuera(e); });
    dlg.addEventListener("click", function (e) {
      var boton = e.target.closest ? e.target.closest("[data-dcc-cerrar]") : null;
      if (boton && dlg.contains(boton)) {
        e.preventDefault();
        cerrar(dlg, boton.getAttribute("data-dcc-cerrar") || undefined);
        return;
      }
      if (dlg.hasAttribute("data-dcc-cierre-fondo") && empezoFuera && fuera(e)) cerrar(dlg);
      empezoFuera = false;
    });
  }

  /* `disparador` es opcional: si no se da, el foco vuelve a lo que estaba
     enfocado al abrir. Los ganchos lo pasan siempre, porque Safari no enfoca
     un botón al hacerle clic. */
  function abrir(el, disparador) {
    var dlg = resolver(el);
    if (!dlg || dlg.open) return;
    enlazar(dlg);
    dlg.classList.remove("is-closing");
    dlg.__dccDisparador = disparador ||
      (doc.activeElement && doc.activeElement !== doc.body ? doc.activeElement : null);
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");   // navegadores muy antiguos y jsdom
    abiertos.push(dlg);
    bloquearScroll();
  }

  function cerrar(el, valor) {
    var dlg = resolver(el);
    if (!dlg || !dlg.open || dlg.classList.contains("is-closing")) return;
    var hecho = false;
    function terminar() {
      if (hecho) return;
      hecho = true;
      if (!dlg.open) return;
      if (typeof dlg.close === "function") dlg.close(valor);
      else {
        dlg.removeAttribute("open");
        dlg.dispatchEvent(new Event("close"));
      }
    }
    if (sinMovimiento()) { terminar(); return; }
    dlg.classList.add("is-closing");
    dlg.addEventListener("animationend", function fin(e) {
      if (e.target !== dlg) return;
      dlg.removeEventListener("animationend", fin);
      terminar();
    });
    // Por si la animación no corre (pestaña en segundo plano, CSS sin cargar).
    setTimeout(terminar, 300);
  }

  DCCUI.dialogo = { abrir: abrir, cerrar: cerrar };

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, "dialog.dcc-dialog", "dialogo-cada", function (dlg) {
      enlazar(dlg);
    });
    // El destino se busca al hacer clic y no al enlazar: con htmx el diálogo
    // puede llegar después que el botón.
    cada(raiz, "[data-dcc-abrir]", "dialogo-abrir", function (btn) {
      if (resolver(btn.getAttribute("data-dcc-abrir")) && !btn.hasAttribute("aria-haspopup")) {
        btn.setAttribute("aria-haspopup", "dialog");
      }
      btn.addEventListener("click", function (e) {
        var dlg = resolver(btn.getAttribute("data-dcc-abrir"));
        if (!dlg) return;
        e.preventDefault();
        abrir(dlg, btn);
      });
    });
  });
})();

/* Botón dividido: la flecha abre un `.dcc-menu` (el menú del kit se encarga
   de abrirlo, cerrarlo y del teclado) con opciones `role="menuitemradio"`.
   Elegir una cambia la acción del botón principal, como en el ejemplo "split
   button" de MUI: se marca con `aria-checked`, el texto de la opción —o su
   `data-etiqueta`— pasa a `.js-split-label` dentro del botón principal, y el
   foco vuelve a la flecha, porque la opción elegida acaba de esconderse.

   Emite `dcc-elegir` en el grupo con `detail.valor`: el `data-valor` de la
   opción, o su texto. */
(function () {
  "use strict";
  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-split-button", "split-button", function (grupo) {
      var etiqueta = grupo.querySelector(".js-split-label");
      var flecha = grupo.querySelector(".dcc-menu__trigger");

      grupo.addEventListener("click", function (e) {
        var opcion = e.target.closest('[role="menuitemradio"]');
        if (!opcion || !grupo.contains(opcion) || opcion.getAttribute("aria-disabled") === "true") return;
        Array.prototype.forEach.call(grupo.querySelectorAll('[role="menuitemradio"]'), function (o) {
          o.setAttribute("aria-checked", String(o === opcion));
        });
        var texto = opcion.getAttribute("data-etiqueta") || opcion.textContent.trim();
        if (etiqueta) etiqueta.textContent = texto;
        if (flecha) flecha.focus();
        grupo.dispatchEvent(new CustomEvent("dcc-elegir", {
          bubbles: true,
          detail: { valor: opcion.getAttribute("data-valor") || texto }
        }));
      });
    });
  });
})();

/* Indicador (Badge de MUI): el contador o punto que se monta en la esquina de
   un ícono, un botón o un avatar.

   El CSS basta si la aplicación ya escribe el número y el nombre accesible en
   el servidor. Este script sólo hace falta cuando el valor cambia en el
   navegador, o para no repetir en cada plantilla la regla del máximo ("99+")
   y la de ocultar el cero:

     <span class="dcc-indicator js-indicator" data-valor="4" data-max="99"
           data-etiqueta="Notificaciones|Notificaciones, 1 nueva|Notificaciones, {n} nuevas">
       <button …>…</button>
       <span class="dcc-indicator__badge" aria-hidden="true">4</span>
     </span>

   data-valor        el número.
   data-max          el tope; sobre él se muestra "99+" (por omisión 99, como MUI).
   data-mostrar-cero con 0 el indicador se oculta salvo que esté este atributo
                     (showZero de MUI).
   data-etiqueta     el nombre accesible del control (o del ícono con role="img"),
                     con {n} donde va el número.
                     Una sola forma, o tres separadas por "|": cero|uno|varios.
                     Pasado el tope, {n} se lee "más de 99".

   El número visible lleva aria-hidden: quien usa lector de pantalla lo recibe
   en el nombre del control ("Notificaciones, 4 nuevas"), que es lo que se
   anuncia al llegar a él.

   API: DCCUI.indicador.fijar(envoltorio, n) cambia el valor y lo vuelve a
   dibujar. */
(function () {
  "use strict";

  function dibujar(env) {
    var badge = env.querySelector(".dcc-indicator__badge");
    if (!badge || !env.hasAttribute("data-valor")) return;
    var n = parseInt(env.getAttribute("data-valor"), 10) || 0;
    var max = parseInt(env.getAttribute("data-max"), 10);
    if (!(max > 0)) max = 99;
    var punto = env.classList.contains("dcc-indicator--dot");
    var excede = n > max;

    badge.textContent = punto ? "" : (excede ? max + "+" : String(n));
    var visible = n !== 0 || env.hasAttribute("data-mostrar-cero");
    badge.classList.toggle("is-invisible", !visible);

    var plantilla = env.getAttribute("data-etiqueta");
    var control = env.querySelector("button, a[href], [role='button'], [tabindex], [role='img']");
    if (plantilla && control) {
      var formas = plantilla.split("|");
      var forma = formas.length === 3 ? formas[n === 0 ? 0 : n === 1 ? 1 : 2] : formas[0];
      control.setAttribute("aria-label", forma.replace("{n}", excede ? "más de " + max : String(n)).trim());
    }
  }

  DCCUI.indicador = {
    fijar: function (env, n) {
      env.setAttribute("data-valor", String(n));
      dibujar(env);
    }
  };

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-indicator", "indicador", dibujar);
    // Botones que suman o restan al indicador cuyo id nombran:
    // <button data-dcc-indicador="id" data-paso="-1">. Así la demo no necesita
    // JavaScript en línea, y una app puede usar lo mismo para un contador.
    cada(raiz, "[data-dcc-indicador]", "indicador-paso", function (boton) {
      boton.addEventListener("click", function () {
        var env = document.getElementById(boton.getAttribute("data-dcc-indicador"));
        if (!env) return;
        var paso = parseInt(boton.getAttribute("data-paso"), 10) || 1;
        DCCUI.indicador.fijar(env, Math.max(0, (parseInt(env.getAttribute("data-valor"), 10) || 0) + paso));
      });
    });
  });
})();

/* Lista de transferencia (Transfer List de MUI).

   Mueve los ítems marcados de una lista a la otra. Los ítems se mueven de
   verdad en el DOM —el mismo <li>, con su casilla y su `value`—, así que lo
   que la aplicación lee al final es simplemente lo que quedó en cada lista.

   Gancho `.js-transfer` en la pieza. Dentro:
     · dos `.dcc-transfer__list` (la primera es la de la izquierda),
     · botones con `data-mover`: "todo-derecha", "derecha", "izquierda",
       "todo-izquierda" (los que se pongan; la versión mejorada usa dos),
     · por panel, opcionales: `.js-transfer-todo` (la casilla de seleccionar
       todo), `.dcc-transfer__count` ("2/6 seleccionados") y
       `.dcc-transfer__title`, que nombra la lista en el aviso,
     · un `.dcc-transfer__status` con aria-live para ese aviso.
   `data-unidad="ramo"` en la pieza nombra lo que se mueve ("2 ramos movidos
   a Inscritos").

   Los botones se deshabilitan cuando no tienen nada que mover. Tras cada
   movimiento la pieza emite `dcc:transferir`, con los `value` de cada lado en
   `detail.izquierda` y `detail.derecha`. */
(function () {
  "use strict";

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-transfer", "transfer", function (el) {
      var listas = el.querySelectorAll(".dcc-transfer__list");
      if (listas.length < 2) return;
      var botones = el.querySelectorAll("[data-mover]");
      var aviso = el.querySelector(".dcc-transfer__status");
      var unidad = el.getAttribute("data-unidad") || "elemento";

      // Sin los espacios entre <li>, una lista que se vacía cumple `:empty` y
      // el CSS puede mostrar su texto de lista vacía.
      [listas[0], listas[1]].forEach(function (l) {
        Array.prototype.slice.call(l.childNodes).forEach(function (n) {
          if (n.nodeType === 3 && !n.nodeValue.trim()) l.removeChild(n);
        });
      });

      function panel(lista) { return lista.closest(".dcc-transfer__panel") || lista.parentNode; }
      function casillas(lista) {
        return Array.prototype.slice.call(lista.querySelectorAll(".dcc-transfer__item input[type=\"checkbox\"]"))
          .filter(function (c) { return !c.disabled; });
      }
      function marcadas(lista) { return casillas(lista).filter(function (c) { return c.checked; }); }
      function titulo(lista) {
        var t = panel(lista).querySelector(".dcc-transfer__title");
        return t ? t.textContent.trim() : (lista.getAttribute("aria-label") || "");
      }

      function sincronizar() {
        [listas[0], listas[1]].forEach(function (l) {
          var total = casillas(l).length, n = marcadas(l).length, p = panel(l);
          var todo = p.querySelector(".js-transfer-todo");
          if (todo) {
            todo.checked = total > 0 && n === total;
            todo.indeterminate = n > 0 && n < total;
            todo.disabled = total === 0;
          }
          var cuenta = p.querySelector(".dcc-transfer__count");
          if (cuenta) cuenta.textContent = n + "/" + total + (n === 1 ? " seleccionado" : " seleccionados");
        });
        for (var i = 0; i < botones.length; i++) {
          var b = botones[i], hay;
          switch (b.getAttribute("data-mover")) {
            case "todo-derecha": hay = casillas(listas[0]).length; break;
            case "derecha": hay = marcadas(listas[0]).length; break;
            case "izquierda": hay = marcadas(listas[1]).length; break;
            case "todo-izquierda": hay = casillas(listas[1]).length; break;
          }
          b.disabled = !hay;
        }
      }

      function mover(desde, hacia, todas) {
        var lista = todas ? casillas(desde) : marcadas(desde);
        if (!lista.length) return;
        lista.forEach(function (c) {
          c.checked = false;
          hacia.appendChild(c.closest(".dcc-transfer__item"));
        });
        sincronizar();
        if (aviso) {
          aviso.textContent = lista.length + " " + unidad + (lista.length === 1 ? " movido" : "s movidos") +
            " a " + titulo(hacia);
        }
        // Si el botón recién usado quedó deshabilitado, el foco se perdería:
        // pasa al siguiente botón disponible o, si no hay, a la lista destino.
        var activo = document.activeElement;
        if (activo && activo.disabled) {
          var siguiente = Array.prototype.filter.call(botones, function (b) { return !b.disabled; })[0];
          var primera = casillas(hacia)[0];
          if (siguiente) siguiente.focus();
          else if (primera) primera.focus();
        }
        el.dispatchEvent(new CustomEvent("dcc:transferir", {
          bubbles: true,
          detail: {
            izquierda: casillas(listas[0]).map(function (c) { return c.value; }),
            derecha: casillas(listas[1]).map(function (c) { return c.value; })
          }
        }));
      }

      el.addEventListener("change", function (e) {
        var t = e.target;
        if (t.classList && t.classList.contains("js-transfer-todo")) {
          var lista = panel(t).querySelector(".dcc-transfer__list");
          casillas(lista).forEach(function (c) { c.checked = t.checked; });
        }
        sincronizar();
      });

      el.addEventListener("click", function (e) {
        var b = e.target.closest("[data-mover]");
        if (!b || b.disabled || !el.contains(b)) return;
        switch (b.getAttribute("data-mover")) {
          case "todo-derecha": mover(listas[0], listas[1], true); break;
          case "derecha": mover(listas[0], listas[1], false); break;
          case "izquierda": mover(listas[1], listas[0], false); break;
          case "todo-izquierda": mover(listas[1], listas[0], true); break;
        }
      });

      sincronizar();
    });
  });
})();

/* Speed Dial: abre y cierra el dial, y lo hace recorrible con el teclado.

   Se abre de tres formas, como en MUI: al pasar el mouse, con un clic (o un
   toque) y con el teclado. Lo que no hace MUI es distinguirlas, y eso deja un
   tropiezo: el dial se abre al acercar el mouse y el clic que sigue —el gesto
   natural— lo vuelve a cerrar. Acá un clic sobre un dial abierto por hover lo
   deja abierto y "fijado": ya no se cierra al sacar el mouse, sólo con otro
   clic, con Escape, al elegir una acción o al hacer clic fuera.

   Teclado (patrón de menú de WAI-ARIA, con las flechas en la dirección del
   dial): la flecha que apunta hacia las acciones abre y lleva el foco a la
   primera, y sigue avanzando; la contraria retrocede y, desde la primera,
   vuelve al botón. Home y End van a los extremos, Escape cierra y devuelve el
   foco al botón, y salir con Tab cierra. Las acciones llevan `tabindex="-1"`:
   el dial entero es una sola parada de Tab. */
(function () {
  "use strict";

  var FLECHAS = {
    up: ["ArrowUp", "ArrowDown"],
    down: ["ArrowDown", "ArrowUp"],
    left: ["ArrowLeft", "ArrowRight"],
    right: ["ArrowRight", "ArrowLeft"]
  };

  function direccion(dial) {
    if (dial.classList.contains("dcc-speed-dial--down")) return "down";
    if (dial.classList.contains("dcc-speed-dial--left")) return "left";
    if (dial.classList.contains("dcc-speed-dial--right")) return "right";
    return "up";
  }

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-speed-dial", "speed-dial", function (dial) {
      var fab = dial.querySelector(".dcc-speed-dial__fab");
      var lista = dial.querySelector(".dcc-speed-dial__actions");
      if (!fab || !lista) return;
      var porHover = false;

      function botones() {
        return Array.prototype.slice.call(lista.querySelectorAll(".dcc-speed-dial__btn"))
          .filter(function (b) { return !b.disabled && b.getAttribute("aria-disabled") !== "true"; });
      }
      function abierto() { return dial.classList.contains("is-open"); }
      function abrir(hover) {
        if (abierto()) return;
        porHover = hover;
        dial.classList.add("is-open");
        fab.setAttribute("aria-expanded", "true");
      }
      function cerrar(devolverFoco) {
        if (!abierto()) return;
        porHover = false;
        dial.classList.remove("is-open");
        fab.setAttribute("aria-expanded", "false");
        if (devolverFoco) fab.focus();
      }
      // Sin vuelta: en la última acción la flecha no hace nada, como en MUI.
      function enfocar(i) {
        var xs = botones();
        if (!xs.length) return;
        xs[Math.max(0, Math.min(i, xs.length - 1))].focus();
      }

      fab.addEventListener("click", function () {
        if (abierto() && porHover) { porHover = false; return; }
        if (abierto()) cerrar(false); else abrir(false);
      });

      dial.addEventListener("keydown", function (e) {
        var flechas = FLECHAS[direccion(dial)];
        var xs = botones();
        var i = xs.indexOf(document.activeElement);
        var enFab = document.activeElement === fab;
        if (!enFab && i < 0) return;

        if (e.key === flechas[0]) {
          e.preventDefault();
          if (enFab) { abrir(false); porHover = false; enfocar(0); }
          else enfocar(i + 1);
        } else if (e.key === flechas[1]) {
          if (enFab) return;
          e.preventDefault();
          if (i === 0) fab.focus(); else enfocar(i - 1);
        } else if ((e.key === "Home" || e.key === "End") && !enFab) {
          e.preventDefault();
          enfocar(e.key === "Home" ? 0 : xs.length - 1);
        } else if (e.key === "Escape" && abierto()) {
          e.preventDefault();
          cerrar(true);
        }
      });

      // Elegir una acción cierra el dial, igual que un menú.
      lista.addEventListener("click", function (e) {
        if (e.target.closest(".dcc-speed-dial__btn")) cerrar(true);
      });

      // Hover sólo con mouse: en pantallas táctiles el toque ya es un clic, y
      // si además abriera por "hover" el clic siguiente lo cerraría.
      dial.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "mouse") abrir(true);
      });
      dial.addEventListener("pointerleave", function (e) {
        if (e.pointerType === "mouse" && porHover) cerrar(false);
      });

      dial.addEventListener("focusout", function (e) {
        if (abierto() && e.relatedTarget && !dial.contains(e.relatedTarget)) cerrar(false);
      });
      document.addEventListener("click", function (e) {
        if (abierto() && !dial.contains(e.target)) cerrar(false);
      });
    });
  });
})();

/* Popover: un panel flotante anclado a un botón, con contenido libre —un texto,
   un formulario corto—, como el Popover de MUI.

     <button class="js-popover" aria-expanded="false" aria-controls="pop-1"
             data-dcc-placement="bottom-start">Filtrar</button>
     <div class="dcc-popover" id="pop-1" role="dialog" aria-labelledby="…" hidden>…</div>

   El panel va justo después del botón en el markup: así el orden de tabulación
   pasa del botón al contenido del panel sin trucos. El script le pone el
   atributo nativo `popover` donde existe, para que suba a la capa superior y no
   lo recorte ningún `overflow`; donde no existe, queda en `position: fixed`.

   Se cierra con Escape, con un clic fuera, cuando el foco sale del panel y del
   botón, o con cualquier elemento `.js-popover-close` de adentro. Al cerrarse
   con Escape o con el botón de cerrar, el foco vuelve al disparador. Al abrirse,
   el foco va al elemento con `data-dcc-autofocus` o, si no hay, al primer
   control del panel; si el panel es sólo texto, se queda en el botón.

   La posición la calcula DCCUI.posicionar, que publica tooltip.js; si ese
   archivo no está cargado, el panel se abre bajo el botón.

   API: DCCUI.popover.abrir(boton), DCCUI.popover.cerrar(). Un solo popover
   abierto a la vez: abrir otro cierra el anterior. */
(function () {
  "use strict";

  var doc = document;
  var conPopover = typeof HTMLElement !== "undefined" &&
    Object.prototype.hasOwnProperty.call(HTMLElement.prototype, "showPopover");
  var ENFOCABLES = "[data-dcc-autofocus], a[href], button:not([disabled]), input:not([disabled]):not([type=hidden])," +
    " select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

  var abierto = null; // { boton, panel }

  function panelDe(boton) {
    return doc.getElementById(boton.getAttribute("aria-controls") || "");
  }

  function ubicar() {
    if (!abierto) return;
    if (!abierto.boton.isConnected) { cerrar(false); return; }
    var panel = abierto.panel;
    var colocacion = abierto.boton.getAttribute("data-dcc-placement") || "bottom-start";
    var conFlecha = panel.classList.contains("dcc-popover--arrow");
    if (DCCUI.posicionar) {
      DCCUI.posicionar(panel, abierto.boton, colocacion, {
        separacion: conFlecha ? 14 : 8,
        variable: "--dcc-popover-arrow"
      });
    } else {
      var r = abierto.boton.getBoundingClientRect();
      panel.style.left = Math.round(r.left) + "px";
      panel.style.top = Math.round(r.bottom + 8) + "px";
      panel.setAttribute("data-placement", "bottom-start");
    }
  }

  function abrir(boton) {
    var panel = panelDe(boton);
    if (!panel) return;
    if (abierto && abierto.boton === boton) return;
    if (abierto) cerrar(false);
    abierto = { boton: boton, panel: panel };
    panel.hidden = false;
    if (conPopover && panel.hasAttribute("popover")) {
      try { panel.showPopover(); } catch (e) { /* ya abierto */ }
    }
    boton.setAttribute("aria-expanded", "true");
    ubicar();
    var foco = panel.querySelector("[data-dcc-autofocus]") || panel.querySelector(ENFOCABLES);
    if (foco) foco.focus();
  }

  /* devolverFoco: true al cerrar con Escape o con un botón de cerrar. Si el
     foco estaba dentro del panel también vuelve, para no dejarlo en un nodo
     oculto. */
  function cerrar(devolverFoco) {
    if (!abierto) return;
    var boton = abierto.boton, panel = abierto.panel;
    var focoAdentro = panel.contains(doc.activeElement);
    abierto = null;
    if (conPopover && panel.hasAttribute("popover")) {
      try { panel.hidePopover(); } catch (e) { /* ya cerrado */ }
    }
    panel.hidden = true;
    boton.setAttribute("aria-expanded", "false");
    if (devolverFoco || focoAdentro) boton.focus();
  }

  doc.addEventListener("click", function (e) {
    if (!abierto) return;
    // Un nodo que el clic sacó del documento venía de adentro (mismo caso que
    // el calendario en behaviors.js).
    if (!e.target.isConnected) return;
    if (!abierto.panel.contains(e.target) && !abierto.boton.contains(e.target)) cerrar(false);
  });
  doc.addEventListener("keydown", function (e) {
    if (abierto && (e.key === "Escape" || e.key === "Esc")) cerrar(true);
  });
  window.addEventListener("scroll", ubicar, true);
  window.addEventListener("resize", ubicar);

  DCCUI.popover = {
    abrir: function (boton) { abrir(boton); },
    cerrar: function () { cerrar(true); }
  };

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-popover", "popover", function (boton) {
      var panel = panelDe(boton);
      if (!panel) return;
      if (conPopover && !panel.hasAttribute("popover")) panel.setAttribute("popover", "manual");
      if (!boton.hasAttribute("aria-expanded")) boton.setAttribute("aria-expanded", "false");
      boton.addEventListener("click", function () {
        if (abierto && abierto.boton === boton) cerrar(false);
        else abrir(boton);
      });
      // El foco salió del panel y del botón (Tab más allá del último control):
      // el panel ya no acompaña a nada y se cierra.
      panel.addEventListener("focusout", function (e) {
        var destino = e.relatedTarget;
        if (abierto && abierto.panel === panel && destino && !panel.contains(destino) && destino !== boton) cerrar(false);
      });
      var cierres = panel.querySelectorAll(".js-popover-close");
      for (var i = 0; i < cierres.length; i++) {
        cierres[i].addEventListener("click", function () { cerrar(true); });
      }
    });
  });
})();

/* Progreso: mantiene en sincronía lo que dice un indicador determinado.

   Un indicador determinado lleva el valor en tres lugares —`aria-valuenow`
   para el lector de pantalla, `--dcc-progress-valor` para el dibujo y, si la
   tiene, la cifra visible— y es fácil actualizar uno y olvidar los otros. Esta
   función los cambia juntos:

     DCCUI.progreso.fijar(el, 60);        // circular o lineal
     DCCUI.progreso.fijar(el, 60, 80);    // lineal con buffer: valor y buffer

   Con `null` como valor el indicador pasa a indeterminado (sin
   `aria-valuenow`, que es lo que le dice al lector que no hay cifra). La cifra
   visible se busca en `.dcc-progress-circle__label` dentro del indicador o en
   el `.dcc-progress-row__value` de su fila. */
(function () {
  "use strict";

  function acotar(n) {
    n = Number(n);
    return isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
  }

  function fijar(el, valor, buffer) {
    if (!el) return;
    var lineal = el.classList.contains("dcc-progress-linear");
    var base = lineal ? "dcc-progress-linear" : "dcc-progress-circle";
    var fila = el.closest ? el.closest(".dcc-progress-row") : null;
    var cifra = el.querySelector("." + base + "__label") ||
      (fila ? fila.querySelector(".dcc-progress-row__value") : null);

    if (valor === null || valor === undefined) {
      el.classList.remove(base + "--determinate");
      el.removeAttribute("aria-valuenow");
      if (cifra) cifra.textContent = "";
      return;
    }
    var v = acotar(valor);
    if (!(lineal && el.classList.contains(base + "--buffer"))) el.classList.add(base + "--determinate");
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", "100");
    el.setAttribute("aria-valuenow", String(Math.round(v)));
    el.style.setProperty("--dcc-progress-valor", String(v));
    if (buffer !== undefined) el.style.setProperty("--dcc-progress-buffer", String(acotar(buffer)));
    if (cifra) cifra.textContent = Math.round(v) + "%";
  }

  DCCUI.progreso = { fijar: fijar };

  /* Al cargar, cada indicador determinado toma su dibujo de `aria-valuenow`.
     Así basta con escribir el valor una vez en el HTML; la variable en línea
     sólo hace falta para que se vea bien también sin JavaScript. */
  DCCUI.registrar(function (raiz, cada) {
    var sel = ".dcc-progress-circle--determinate, .dcc-progress-linear--determinate, .dcc-progress-linear--buffer";
    cada(raiz, sel, "progreso", function (el) {
      var v = el.getAttribute("aria-valuenow");
      if (v !== null && !el.style.getPropertyValue("--dcc-progress-valor")) {
        el.style.setProperty("--dcc-progress-valor", String(acotar(v)));
      }
    });
  });
})();

/* Snackbar: avisos breves que aparecen en un borde de la pantalla y se van solos.

   Desde código:

     var aviso = DCCUI.notificar({
       mensaje: "Memoria archivada",          // texto, obligatorio
       tipo: "success",                       // opcional: success, error, info, warning
       accion: { texto: "Deshacer", alHacer: function () { … } },   // opcional
       duracion: 6000,                        // ms; 0 = no se cierra solo
       posicion: "bottom-center",             // bottom-left, top-right, …
       cerrable: true                         // botón de cerrar (por omisión, sí)
     });
     aviso.cerrar();

   En HTML, para las demos o para avisos que no necesitan código: un botón con
   la clase `js-notificar` y los mismos datos en atributos —`data-mensaje`,
   `data-tipo`, `data-accion`, `data-accion-mensaje` (el aviso que sigue a la
   acción), `data-duracion`, `data-posicion`—.

   Se muestra un aviso a la vez, como recomienda Material: los que llegan
   mientras otro está visible esperan su turno en una cola. Un aviso sin
   duración no bloquea la cola: se cierra en cuanto llega el siguiente.

   El tiempo se pausa mientras el cursor está encima o el foco está dentro —para
   alcanzar a leerlo o a usar la acción— y mientras la ventana no tiene el
   foco. Escape cierra el aviso visible.

   Los avisos se insertan en una región `role="status"` (aria-live="polite")
   que se crea al cargar: así el lector de pantalla los lee sin quitarle el foco
   a nadie. Los de tipo error llevan además `role="alert"`, que interrumpe. */
(function () {
  "use strict";

  var doc = document;
  var SVG = "http://www.w3.org/2000/svg";
  var ICONOS = { success: "i-circle-check", error: "i-circle-alert", info: "i-info", warning: "i-triangle-alert" };
  var POSICIONES = ["bottom-center", "bottom-left", "bottom-right", "top-center", "top-left", "top-right"];
  var DURACION = 6000;

  var region = null;
  var cola = [];
  var actual = null;

  function sinMovimiento() {
    return !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function asegurarRegion() {
    if (region && region.isConnected) return region;
    region = doc.querySelector(".dcc-snackbar-region");
    if (!region) {
      region = doc.createElement("div");
      region.className = "dcc-snackbar-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      doc.body.appendChild(region);
    }
    return region;
  }

  function icono(id, clase) {
    var svg = doc.createElementNS(SVG, "svg");
    svg.setAttribute("class", "dcc-i " + clase);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var use = doc.createElementNS(SVG, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function construir(op) {
    var el = doc.createElement("div");
    var pos = POSICIONES.indexOf(op.posicion) > -1 ? op.posicion : "bottom-center";
    el.className = "dcc-snackbar dcc-snackbar--" + pos + (ICONOS[op.tipo] ? " dcc-snackbar--" + op.tipo : "");
    if (op.tipo === "error") el.setAttribute("role", "alert");
    if (ICONOS[op.tipo]) el.appendChild(icono(ICONOS[op.tipo], "dcc-snackbar__icon"));

    var msj = doc.createElement("div");
    msj.className = "dcc-snackbar__message";
    msj.textContent = op.mensaje;
    el.appendChild(msj);

    var acciones = doc.createElement("div");
    acciones.className = "dcc-snackbar__actions";
    if (op.accion && op.accion.texto) {
      var b = doc.createElement("button");
      b.type = "button";
      b.className = "dcc-snackbar__action";
      b.textContent = op.accion.texto;
      acciones.appendChild(b);
    }
    if (op.cerrable !== false) {
      var x = doc.createElement("button");
      x.type = "button";
      x.className = "dcc-icon-btn dcc-icon-btn--sm dcc-icon-btn--inherit dcc-snackbar__close";
      x.setAttribute("aria-label", "Cerrar aviso");
      x.appendChild(icono("i-x", ""));
      acciones.appendChild(x);
    }
    if (acciones.childNodes.length) el.appendChild(acciones);
    return el;
  }

  /* Muestra el siguiente de la cola, si no hay uno visible. */
  function siguiente() {
    if (actual || !cola.length) return;
    var aviso = cola.shift();
    actual = aviso;
    var el = aviso.el;
    asegurarRegion().appendChild(el);
    // Un cuadro después, para que la transición parta del estado inicial.
    var mostrar = function () { el.classList.add("is-visible"); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { window.requestAnimationFrame(mostrar); });
    else mostrar();

    // Temporizador pausable: se lleva la cuenta de lo que falta.
    var restante = aviso.duracion;
    var desde = 0;
    var timer = null;
    var pausas = { cursor: false, foco: false, ventana: false };
    function correr() {
      if (!restante || timer || pausas.cursor || pausas.foco || pausas.ventana) return;
      desde = Date.now();
      timer = setTimeout(function () { aviso.cerrar(); }, restante);
    }
    function pausar() {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
      restante = Math.max(restante - (Date.now() - desde), 0) || 1;
    }
    function cambiar(clave, valor) {
      pausas[clave] = valor;
      if (valor) pausar(); else correr();
    }
    el.addEventListener("mouseenter", function () { cambiar("cursor", true); });
    el.addEventListener("mouseleave", function () { cambiar("cursor", false); });
    el.addEventListener("focusin", function () { cambiar("foco", true); });
    el.addEventListener("focusout", function (e) {
      if (!el.contains(e.relatedTarget)) cambiar("foco", false);
    });
    function blur() { cambiar("ventana", true); }
    function focus() { cambiar("ventana", false); }
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    aviso.detener = function () {
      clearTimeout(timer);
      timer = null;
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
    };
    correr();
    // Si ya esperaba otro, el aviso sin duración le cede el lugar.
    if (!aviso.duracion && cola.length) aviso.cerrar();
  }

  function notificar(opciones) {
    var op = opciones || {};
    if (typeof op === "string") op = { mensaje: op };
    var d = parseInt(op.duracion, 10);
    var aviso = {
      el: construir(op),
      duracion: isNaN(d) ? DURACION : Math.max(d, 0),
      cerrado: false
    };

    aviso.cerrar = function () {
      if (aviso.cerrado) return;
      aviso.cerrado = true;
      var i = cola.indexOf(aviso);
      if (i > -1) { cola.splice(i, 1); return; }   // todavía no se mostraba
      if (aviso.detener) aviso.detener();
      var el = aviso.el;
      // Si el foco estaba en el aviso, se devuelve a la página en vez de perderse.
      var tenia = el.contains(doc.activeElement);
      function quitar() {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (actual === aviso) actual = null;
        siguiente();
      }
      el.classList.remove("is-visible");
      if (tenia && aviso.volver && aviso.volver.isConnected) aviso.volver.focus();
      if (sinMovimiento()) quitar();
      else setTimeout(quitar, 230);
      if (typeof op.alCerrar === "function") op.alCerrar();
    };

    var accion = aviso.el.querySelector(".dcc-snackbar__action");
    if (accion) accion.addEventListener("click", function () {
      aviso.cerrar();
      if (op.accion && typeof op.accion.alHacer === "function") op.accion.alHacer();
    });
    var x = aviso.el.querySelector(".dcc-snackbar__close");
    if (x) x.addEventListener("click", aviso.cerrar);

    aviso.volver = doc.activeElement !== doc.body ? doc.activeElement : null;
    cola.push(aviso);
    asegurarRegion();
    if (actual && !actual.duracion) actual.cerrar();
    siguiente();
    return { cerrar: aviso.cerrar };
  }

  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !actual || e.defaultPrevented) return;
    // Con un diálogo abierto, Escape es suyo.
    if (doc.querySelector("dialog[open]")) return;
    actual.cerrar();
  });

  DCCUI.notificar = notificar;

  DCCUI.registrar(function (raiz, cada) {
    // La región existe desde el principio: los lectores de pantalla sólo
    // anuncian cambios en regiones vivas que ya estaban en la página.
    if (raiz === doc && doc.body) asegurarRegion();

    cada(raiz, ".js-notificar", "notificar", function (btn) {
      btn.addEventListener("click", function () {
        var ds = btn.dataset;
        var op = {
          mensaje: ds.mensaje || "",
          tipo: ds.tipo,
          posicion: ds.posicion,
          duracion: ds.duracion
        };
        if (ds.accion) op.accion = {
          texto: ds.accion,
          alHacer: ds.accionMensaje ? function () { notificar({ mensaje: ds.accionMensaje }); } : null
        };
        notificar(op);
      });
    });
  });
})();

/* Card: el botón "ver más" de la tarjeta genérica.

   El botón lleva `aria-expanded` y `aria-controls` con el id del bloque
   `.dcc-surface-card__collapse`; al pulsarlo se alternan los dos a la vez. La
   animación y el ocultamiento los hace el CSS con `.is-open`. Si el bloque
   empieza abierto (`.is-open` en el HTML), el botón se ajusta al cargar.
   La etiqueta del botón no cambia: el estado lo anuncia `aria-expanded`. */
(function () {
  "use strict";
  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-surface-card-expand", "surface-card-expand", function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      btn.setAttribute("aria-expanded", String(panel.classList.contains("is-open")));
      btn.addEventListener("click", function () {
        var abrir = !panel.classList.contains("is-open");
        panel.classList.toggle("is-open", abrir);
        btn.setAttribute("aria-expanded", String(abrir));
      });
    });
  });
})();

/* Tooltip: una etiqueta breve que aparece al pasar el cursor o al enfocar un
   control, como el Tooltip de MUI.

   Dos formas de declararlo:

     <button data-dcc-tooltip="Eliminar" aria-label="Eliminar">…</button>
       El texto va en el atributo y el script crea el globo. Si el texto cambia
       (p. ej. "Copiar" → "Copiado"), basta con cambiar el atributo: se relee
       cada vez que el tooltip se abre.

     <button class="js-tooltip" aria-describedby="tt-1">…</button>
     <span class="dcc-tooltip" role="tooltip" id="tt-1" hidden>…</span>
       El globo ya está en el markup, por si lleva formato. Se asocia por
       aria-describedby (o aria-labelledby).

   Opciones en el disparador: `data-dcc-placement` (top, bottom —por omisión,
   como en MUI—, left o right, con -start o -end) y `data-dcc-arrow` para la
   flecha (en el markup basta con la clase .dcc-tooltip--arrow).

   Accesibilidad (WCAG 1.4.13): se abre con hover y con foco de teclado, se
   cierra con Escape sin mover el foco, y el cursor puede pasar del disparador
   al globo sin que desaparezca. Como en MUI, si el disparador no tiene nombre
   accesible el tooltip pasa a ser su nombre (aria-labelledby); si ya lo tiene
   y dice lo mismo, no se repite; si no, el tooltip queda como descripción.

   El posicionamiento se publica como DCCUI.posicionar(flotante, ancla,
   colocacion, opciones) para que lo usen el popover y cualquier otra pieza
   flotante: elige el lado pedido, se da vuelta al opuesto si no cabe en la
   ventana y corre el globo para que no se salga por los costados.

   API: DCCUI.tooltip.abrir(disparador) y DCCUI.tooltip.cerrar(). */
(function () {
  "use strict";

  var doc = document;
  // Retrasos de MUI: 100 ms antes de abrir, para que no parpadeen tooltips al
  // cruzar la pantalla con el cursor. Al salir se espera un poco más para dar
  // tiempo a llegar al globo.
  var ENTRADA = 100;
  var SALIDA = 120;
  var MARGEN = 8;          // distancia mínima al borde de la ventana
  var SEPARACION = 8;      // entre el disparador y el globo
  var CON_FLECHA = 12;     // separación cuando hay flecha (la flecha mide 6px)

  // El atributo `popover` sube el globo a la capa superior: no lo recortan los
  // `overflow: hidden` ni lo tapan los z-index de la página. Donde no existe,
  // queda como `position: fixed` con un z-index alto.
  var conPopover = typeof HTMLElement !== "undefined" &&
    Object.prototype.hasOwnProperty.call(HTMLElement.prototype, "showPopover");

  function prepararFlotante(el) {
    if (conPopover && !el.hasAttribute("popover")) el.setAttribute("popover", "manual");
  }
  function mostrarFlotante(el) {
    el.hidden = false;
    if (conPopover && el.hasAttribute("popover")) {
      try { if (!el.matches(":popover-open")) el.showPopover(); } catch (e) { /* desconectado */ }
    }
  }
  function ocultarFlotante(el) {
    if (conPopover && el.hasAttribute("popover")) {
      try { if (el.matches(":popover-open")) el.hidePopover(); } catch (e) { /* ya cerrado */ }
    }
    el.hidden = true;
  }

  function acotar(v, min, max) { return Math.max(min, Math.min(v, max)); }

  var OPUESTO = { top: "bottom", bottom: "top", left: "right", right: "left" };

  /* Ubica `flotante` (ya visible, con position: fixed) junto a `ancla`.
     colocacion: "top" | "bottom" | "left" | "right", con "-start" o "-end".
     opciones.separacion: px entre ancla y flotante.
     opciones.variable: propiedad CSS donde se escribe la posición de la flecha,
       medida desde el borde del flotante hasta el centro del ancla.
     Devuelve la colocación final y la deja en data-placement. */
  function posicionar(flotante, ancla, colocacion, opciones) {
    opciones = opciones || {};
    var sep = opciones.separacion == null ? SEPARACION : opciones.separacion;
    var partes = String(colocacion || "bottom").split("-");
    var lado = OPUESTO[partes[0]] ? partes[0] : "bottom";
    var alin = partes[1] === "start" || partes[1] === "end" ? partes[1] : "";

    flotante.style.left = "0px";
    flotante.style.top = "0px";
    var a = ancla.getBoundingClientRect();
    var w = flotante.offsetWidth, h = flotante.offsetHeight;
    var vw = doc.documentElement.clientWidth || window.innerWidth;
    var vh = doc.documentElement.clientHeight || window.innerHeight;

    function cabe(l) {
      if (l === "top") return a.top - sep - h >= MARGEN;
      if (l === "bottom") return a.bottom + sep + h <= vh - MARGEN;
      if (l === "left") return a.left - sep - w >= MARGEN;
      return a.right + sep + w <= vw - MARGEN;
    }
    if (!cabe(lado) && cabe(OPUESTO[lado])) lado = OPUESTO[lado];
    // A los costados no hay dónde ir (pantalla angosta): se pasa arriba o abajo.
    if ((lado === "left" || lado === "right") && !cabe(lado)) {
      lado = cabe("top") || !cabe("bottom") ? "top" : "bottom";
      alin = "";
    }

    var vertical = lado === "top" || lado === "bottom";
    var x, y;
    if (vertical) {
      y = lado === "top" ? a.top - sep - h : a.bottom + sep;
      x = alin === "start" ? a.left : alin === "end" ? a.right - w : a.left + a.width / 2 - w / 2;
      x = acotar(x, MARGEN, vw - MARGEN - w);
    } else {
      x = lado === "left" ? a.left - sep - w : a.right + sep;
      y = alin === "start" ? a.top : alin === "end" ? a.bottom - h : a.top + a.height / 2 - h / 2;
      y = acotar(y, MARGEN, vh - MARGEN - h);
    }
    flotante.style.left = Math.round(x) + "px";
    flotante.style.top = Math.round(y) + "px";

    if (opciones.variable) {
      var centro = vertical ? a.left + a.width / 2 - x : a.top + a.height / 2 - y;
      var largo = vertical ? w : h;
      flotante.style.setProperty(opciones.variable, Math.round(acotar(centro, 12, Math.max(12, largo - 12))) + "px");
    }
    var final = lado + (alin ? "-" + alin : "");
    flotante.setAttribute("data-placement", final);
    return final;
  }

  /* ---------- Tooltip ---------- */
  var contador = 0;
  var abierto = null;   // { disparador, globo }; hay un solo tooltip abierto a la vez
  var temporizador = null;

  function programar(fn, ms) {
    clearTimeout(temporizador);
    temporizador = setTimeout(fn, ms);
  }

  function tieneNombre(el) {
    return !!(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") ||
      (el.textContent || "").trim() || el.getAttribute("alt"));
  }

  function anadirId(el, atributo, id) {
    var ids = (el.getAttribute(atributo) || "").split(/\s+/).filter(Boolean);
    if (ids.indexOf(id) < 0) ids.push(id);
    el.setAttribute(atributo, ids.join(" "));
  }

  function globoDe(el) {
    if (el.__dccTooltip) return el.__dccTooltip;
    var globo;
    if (el.hasAttribute("data-dcc-tooltip")) {
      globo = doc.createElement("span");
      globo.className = "dcc-tooltip" + (el.hasAttribute("data-dcc-arrow") ? " dcc-tooltip--arrow" : "");
      globo.setAttribute("role", "tooltip");
      globo.id = "dcc-tooltip-" + (++contador);
      globo.hidden = true;
      globo.textContent = el.getAttribute("data-dcc-tooltip");
      // Al lado del disparador y no al final del <body>: así hereda el tema
      // (data-dcc-theme) del contenedor donde vive el disparador.
      el.insertAdjacentElement("afterend", globo);
      var texto = globo.textContent.trim();
      if (!tieneNombre(el)) anadirId(el, "aria-labelledby", globo.id);
      else if ((el.getAttribute("aria-label") || "").trim() !== texto) anadirId(el, "aria-describedby", globo.id);
    } else {
      var ids = ((el.getAttribute("aria-describedby") || "") + " " + (el.getAttribute("aria-labelledby") || ""))
        .split(/\s+/).filter(Boolean);
      for (var i = 0; i < ids.length && !globo; i++) {
        var c = doc.getElementById(ids[i]);
        if (c && c.getAttribute("role") === "tooltip") globo = c;
      }
      if (!globo) return null;
    }
    // Un `title` nativo mostraría un segundo tooltip encima del nuestro.
    if (el.hasAttribute("title")) el.removeAttribute("title");
    prepararFlotante(globo);
    globo.addEventListener("mouseenter", function () { clearTimeout(temporizador); });
    globo.addEventListener("mouseleave", function () { programar(cerrar, SALIDA); });
    el.__dccTooltip = globo;
    return globo;
  }

  function ubicar() {
    if (!abierto) return;
    if (!abierto.disparador.isConnected) { cerrar(); return; }
    var conFlecha = abierto.globo.classList.contains("dcc-tooltip--arrow");
    posicionar(abierto.globo, abierto.disparador, abierto.disparador.getAttribute("data-dcc-placement") || "bottom", {
      separacion: conFlecha ? CON_FLECHA : SEPARACION,
      variable: "--dcc-tooltip-arrow"
    });
  }

  function abrir(el) {
    clearTimeout(temporizador);
    var globo = globoDe(el);
    if (!globo) return;
    if (abierto && abierto.disparador !== el) cerrar();
    if (el.hasAttribute("data-dcc-tooltip")) globo.textContent = el.getAttribute("data-dcc-tooltip");
    if (!globo.textContent.trim()) return;
    abierto = { disparador: el, globo: globo };
    mostrarFlotante(globo);
    ubicar();
  }

  function cerrar() {
    clearTimeout(temporizador);
    if (!abierto) return;
    ocultarFlotante(abierto.globo);
    abierto = null;
  }

  // Se abre con foco de teclado, no con el foco que deja un clic: igual que MUI,
  // que usa :focus-visible para esto.
  function focoVisible(el) {
    try { return el.matches(":focus-visible"); } catch (e) { return true; }
  }

  doc.addEventListener("keydown", function (e) {
    if (abierto && (e.key === "Escape" || e.key === "Esc")) cerrar();
  });
  window.addEventListener("scroll", ubicar, true);
  window.addEventListener("resize", ubicar);

  DCCUI.posicionar = posicionar;
  DCCUI.tooltip = {
    abrir: function (el) { abrir(el); },
    cerrar: function () { cerrar(); }
  };

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, "[data-dcc-tooltip], .js-tooltip", "tooltip", function (el) {
      if (!globoDe(el)) return;
      el.addEventListener("mouseenter", function () {
        if (abierto && abierto.disparador === el) clearTimeout(temporizador);
        else programar(function () { abrir(el); }, ENTRADA);
      });
      el.addEventListener("mouseleave", function () {
        if (abierto && abierto.disparador === el) programar(cerrar, SALIDA);
        else clearTimeout(temporizador);
      });
      el.addEventListener("focus", function () { if (focoVisible(el)) abrir(el); });
      el.addEventListener("blur", function () { if (abierto && abierto.disparador === el) cerrar(); });
      // Un clic es una acción, no una consulta: el tooltip se aparta, como en MUI.
      el.addEventListener("mousedown", function () { if (abierto && abierto.disparador === el) cerrar(); });
    });
  });
})();
