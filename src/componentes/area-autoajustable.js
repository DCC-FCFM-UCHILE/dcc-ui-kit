/* Área de texto que crece (TextareaAutosize de MUI).

   Ajusta el alto de un `textarea.dcc-input.js-autosize` al de su texto, para
   que no aparezca una barra de desplazamiento mientras se escribe ni sobre
   espacio vacío. Límites, en filas de texto:
     data-min-filas="2"   el alto mínimo (por omisión, 1 fila),
     data-max-filas="6"   el máximo; pasado ese alto vuelve la barra.

   El alto se mide poniéndolo un instante en 0 y leyendo `scrollHeight`, que
   entonces es justo el del contenido. Ese instante no se pinta, pero la
   página puede acortarse y mover el scroll; por eso se guarda y se repone.

   Se vuelve a medir al escribir, al cambiar el ancho (un ResizeObserver: el
   texto se reparte en otras líneas) y al reiniciar el formulario. Si el valor
   se cambia por código, que no emite `input`, hay que pedirlo:

       DCCUI.autoajustar(textarea); */
(function () {
  "use strict";

  function px(v) { return parseFloat(v) || 0; }

  function ajustar(el) {
    var cs = window.getComputedStyle(el);
    var linea = px(cs.lineHeight) || px(cs.fontSize) * 1.2;
    var extra = px(cs.paddingTop) + px(cs.paddingBottom);
    var borde = px(cs.borderTopWidth) + px(cs.borderBottomWidth);
    var minFilas = px(el.getAttribute("data-min-filas")) || 1;
    var maxFilas = px(el.getAttribute("data-max-filas")) || Infinity;
    var minimo = minFilas * linea + extra + borde;
    var maximo = maxFilas * linea + extra + borde;

    var x = window.pageXOffset, y = window.pageYOffset;
    el.style.height = "0px";
    var contenido = el.scrollHeight + borde;
    var alto = Math.ceil(Math.min(maximo, Math.max(minimo, contenido)));
    el.style.height = alto + "px";
    // Con el texto pasado del máximo, la barra vuelve para poder recorrerlo.
    el.style.overflowY = contenido > maximo + 1 ? "auto" : "hidden";
    if (window.pageXOffset !== x || window.pageYOffset !== y) window.scrollTo(x, y);
  }

  var observador = window.ResizeObserver ? new ResizeObserver(function (entradas) {
    entradas.forEach(function (e) {
      // Sólo importa el ancho: el alto lo cambia este mismo archivo.
      var ancho = e.contentRect.width;
      if (ancho && ancho !== e.target.__dccAncho) {
        e.target.__dccAncho = ancho;
        ajustar(e.target);
      }
    });
  }) : null;

  DCCUI.autoajustar = ajustar;

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-autosize", "autosize", function (el) {
      if (el.tagName !== "TEXTAREA") return;
      el.addEventListener("input", function () { ajustar(el); });
      if (el.form) el.form.addEventListener("reset", function () { setTimeout(function () { ajustar(el); }, 0); });
      if (observador) observador.observe(el);
      ajustar(el);
    });
  });
})();
