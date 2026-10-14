/* Snackbar: avisos breves que aparecen en un borde de la pantalla y se van solos.

   Desde código:

     var aviso = DCCUI.notificar({
       mensaje: "Memoria archivada",          // texto, obligatorio
       tipo: "success",                       // opcional: success, error, info, warning
       accion: { texto: "Deshacer", alHacer: function () { … } },   // opcional
       duracion: 6000,                        // ms; 0 = no se cierra solo
       posicion: "bottom-center",             // bottom-left, top-right, …
       cerrable: true                         // botón de cerrar (por omisión, sí)
     });
     aviso.cerrar();

   En HTML, para las demos o para avisos que no necesitan código: un botón con
   la clase `js-notificar` y los mismos datos en atributos —`data-mensaje`,
   `data-tipo`, `data-accion`, `data-accion-mensaje` (el aviso que sigue a la
   acción), `data-duracion`, `data-posicion`—.

   Se muestra un aviso a la vez, como recomienda Material: los que llegan
   mientras otro está visible esperan su turno en una cola. Un aviso sin
   duración no bloquea la cola: se cierra en cuanto llega el siguiente.

   El tiempo se pausa mientras el cursor está encima o el foco está dentro —para
   alcanzar a leerlo o a usar la acción— y mientras la ventana no tiene el
   foco. Escape cierra el aviso visible.

   Los avisos se insertan en una región `role="status"` (aria-live="polite")
   que se crea al cargar: así el lector de pantalla los lee sin quitarle el foco
   a nadie. Los de tipo error llevan además `role="alert"`, que interrumpe. */
(function () {
  "use strict";

  var doc = document;
  var SVG = "http://www.w3.org/2000/svg";
  var ICONOS = { success: "i-circle-check", error: "i-circle-alert", info: "i-info", warning: "i-triangle-alert" };
  var POSICIONES = ["bottom-center", "bottom-left", "bottom-right", "top-center", "top-left", "top-right"];
  var DURACION = 6000;

  var region = null;
  var cola = [];
  var actual = null;

  function sinMovimiento() {
    return !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function asegurarRegion() {
    if (region && region.isConnected) return region;
    region = doc.querySelector(".dcc-snackbar-region");
    if (!region) {
      region = doc.createElement("div");
      region.className = "dcc-snackbar-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      doc.body.appendChild(region);
    }
    return region;
  }

  function icono(id, clase) {
    var svg = doc.createElementNS(SVG, "svg");
    svg.setAttribute("class", "dcc-i " + clase);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var use = doc.createElementNS(SVG, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function construir(op) {
    var el = doc.createElement("div");
    var pos = POSICIONES.indexOf(op.posicion) > -1 ? op.posicion : "bottom-center";
    el.className = "dcc-snackbar dcc-snackbar--" + pos + (ICONOS[op.tipo] ? " dcc-snackbar--" + op.tipo : "");
    if (op.tipo === "error") el.setAttribute("role", "alert");
    if (ICONOS[op.tipo]) el.appendChild(icono(ICONOS[op.tipo], "dcc-snackbar__icon"));

    var msj = doc.createElement("div");
    msj.className = "dcc-snackbar__message";
    msj.textContent = op.mensaje;
    el.appendChild(msj);

    var acciones = doc.createElement("div");
    acciones.className = "dcc-snackbar__actions";
    if (op.accion && op.accion.texto) {
      var b = doc.createElement("button");
      b.type = "button";
      b.className = "dcc-snackbar__action";
      b.textContent = op.accion.texto;
      acciones.appendChild(b);
    }
    if (op.cerrable !== false) {
      var x = doc.createElement("button");
      x.type = "button";
      x.className = "dcc-icon-btn dcc-icon-btn--sm dcc-icon-btn--inherit dcc-snackbar__close";
      x.setAttribute("aria-label", "Cerrar aviso");
      x.appendChild(icono("i-x", ""));
      acciones.appendChild(x);
    }
    if (acciones.childNodes.length) el.appendChild(acciones);
    return el;
  }

  /* Muestra el siguiente de la cola, si no hay uno visible. */
  function siguiente() {
    if (actual || !cola.length) return;
    var aviso = cola.shift();
    actual = aviso;
    var el = aviso.el;
    asegurarRegion().appendChild(el);
    // Un cuadro después, para que la transición parta del estado inicial.
    var mostrar = function () { el.classList.add("is-visible"); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { window.requestAnimationFrame(mostrar); });
    else mostrar();

    // Temporizador pausable: se lleva la cuenta de lo que falta.
    var restante = aviso.duracion;
    var desde = 0;
    var timer = null;
    var pausas = { cursor: false, foco: false, ventana: false };
    function correr() {
      if (!restante || timer || pausas.cursor || pausas.foco || pausas.ventana) return;
      desde = Date.now();
      timer = setTimeout(function () { aviso.cerrar(); }, restante);
    }
    function pausar() {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
      restante = Math.max(restante - (Date.now() - desde), 0) || 1;
    }
    function cambiar(clave, valor) {
      pausas[clave] = valor;
      if (valor) pausar(); else correr();
    }
    el.addEventListener("mouseenter", function () { cambiar("cursor", true); });
    el.addEventListener("mouseleave", function () { cambiar("cursor", false); });
    el.addEventListener("focusin", function () { cambiar("foco", true); });
    el.addEventListener("focusout", function (e) {
      if (!el.contains(e.relatedTarget)) cambiar("foco", false);
    });
    function blur() { cambiar("ventana", true); }
    function focus() { cambiar("ventana", false); }
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    aviso.detener = function () {
      clearTimeout(timer);
      timer = null;
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
    };
    correr();
    // Si ya esperaba otro, el aviso sin duración le cede el lugar.
    if (!aviso.duracion && cola.length) aviso.cerrar();
  }

  function notificar(opciones) {
    var op = opciones || {};
    if (typeof op === "string") op = { mensaje: op };
    var d = parseInt(op.duracion, 10);
    var aviso = {
      el: construir(op),
      duracion: isNaN(d) ? DURACION : Math.max(d, 0),
      cerrado: false
    };

    aviso.cerrar = function () {
      if (aviso.cerrado) return;
      aviso.cerrado = true;
      var i = cola.indexOf(aviso);
      if (i > -1) { cola.splice(i, 1); return; }   // todavía no se mostraba
      if (aviso.detener) aviso.detener();
      var el = aviso.el;
      // Si el foco estaba en el aviso, se devuelve a la página en vez de perderse.
      var tenia = el.contains(doc.activeElement);
      function quitar() {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (actual === aviso) actual = null;
        siguiente();
      }
      el.classList.remove("is-visible");
      if (tenia && aviso.volver && aviso.volver.isConnected) aviso.volver.focus();
      if (sinMovimiento()) quitar();
      else setTimeout(quitar, 230);
      if (typeof op.alCerrar === "function") op.alCerrar();
    };

    var accion = aviso.el.querySelector(".dcc-snackbar__action");
    if (accion) accion.addEventListener("click", function () {
      aviso.cerrar();
      if (op.accion && typeof op.accion.alHacer === "function") op.accion.alHacer();
    });
    var x = aviso.el.querySelector(".dcc-snackbar__close");
    if (x) x.addEventListener("click", aviso.cerrar);

    aviso.volver = doc.activeElement !== doc.body ? doc.activeElement : null;
    cola.push(aviso);
    asegurarRegion();
    if (actual && !actual.duracion) actual.cerrar();
    siguiente();
    return { cerrar: aviso.cerrar };
  }

  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !actual || e.defaultPrevented) return;
    // Con un diálogo abierto, Escape es suyo.
    if (doc.querySelector("dialog[open]")) return;
    actual.cerrar();
  });

  DCCUI.notificar = notificar;

  DCCUI.registrar(function (raiz, cada) {
    // La región existe desde el principio: los lectores de pantalla sólo
    // anuncian cambios en regiones vivas que ya estaban en la página.
    if (raiz === doc && doc.body) asegurarRegion();

    cada(raiz, ".js-notificar", "notificar", function (btn) {
      btn.addEventListener("click", function () {
        var ds = btn.dataset;
        var op = {
          mensaje: ds.mensaje || "",
          tipo: ds.tipo,
          posicion: ds.posicion,
          duracion: ds.duracion
        };
        if (ds.accion) op.accion = {
          texto: ds.accion,
          alHacer: ds.accionMensaje ? function () { notificar({ mensaje: ds.accionMensaje }); } : null
        };
        notificar(op);
      });
    });
  });
})();
