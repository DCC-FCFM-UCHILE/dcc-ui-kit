/* Tooltip: una etiqueta breve que aparece al pasar el cursor o al enfocar un
   control, como el Tooltip de MUI.

   Dos formas de declararlo:

     <button data-dcc-tooltip="Eliminar" aria-label="Eliminar">…</button>
       El texto va en el atributo y el script crea el globo. Si el texto cambia
       (p. ej. "Copiar" → "Copiado"), basta con cambiar el atributo: se relee
       cada vez que el tooltip se abre.

     <button class="js-tooltip" aria-describedby="tt-1">…</button>
     <span class="dcc-tooltip" role="tooltip" id="tt-1" hidden>…</span>
       El globo ya está en el markup, por si lleva formato. Se asocia por
       aria-describedby (o aria-labelledby).

   Opciones en el disparador: `data-dcc-placement` (top, bottom —por omisión,
   como en MUI—, left o right, con -start o -end) y `data-dcc-arrow` para la
   flecha (en el markup basta con la clase .dcc-tooltip--arrow).

   Accesibilidad (WCAG 1.4.13): se abre con hover y con foco de teclado, se
   cierra con Escape sin mover el foco, y el cursor puede pasar del disparador
   al globo sin que desaparezca. Como en MUI, si el disparador no tiene nombre
   accesible el tooltip pasa a ser su nombre (aria-labelledby); si ya lo tiene
   y dice lo mismo, no se repite; si no, el tooltip queda como descripción.

   El posicionamiento se publica como DCCUI.posicionar(flotante, ancla,
   colocacion, opciones) para que lo usen el popover y cualquier otra pieza
   flotante: elige el lado pedido, se da vuelta al opuesto si no cabe en la
   ventana y corre el globo para que no se salga por los costados.

   API: DCCUI.tooltip.abrir(disparador) y DCCUI.tooltip.cerrar(). */
(function () {
  "use strict";

  var doc = document;
  // Retrasos de MUI: 100 ms antes de abrir, para que no parpadeen tooltips al
  // cruzar la pantalla con el cursor. Al salir se espera un poco más para dar
  // tiempo a llegar al globo.
  var ENTRADA = 100;
  var SALIDA = 120;
  var MARGEN = 8;          // distancia mínima al borde de la ventana
  var SEPARACION = 8;      // entre el disparador y el globo
  var CON_FLECHA = 12;     // separación cuando hay flecha (la flecha mide 6px)

  // El atributo `popover` sube el globo a la capa superior: no lo recortan los
  // `overflow: hidden` ni lo tapan los z-index de la página. Donde no existe,
  // queda como `position: fixed` con un z-index alto.
  var conPopover = typeof HTMLElement !== "undefined" &&
    Object.prototype.hasOwnProperty.call(HTMLElement.prototype, "showPopover");

  function prepararFlotante(el) {
    if (conPopover && !el.hasAttribute("popover")) el.setAttribute("popover", "manual");
  }
  function mostrarFlotante(el) {
    el.hidden = false;
    if (conPopover && el.hasAttribute("popover")) {
      try { if (!el.matches(":popover-open")) el.showPopover(); } catch (e) { /* desconectado */ }
    }
  }
  function ocultarFlotante(el) {
    if (conPopover && el.hasAttribute("popover")) {
      try { if (el.matches(":popover-open")) el.hidePopover(); } catch (e) { /* ya cerrado */ }
    }
    el.hidden = true;
  }

  function acotar(v, min, max) { return Math.max(min, Math.min(v, max)); }

  var OPUESTO = { top: "bottom", bottom: "top", left: "right", right: "left" };

  /* Ubica `flotante` (ya visible, con position: fixed) junto a `ancla`.
     colocacion: "top" | "bottom" | "left" | "right", con "-start" o "-end".
     opciones.separacion: px entre ancla y flotante.
     opciones.variable: propiedad CSS donde se escribe la posición de la flecha,
       medida desde el borde del flotante hasta el centro del ancla.
     Devuelve la colocación final y la deja en data-placement. */
  function posicionar(flotante, ancla, colocacion, opciones) {
    opciones = opciones || {};
    var sep = opciones.separacion == null ? SEPARACION : opciones.separacion;
    var partes = String(colocacion || "bottom").split("-");
    var lado = OPUESTO[partes[0]] ? partes[0] : "bottom";
    var alin = partes[1] === "start" || partes[1] === "end" ? partes[1] : "";

    flotante.style.left = "0px";
    flotante.style.top = "0px";
    var a = ancla.getBoundingClientRect();
    var w = flotante.offsetWidth, h = flotante.offsetHeight;
    var vw = doc.documentElement.clientWidth || window.innerWidth;
    var vh = doc.documentElement.clientHeight || window.innerHeight;

    function cabe(l) {
      if (l === "top") return a.top - sep - h >= MARGEN;
      if (l === "bottom") return a.bottom + sep + h <= vh - MARGEN;
      if (l === "left") return a.left - sep - w >= MARGEN;
      return a.right + sep + w <= vw - MARGEN;
    }
    if (!cabe(lado) && cabe(OPUESTO[lado])) lado = OPUESTO[lado];
    // A los costados no hay dónde ir (pantalla angosta): se pasa arriba o abajo.
    if ((lado === "left" || lado === "right") && !cabe(lado)) {
      lado = cabe("top") || !cabe("bottom") ? "top" : "bottom";
      alin = "";
    }

    var vertical = lado === "top" || lado === "bottom";
    var x, y;
    if (vertical) {
      y = lado === "top" ? a.top - sep - h : a.bottom + sep;
      x = alin === "start" ? a.left : alin === "end" ? a.right - w : a.left + a.width / 2 - w / 2;
      x = acotar(x, MARGEN, vw - MARGEN - w);
    } else {
      x = lado === "left" ? a.left - sep - w : a.right + sep;
      y = alin === "start" ? a.top : alin === "end" ? a.bottom - h : a.top + a.height / 2 - h / 2;
      y = acotar(y, MARGEN, vh - MARGEN - h);
    }
    flotante.style.left = Math.round(x) + "px";
    flotante.style.top = Math.round(y) + "px";

    if (opciones.variable) {
      var centro = vertical ? a.left + a.width / 2 - x : a.top + a.height / 2 - y;
      var largo = vertical ? w : h;
      flotante.style.setProperty(opciones.variable, Math.round(acotar(centro, 12, Math.max(12, largo - 12))) + "px");
    }
    var final = lado + (alin ? "-" + alin : "");
    flotante.setAttribute("data-placement", final);
    return final;
  }

  /* ---------- Tooltip ---------- */
  var contador = 0;
  var abierto = null;   // { disparador, globo }; hay un solo tooltip abierto a la vez
  var temporizador = null;

  function programar(fn, ms) {
    clearTimeout(temporizador);
    temporizador = setTimeout(fn, ms);
  }

  function tieneNombre(el) {
    return !!(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") ||
      (el.textContent || "").trim() || el.getAttribute("alt"));
  }

  function anadirId(el, atributo, id) {
    var ids = (el.getAttribute(atributo) || "").split(/\s+/).filter(Boolean);
    if (ids.indexOf(id) < 0) ids.push(id);
    el.setAttribute(atributo, ids.join(" "));
  }

  function globoDe(el) {
    if (el.__dccTooltip) return el.__dccTooltip;
    var globo;
    if (el.hasAttribute("data-dcc-tooltip")) {
      globo = doc.createElement("span");
      globo.className = "dcc-tooltip" + (el.hasAttribute("data-dcc-arrow") ? " dcc-tooltip--arrow" : "");
      globo.setAttribute("role", "tooltip");
      globo.id = "dcc-tooltip-" + (++contador);
      globo.hidden = true;
      globo.textContent = el.getAttribute("data-dcc-tooltip");
      // Al lado del disparador y no al final del <body>: así hereda el tema
      // (data-dcc-theme) del contenedor donde vive el disparador.
      el.insertAdjacentElement("afterend", globo);
      var texto = globo.textContent.trim();
      if (!tieneNombre(el)) anadirId(el, "aria-labelledby", globo.id);
      else if ((el.getAttribute("aria-label") || "").trim() !== texto) anadirId(el, "aria-describedby", globo.id);
    } else {
      var ids = ((el.getAttribute("aria-describedby") || "") + " " + (el.getAttribute("aria-labelledby") || ""))
        .split(/\s+/).filter(Boolean);
      for (var i = 0; i < ids.length && !globo; i++) {
        var c = doc.getElementById(ids[i]);
        if (c && c.getAttribute("role") === "tooltip") globo = c;
      }
      if (!globo) return null;
    }
    // Un `title` nativo mostraría un segundo tooltip encima del nuestro.
    if (el.hasAttribute("title")) el.removeAttribute("title");
    prepararFlotante(globo);
    globo.addEventListener("mouseenter", function () { clearTimeout(temporizador); });
    globo.addEventListener("mouseleave", function () { programar(cerrar, SALIDA); });
    el.__dccTooltip = globo;
    return globo;
  }

  function ubicar() {
    if (!abierto) return;
    if (!abierto.disparador.isConnected) { cerrar(); return; }
    var conFlecha = abierto.globo.classList.contains("dcc-tooltip--arrow");
    posicionar(abierto.globo, abierto.disparador, abierto.disparador.getAttribute("data-dcc-placement") || "bottom", {
      separacion: conFlecha ? CON_FLECHA : SEPARACION,
      variable: "--dcc-tooltip-arrow"
    });
  }

  function abrir(el) {
    clearTimeout(temporizador);
    var globo = globoDe(el);
    if (!globo) return;
    if (abierto && abierto.disparador !== el) cerrar();
    if (el.hasAttribute("data-dcc-tooltip")) globo.textContent = el.getAttribute("data-dcc-tooltip");
    if (!globo.textContent.trim()) return;
    abierto = { disparador: el, globo: globo };
    mostrarFlotante(globo);
    ubicar();
  }

  function cerrar() {
    clearTimeout(temporizador);
    if (!abierto) return;
    ocultarFlotante(abierto.globo);
    abierto = null;
  }

  // Se abre con foco de teclado, no con el foco que deja un clic: igual que MUI,
  // que usa :focus-visible para esto.
  function focoVisible(el) {
    try { return el.matches(":focus-visible"); } catch (e) { return true; }
  }

  doc.addEventListener("keydown", function (e) {
    if (abierto && (e.key === "Escape" || e.key === "Esc")) cerrar();
  });
  window.addEventListener("scroll", ubicar, true);
  window.addEventListener("resize", ubicar);

  DCCUI.posicionar = posicionar;
  DCCUI.tooltip = {
    abrir: function (el) { abrir(el); },
    cerrar: function () { cerrar(); }
  };

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, "[data-dcc-tooltip], .js-tooltip", "tooltip", function (el) {
      if (!globoDe(el)) return;
      el.addEventListener("mouseenter", function () {
        if (abierto && abierto.disparador === el) clearTimeout(temporizador);
        else programar(function () { abrir(el); }, ENTRADA);
      });
      el.addEventListener("mouseleave", function () {
        if (abierto && abierto.disparador === el) programar(cerrar, SALIDA);
        else clearTimeout(temporizador);
      });
      el.addEventListener("focus", function () { if (focoVisible(el)) abrir(el); });
      el.addEventListener("blur", function () { if (abierto && abierto.disparador === el) cerrar(); });
      // Un clic es una acción, no una consulta: el tooltip se aparta, como en MUI.
      el.addEventListener("mousedown", function () { if (abierto && abierto.disparador === el) cerrar(); });
    });
  });
})();
