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
