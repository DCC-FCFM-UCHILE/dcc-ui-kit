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
