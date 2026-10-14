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
