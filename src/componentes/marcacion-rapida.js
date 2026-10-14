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
