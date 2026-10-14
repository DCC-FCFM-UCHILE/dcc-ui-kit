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
