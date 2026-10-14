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
