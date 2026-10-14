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
