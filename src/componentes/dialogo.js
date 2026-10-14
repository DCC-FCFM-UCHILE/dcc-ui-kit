/* Diálogo: abre y cierra los <dialog class="dcc-dialog"> como modales.

   El <dialog> nativo con showModal() ya atrapa el foco, deja inerte el resto
   de la página y se cierra con Escape. Este módulo agrega lo que el navegador
   no hace solo:

     - ganchos declarativos: un botón con `data-dcc-abrir="id"` abre el diálogo
       con ese id, y cualquier elemento con `data-dcc-cerrar` dentro del diálogo
       lo cierra (su valor, si tiene, queda en `dialog.returnValue`);
     - cierre por clic en el fondo, sólo si el diálogo lo pide con
       `data-dcc-cierre-fondo`: una confirmación no debería perderse por un
       clic distraído, así que por omisión el fondo no cierra;
     - bloqueo del scroll de la página mientras está abierto;
     - cierre animado —con Escape y al enviar un <form method="dialog">
       también—, salvo con movimiento reducido;
     - devolver el foco al elemento que lo abrió.

   API, para abrir y cerrar desde código:

     DCCUI.dialogo.abrir(el, disparador)    el: el <dialog> o su id
     DCCUI.dialogo.cerrar(el, valor)

   El <dialog> emite su evento nativo `close` al terminar de cerrarse, con el
   valor en `returnValue`: es el lugar para reaccionar a lo que se eligió. */
(function () {
  "use strict";

  var doc = document;
  var abiertos = [];

  function sinMovimiento() {
    return !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Sólo los `.dcc-dialog`: otros componentes (el cajón) usan los mismos
     atributos `data-dcc-abrir` y `data-dcc-cerrar`, y cada uno atiende sólo a
     los suyos. */
  function resolver(el) {
    el = typeof el === "string" ? doc.getElementById(el) : el;
    return el && el.classList && el.classList.contains("dcc-dialog") && el.tagName === "DIALOG" ? el : null;
  }

  /* El scroll se bloquea con el primer diálogo y se libera con el último: un
     diálogo puede abrir otro encima. */
  function bloquearScroll() {
    var html = doc.documentElement;
    if (abiertos.length !== 1) return;
    var barra = window.innerWidth - html.clientWidth;
    html.classList.add("dcc-dialog-abierto");
    if (barra > 0) html.style.paddingRight = barra + "px";
  }
  function liberarScroll() {
    var html = doc.documentElement;
    if (abiertos.length) return;
    html.classList.remove("dcc-dialog-abierto");
    html.style.paddingRight = "";
  }

  function enlazar(dlg) {
    var hechos = dlg.__dcc || (dlg.__dcc = {});
    if (hechos.dialogo) return;
    hechos.dialogo = true;

    // Escape dispara `cancel`: se intercepta para cerrar con la animación.
    dlg.addEventListener("cancel", function (e) {
      e.preventDefault();
      cerrar(dlg);
    });

    // `close` llega por cualquier camino —cerrar(), un <form method="dialog">,
    // dlg.close() desde la app—, así que la limpieza vive aquí.
    dlg.addEventListener("close", function () {
      dlg.classList.remove("is-closing");
      var i = abiertos.indexOf(dlg);
      if (i > -1) abiertos.splice(i, 1);
      liberarScroll();
      var volver = dlg.__dccDisparador;
      dlg.__dccDisparador = null;
      if (volver && volver.isConnected && typeof volver.focus === "function") volver.focus();
    });

    // Un <form method="dialog"> cierra el diálogo al enviarse, pero de golpe.
    // Se intercepta para cerrar con la animación; `submit` sólo llega si el
    // formulario pasó la validación, así que ésta sigue funcionando.
    dlg.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form || (form.getAttribute("method") || "").toLowerCase() !== "dialog") return;
      if (form.closest("dialog") !== dlg) return;
      e.preventDefault();
      cerrar(dlg, e.submitter && e.submitter.value ? e.submitter.value : undefined);
    });

    // El clic en el fondo llega al propio <dialog>: se distingue de un clic en
    // su borde mirando si cae fuera del rectángulo. Además tiene que haber
    // empezado ahí, para no cerrar al soltar fuera una selección de texto.
    var empezoFuera = false;
    function fuera(e) {
      var r = dlg.getBoundingClientRect();
      return e.target === dlg && (e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top || e.clientY > r.bottom);
    }
    dlg.addEventListener("mousedown", function (e) { empezoFuera = fuera(e); });
    dlg.addEventListener("click", function (e) {
      var boton = e.target.closest ? e.target.closest("[data-dcc-cerrar]") : null;
      if (boton && dlg.contains(boton)) {
        e.preventDefault();
        cerrar(dlg, boton.getAttribute("data-dcc-cerrar") || undefined);
        return;
      }
      if (dlg.hasAttribute("data-dcc-cierre-fondo") && empezoFuera && fuera(e)) cerrar(dlg);
      empezoFuera = false;
    });
  }

  /* `disparador` es opcional: si no se da, el foco vuelve a lo que estaba
     enfocado al abrir. Los ganchos lo pasan siempre, porque Safari no enfoca
     un botón al hacerle clic. */
  function abrir(el, disparador) {
    var dlg = resolver(el);
    if (!dlg || dlg.open) return;
    enlazar(dlg);
    dlg.classList.remove("is-closing");
    dlg.__dccDisparador = disparador ||
      (doc.activeElement && doc.activeElement !== doc.body ? doc.activeElement : null);
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");   // navegadores muy antiguos y jsdom
    abiertos.push(dlg);
    bloquearScroll();
  }

  function cerrar(el, valor) {
    var dlg = resolver(el);
    if (!dlg || !dlg.open || dlg.classList.contains("is-closing")) return;
    var hecho = false;
    function terminar() {
      if (hecho) return;
      hecho = true;
      if (!dlg.open) return;
      if (typeof dlg.close === "function") dlg.close(valor);
      else {
        dlg.removeAttribute("open");
        dlg.dispatchEvent(new Event("close"));
      }
    }
    if (sinMovimiento()) { terminar(); return; }
    dlg.classList.add("is-closing");
    dlg.addEventListener("animationend", function fin(e) {
      if (e.target !== dlg) return;
      dlg.removeEventListener("animationend", fin);
      terminar();
    });
    // Por si la animación no corre (pestaña en segundo plano, CSS sin cargar).
    setTimeout(terminar, 300);
  }

  DCCUI.dialogo = { abrir: abrir, cerrar: cerrar };

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, "dialog.dcc-dialog", "dialogo-cada", function (dlg) {
      enlazar(dlg);
    });
    // El destino se busca al hacer clic y no al enlazar: con htmx el diálogo
    // puede llegar después que el botón.
    cada(raiz, "[data-dcc-abrir]", "dialogo-abrir", function (btn) {
      if (resolver(btn.getAttribute("data-dcc-abrir")) && !btn.hasAttribute("aria-haspopup")) {
        btn.setAttribute("aria-haspopup", "dialog");
      }
      btn.addEventListener("click", function (e) {
        var dlg = resolver(btn.getAttribute("data-dcc-abrir"));
        if (!dlg) return;
        e.preventDefault();
        abrir(dlg, btn);
      });
    });
  });
})();
