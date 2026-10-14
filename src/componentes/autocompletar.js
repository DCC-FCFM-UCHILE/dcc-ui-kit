/* Autocompletar: un campo con una lista que se filtra mientras se escribe.

   Sigue el patrón combobox de ARIA 1.2 con lista emergente: el foco se queda
   siempre en el <input role="combobox"> y la opción activa se anuncia con
   aria-activedescendant, así que se puede seguir escribiendo mientras se
   recorre la lista.

   Las opciones salen del propio HTML —los <li role="option"> de la lista—, de
   modo que la página funciona servida por el servidor y sin una sola línea de
   configuración. Opciones en el contenedor `.js-autocomplete`:

     data-multiple          varios valores, cada uno como chip dentro del campo
     data-libre             acepta texto que no está en la lista (freeSolo de MUI)
     data-name="cursos"     crea <input type="hidden" name="cursos"> con los
                            valores elegidos, para enviarlos en un formulario
     data-sin-resultados    el texto del aviso cuando nada coincide

   Cada opción usa su `data-value` como valor, o su texto si no lo tiene. Una
   opción que ya viene con aria-selected="true" queda elegida al cargar.

   Teclado: flechas para recorrer (abren la lista si está cerrada), Enter para
   elegir, Escape para cerrar, Retroceso con el campo vacío para quitar el
   último chip, flecha izquierda al principio del texto para pasar a los
   chips —y ahí Retroceso o Suprimir quitan el chip con foco—.

   Tras cada cambio de valor emite `dcc-autocompletar` en el contenedor, con
   `detail.valor`: un texto (o null) en el simple y una lista en el múltiple. */
(function () {
  "use strict";

  var uid = 0;
  var slice = function (xs) { return Array.prototype.slice.call(xs); };

  /* Sin tildes y en minúsculas: "practica" encuentra "Práctica profesional".
     Al quitar las marcas de la forma descompuesta, cada letra con tilde vuelve
     a medir un carácter, así que los índices sirven para resaltar el original. */
  function normalizar(s) {
    s = s.normalize ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s;
    return s.toLowerCase();
  }
  function escapar(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  var CRUZ = '<svg class="dcc-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>';

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-autocomplete", "autocomplete", function (root) {
      var input = root.querySelector(".dcc-autocomplete__input");
      var control = root.querySelector(".dcc-autocomplete__control");
      var list = root.querySelector(".dcc-combo__list");
      var limpiar = root.querySelector(".dcc-autocomplete__clear");
      var flecha = root.querySelector(".dcc-autocomplete__toggle");
      if (!input || !control || !list) return;

      var multiple = root.hasAttribute("data-multiple");
      var libre = root.hasAttribute("data-libre");
      var nombre = root.getAttribute("data-name");
      var base = list.id || ("dcc-ac-" + (++uid));
      list.id = base;
      list.hidden = true;
      input.setAttribute("aria-controls", base);
      input.setAttribute("aria-expanded", "false");
      if (!input.hasAttribute("aria-autocomplete")) input.setAttribute("aria-autocomplete", "list");
      if (multiple) list.setAttribute("aria-multiselectable", "true");

      /* ---------- Opciones ---------- */
      // El texto de cada opción pasa a un <span> propio, para poder resaltar lo
      // escrito sin tocar el check que la acompaña.
      var opciones = slice(list.querySelectorAll('[role="option"]')).map(function (li, i) {
        if (!li.id) li.id = base + "-o" + i;
        if (!li.hasAttribute("aria-selected")) li.setAttribute("aria-selected", "false");
        var etiqueta = li.textContent.replace(/\s+/g, " ").trim();
        var span = document.createElement("span");
        var textos = slice(li.childNodes).filter(function (n) { return n.nodeType === 3; });
        li.insertBefore(span, textos.filter(function (n) { return n.nodeValue.trim(); })[0] || li.firstChild);
        textos.forEach(function (n) { li.removeChild(n); });
        span.textContent = etiqueta;
        return {
          el: li, span: span, etiqueta: etiqueta, clave: normalizar(etiqueta),
          valor: li.getAttribute("data-value") || etiqueta
        };
      });
      var grupos = slice(list.querySelectorAll(".dcc-autocomplete__group"));

      var vacio = root.querySelector(".dcc-autocomplete__empty");
      if (!vacio) {
        vacio = document.createElement("div");
        vacio.className = "dcc-autocomplete__empty";
        vacio.textContent = root.getAttribute("data-sin-resultados") || "Sin resultados";
        root.appendChild(vacio);
      }
      vacio.hidden = true;
      var estado = document.createElement("div");
      estado.className = "dcc-autocomplete__status";
      estado.setAttribute("role", "status");
      root.appendChild(estado);

      /* ---------- Estado ---------- */
      var seleccion = [];     // [{ etiqueta, valor, opcion }]
      var visibles = [];      // opciones que pasan el filtro, en orden
      var activa = -1;        // índice en `visibles`
      var abierto = false;
      var escrito = false;    // si el filtro sigue lo escrito o muestra todo

      opciones.forEach(function (o) {
        if (o.el.getAttribute("aria-selected") === "true" && (multiple || !seleccion.length))
          seleccion.push({ etiqueta: o.etiqueta, valor: o.valor, opcion: o });
      });
      if (!multiple && seleccion.length && !input.value) input.value = seleccion[0].etiqueta;

      function deshabilitado() { return input.disabled; }
      function elegida(o) {
        return seleccion.some(function (s) { return s.opcion === o; });
      }
      function anunciar(texto) { estado.textContent = texto; }

      /* ---------- Lista ---------- */
      function resaltar(o, q) {
        var i = q && o.clave.length === o.etiqueta.length ? o.clave.indexOf(q) : -1;
        if (i < 0) { o.span.textContent = o.etiqueta; return; }
        o.span.innerHTML = escapar(o.etiqueta.slice(0, i)) +
          '<span class="dcc-autocomplete__match">' + escapar(o.etiqueta.slice(i, i + q.length)) + "</span>" +
          escapar(o.etiqueta.slice(i + q.length));
      }

      function filtrar() {
        var q = escrito ? normalizar(input.value.trim()) : "";
        visibles = [];
        opciones.forEach(function (o) {
          var pasa = !q || o.clave.indexOf(q) !== -1;
          o.el.hidden = !pasa;
          if (pasa) visibles.push(o);
          resaltar(o, pasa ? q : "");
        });
        grupos.forEach(function (g) {
          g.hidden = !g.querySelector('[role="option"]:not([hidden])');
        });
      }

      function mostrar() {
        var hay = visibles.length > 0;
        list.hidden = !(abierto && hay);
        // En texto libre no hay aviso: escribir algo que no está es válido.
        vacio.hidden = !(abierto && !hay && !libre);
        input.setAttribute("aria-expanded", String(!list.hidden));
        root.classList.toggle("is-open", abierto && (hay || !libre));
      }

      function marcar(i) {
        activa = i;
        opciones.forEach(function (o) { o.el.classList.remove("is-active"); });
        var o = visibles[i];
        if (!o) { input.removeAttribute("aria-activedescendant"); return; }
        o.el.classList.add("is-active");
        input.setAttribute("aria-activedescendant", o.el.id);
        o.el.scrollIntoView({ block: "nearest" });
      }

      function abrir() {
        if (deshabilitado()) return;
        abierto = true;
        filtrar();
        mostrar();
      }

      function cerrar() {
        abierto = false;
        escrito = false;
        marcar(-1);
        mostrar();
      }

      // Al abrir con el teclado, la activa es la elegida —o la primera—, como
      // en el select.
      function activaInicial(haciaArriba) {
        for (var i = 0; i < visibles.length; i++) if (elegida(visibles[i])) return i;
        return haciaArriba ? visibles.length - 1 : 0;
      }

      function mover(paso) {
        var n = visibles.length;
        if (!n) return;
        var i = activa;
        for (var k = 0; k < n; k++) {
          i = i < 0 ? (paso > 0 ? 0 : n - 1) : (i + paso + n) % n;
          if (visibles[i].el.getAttribute("aria-disabled") !== "true") { marcar(i); return; }
        }
      }

      /* ---------- Valor ---------- */
      function chip(s, i) {
        var c = document.createElement("span");
        c.className = "dcc-chip dcc-chip--sm";
        c.setAttribute("data-indice", String(i));
        c.innerHTML = '<span class="dcc-chip__label"></span>' +
          '<button class="dcc-chip__delete" type="button" tabindex="-1">' + CRUZ + "</button>";
        c.firstChild.textContent = s.etiqueta;
        var b = c.lastChild;
        b.setAttribute("aria-label", "Quitar " + s.etiqueta);
        b.disabled = deshabilitado();
        return c;
      }

      function pintar() {
        opciones.forEach(function (o) { o.el.setAttribute("aria-selected", String(elegida(o))); });
        if (multiple) {
          slice(control.querySelectorAll(".dcc-chip")).forEach(function (c) { c.remove(); });
          seleccion.forEach(function (s, i) { control.insertBefore(chip(s, i), input); });
        }
        if (nombre) {
          slice(root.querySelectorAll("input[data-dcc-autocompletar]")).forEach(function (h) { h.remove(); });
          var valores = seleccion.length ? seleccion : (multiple ? [] : [{ valor: "" }]);
          valores.forEach(function (s) {
            var h = document.createElement("input");
            h.type = "hidden";
            h.name = nombre;
            h.value = s.valor;
            h.setAttribute("data-dcc-autocompletar", "");
            root.appendChild(h);
          });
        }
        actualizarLimpiar();
      }

      function actualizarLimpiar() {
        if (limpiar) limpiar.hidden = deshabilitado() || !(seleccion.length || input.value);
      }

      function emitir() {
        var valor = multiple
          ? seleccion.map(function (s) { return s.valor; })
          : (seleccion[0] ? seleccion[0].valor : null);
        root.dispatchEvent(new CustomEvent("dcc-autocompletar", { bubbles: true, detail: { valor: valor } }));
      }

      function elegir(o) {
        if (!o || o.el.getAttribute("aria-disabled") === "true") return;
        if (!multiple) {
          seleccion = [{ etiqueta: o.etiqueta, valor: o.valor, opcion: o }];
          input.value = o.etiqueta;
          cerrar();
          pintar();
          emitir();
          return;
        }
        // En el múltiple la lista queda abierta: se eligen varios seguidos, y
        // volver a elegir uno lo quita, como en una lista de casillas.
        var ya = elegida(o);
        if (ya) seleccion = seleccion.filter(function (s) { return s.opcion !== o; });
        else seleccion.push({ etiqueta: o.etiqueta, valor: o.valor, opcion: o });
        input.value = "";
        escrito = false;
        filtrar();
        mostrar();
        marcar(visibles.indexOf(o));
        pintar();
        anunciar(o.etiqueta + (ya ? " quitado" : " agregado"));
        emitir();
      }

      // Texto libre: si coincide con una opción, se elige esa; si no, entra tal
      // cual como valor.
      function aceptarTexto(texto) {
        var clave = normalizar(texto);
        var igual = opciones.filter(function (o) { return o.clave === clave; })[0];
        if (igual) { if (!multiple || !elegida(igual)) elegir(igual); else { input.value = ""; pintar(); } return; }
        if (!multiple) {
          seleccion = [{ etiqueta: texto, valor: texto, opcion: null }];
          input.value = texto;
          cerrar();
          pintar();
          emitir();
          return;
        }
        var repetido = seleccion.some(function (s) { return normalizar(s.etiqueta) === clave; });
        if (!repetido) seleccion.push({ etiqueta: texto, valor: texto, opcion: null });
        input.value = "";
        escrito = false;
        filtrar();
        mostrar();
        pintar();
        if (!repetido) { anunciar(texto + " agregado"); emitir(); }
      }

      function quitar(i, enfocar) {
        var s = seleccion[i];
        if (!s || deshabilitado()) return;
        seleccion.splice(i, 1);
        // El foco pasa antes al campo: si se quedara en la cruz, al rehacer los
        // chips desaparecería con ella y el navegador lo mandaría al <body>.
        if (enfocar) input.focus();
        pintar();
        anunciar(s.etiqueta + " quitado");
        emitir();
        if (enfocar) {
          var botones = control.querySelectorAll(".dcc-chip__delete");
          (botones[Math.min(i, botones.length - 1)] || input).focus();
        }
      }

      function borrarTodo() {
        seleccion = [];
        input.value = "";
        escrito = false;
        pintar();
        emitir();
        if (abierto) { filtrar(); mostrar(); marcar(-1); }
      }

      /* ---------- Eventos del campo ---------- */
      input.addEventListener("input", function () {
        escrito = true;
        // En el simple, vaciar el texto es quitar el valor.
        if (!multiple && !input.value && seleccion.length) { seleccion = []; pintar(); emitir(); }
        abrir();
        marcar(-1);
        actualizarLimpiar();
        anunciar(visibles.length
          ? visibles.length + (visibles.length === 1 ? " resultado" : " resultados")
          : (libre ? "" : vacio.textContent));
      });

      input.addEventListener("click", function () { if (!abierto) abrir(); });

      input.addEventListener("keydown", function (e) {
        var k = e.key;
        if (k === "ArrowDown" || k === "ArrowUp") {
          e.preventDefault();
          if (!abierto) { abrir(); marcar(visibles.length ? activaInicial(k === "ArrowUp") : -1); return; }
          mover(k === "ArrowDown" ? 1 : -1);
        } else if (k === "Enter") {
          if (abierto && visibles[activa]) { e.preventDefault(); elegir(visibles[activa]); }
          else if (libre && input.value.trim()) { e.preventDefault(); aceptarTexto(input.value.trim()); }
          else if (abierto) e.preventDefault();
        } else if (k === "Escape") {
          if (abierto) { e.preventDefault(); cerrar(); }
        } else if (k === "Backspace") {
          if (multiple && !input.value && seleccion.length) quitar(seleccion.length - 1, false);
        } else if (k === "ArrowLeft") {
          if (multiple && seleccion.length && input.selectionStart === 0 && input.selectionEnd === 0) {
            e.preventDefault();
            cerrar();
            var bs = control.querySelectorAll(".dcc-chip__delete");
            bs[bs.length - 1].focus();
          }
        }
      });

      /* ---------- Chips (múltiple) ---------- */
      function indiceDe(boton) {
        return parseInt(boton.closest(".dcc-chip").getAttribute("data-indice"), 10);
      }
      control.addEventListener("click", function (e) {
        var b = e.target.closest(".dcc-chip__delete");
        if (b && control.contains(b)) { quitar(indiceDe(b), false); input.focus(); }
      });
      control.addEventListener("keydown", function (e) {
        var b = e.target.closest(".dcc-chip__delete");
        if (!b) return;
        var bs = slice(control.querySelectorAll(".dcc-chip__delete"));
        var i = bs.indexOf(b);
        if (e.key === "ArrowLeft") { e.preventDefault(); (bs[i - 1] || b).focus(); }
        else if (e.key === "ArrowRight") { e.preventDefault(); (bs[i + 1] || input).focus(); }
        else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); quitar(indiceDe(b), true); }
        else if (e.key === "Escape") { e.preventDefault(); input.focus(); }
      });

      // Un clic en la caja —en el borde, entre los chips o sobre su texto—
      // lleva el foco al campo, como si la caja entera fuera el input.
      control.addEventListener("mousedown", function (e) {
        // La cruz de un chip tampoco se lleva el foco: se quita el chip y el
        // foco sigue en el campo.
        if (e.target.closest(".dcc-chip__delete")) { e.preventDefault(); return; }
        if (e.target === input || e.target.closest("button") || deshabilitado()) return;
        e.preventDefault();
        input.focus();
        if (!abierto) abrir();
      });

      /* ---------- Botones ---------- */
      // mousedown sin acción por omisión: el foco no se va del campo.
      [limpiar, flecha].forEach(function (b) {
        if (!b) return;
        b.setAttribute("tabindex", "-1");
        b.disabled = deshabilitado();
        b.addEventListener("mousedown", function (e) { e.preventDefault(); });
      });
      if (limpiar) limpiar.addEventListener("click", function () { borrarTodo(); input.focus(); });
      if (flecha) flecha.addEventListener("click", function () {
        if (abierto) { cerrar(); return; }
        input.focus();
        escrito = false;
        abrir();
      });

      /* ---------- Lista con el mouse ---------- */
      list.addEventListener("mousedown", function (e) { e.preventDefault(); });
      list.addEventListener("click", function (e) {
        var li = e.target.closest('[role="option"]');
        if (li) elegir(opciones.filter(function (o) { return o.el === li; })[0]);
      });
      list.addEventListener("mousemove", function (e) {
        var li = e.target.closest('[role="option"]');
        if (!li || li.classList.contains("is-active")) return;
        for (var i = 0; i < visibles.length; i++) if (visibles[i].el === li) { marcar(i); return; }
      });

      /* ---------- Salida ---------- */
      // Al irse el foco, el texto se concilia con el valor: en el simple sin
      // texto libre vuelve a la etiqueta elegida —lo escrito a medias no es un
      // valor—; con texto libre, lo escrito pasa a ser el valor.
      root.addEventListener("focusout", function (e) {
        if (e.relatedTarget && root.contains(e.relatedTarget)) return;
        cerrar();
        var texto = input.value.trim();
        if (!multiple) {
          var actual = seleccion[0] ? seleccion[0].etiqueta : "";
          if (texto === actual) return;
          if (libre) { if (texto) aceptarTexto(texto); else borrarTodo(); }
          else input.value = actual;
          pintar();
        } else if (!libre) {
          input.value = "";
          actualizarLimpiar();
        }
      });
      document.addEventListener("mousedown", function (e) {
        if (abierto && !root.contains(e.target)) cerrar();
      });

      filtrar();
      pintar();
    });
  });
})();
