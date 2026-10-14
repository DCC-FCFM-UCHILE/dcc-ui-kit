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
