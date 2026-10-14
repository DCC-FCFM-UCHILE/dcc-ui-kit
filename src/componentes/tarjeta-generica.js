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
