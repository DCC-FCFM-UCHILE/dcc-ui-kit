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
