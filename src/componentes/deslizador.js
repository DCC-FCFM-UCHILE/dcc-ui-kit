/* Deslizador (Slider de MUI).

   Con un valor, el control es un <input type="range"> nativo y este archivo
   sólo pinta: lleva el relleno de la pista hasta el valor, escribe la etiqueta
   flotante y ubica las marcas. El teclado y el lector de pantalla los pone el
   navegador, así que sin JS el control funciona igual, sólo sin relleno.

   Con dos manillas (`.dcc-slider__thumb`, role="slider") el JS es el control:
   HTML no tiene un range doble. Sigue el patrón de WAI-ARIA para deslizadores
   con varias manillas —flechas, Inicio/Fin, RePág/AvPág— y cada manilla
   limita a la otra: el mínimo de la de arriba es el valor de la de abajo.

   Atributos de la pieza (`.dcc-slider.js-slider`):
     data-min, data-max, data-step  sólo para el rango; el nativo usa los suyos.
     data-sufijo=" °C"              se agrega al valor en la etiqueta y en
                                    aria-valuetext.
     data-marcas="pasos"            dibuja un punto en cada paso (hasta 100).
   Las marcas escritas a mano son `.dcc-slider__mark` con `data-valor`.
   Si hay <input type="hidden"> dentro del rango, el JS les escribe el valor de
   cada manilla, en orden, para que viajen con el formulario.
   Emite `input` mientras se mueve y `change` al soltar, como el nativo. */
(function () {
  "use strict";

  function num(v, def) {
    var n = parseFloat(v);
    return isNaN(n) ? def : n;
  }

  /* Decimales del paso, para que 0,1 + 0,2 no se muestre como 0,30000000000000004. */
  function decimales(paso) {
    var s = String(paso);
    return s.indexOf(".") < 0 ? 0 : s.length - s.indexOf(".") - 1;
  }

  function texto(v, sufijo) {
    return Number(v).toLocaleString("es-CL") + (sufijo || "");
  }

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-slider", "slider", function (el) {
      var vertical = el.classList.contains("dcc-slider--vertical");
      var sufijo = el.getAttribute("data-sufijo") || "";
      var nativo = el.querySelector(".dcc-slider__input");
      var manillas = Array.prototype.slice.call(el.querySelectorAll(".dcc-slider__thumb"));
      var min, max, paso;

      if (nativo) {
        min = num(nativo.min, 0);
        max = num(nativo.max, 100);
        paso = nativo.step === "any" ? 0 : num(nativo.step, 1);
      } else {
        min = num(el.getAttribute("data-min"), 0);
        max = num(el.getAttribute("data-max"), 100);
        paso = num(el.getAttribute("data-step"), 1);
      }
      var rango = max - min || 1;
      var pct = function (v) { return (v - min) / rango * 100; };
      var lado = vertical ? "bottom" : "left";

      // Puntos en cada paso, si se pidieron y no son demasiados.
      if (el.getAttribute("data-marcas") === "pasos" && paso > 0 && rango / paso <= 100) {
        var caja = el.querySelector(".dcc-slider__marks");
        if (!caja) {
          caja = document.createElement("span");
          caja.className = "dcc-slider__marks";
          caja.setAttribute("aria-hidden", "true");
          el.appendChild(caja);
        }
        for (var v = min; v <= max + paso / 2; v += paso) {
          var m = document.createElement("span");
          m.className = "dcc-slider__mark";
          m.setAttribute("data-valor", v.toFixed(decimales(paso)));
          caja.appendChild(m);
        }
      }
      var marcas = Array.prototype.slice.call(el.querySelectorAll(".dcc-slider__mark"));
      marcas.forEach(function (m) { m.style[lado] = pct(num(m.getAttribute("data-valor"), min)) + "%"; });

      function pintar(desde, hasta) {
        el.style.setProperty("--dcc-slider-desde", pct(desde) + "%");
        el.style.setProperty("--dcc-slider-hasta", pct(hasta) + "%");
        marcas.forEach(function (m) {
          var v = num(m.getAttribute("data-valor"), min);
          m.classList.toggle("is-active", v >= desde && v <= hasta);
        });
      }

      /* ---------- Un valor: range nativo ---------- */
      if (nativo) {
        var etiqueta = el.querySelector(".dcc-slider__value");
        var sincronizar = function () {
          var v = num(nativo.value, min);
          pintar(min, v);
          if (etiqueta) etiqueta.textContent = texto(v, sufijo);
          if (sufijo) nativo.setAttribute("aria-valuetext", texto(v, sufijo));
        };
        nativo.addEventListener("input", sincronizar);
        nativo.addEventListener("change", sincronizar);
        // Un reset del formulario cambia el valor sin emitir `input`.
        if (nativo.form) nativo.form.addEventListener("reset", function () { setTimeout(sincronizar, 0); });
        sincronizar();
        return;
      }

      /* ---------- Rango: manillas ARIA ---------- */
      if (!manillas.length) return;
      var ocultos = el.querySelectorAll('input[type="hidden"]');
      var valores = manillas.map(function (t) { return num(t.getAttribute("aria-valuenow"), min); });
      var dec = decimales(paso);

      function ajustar(v) {
        if (paso > 0) v = Math.round((v - min) / paso) * paso + min;
        return +Math.min(max, Math.max(min, v)).toFixed(dec);
      }

      function render() {
        manillas.forEach(function (t, i) {
          var v = valores[i];
          t.style[lado] = pct(v) + "%";
          t.setAttribute("aria-valuenow", String(v));
          t.setAttribute("aria-valuetext", texto(v, sufijo));
          t.setAttribute("aria-valuemin", String(i > 0 ? valores[i - 1] : min));
          t.setAttribute("aria-valuemax", String(i < valores.length - 1 ? valores[i + 1] : max));
          var et = t.querySelector(".dcc-slider__value");
          if (et) et.textContent = texto(v, sufijo);
          if (ocultos[i]) ocultos[i].value = String(v);
        });
        if (valores.length > 1) pintar(valores[0], valores[valores.length - 1]);
        else pintar(min, valores[0]);
      }

      function emitir(tipo) { el.dispatchEvent(new Event(tipo, { bubbles: true })); }

      /* Mueve la manilla i sin pasar a sus vecinas. Devuelve si cambió. */
      function poner(i, v) {
        v = ajustar(v);
        if (i > 0) v = Math.max(v, valores[i - 1]);
        if (i < valores.length - 1) v = Math.min(v, valores[i + 1]);
        if (v === valores[i]) return false;
        valores[i] = v;
        render();
        emitir("input");
        return true;
      }

      function deshabilitado() { return el.getAttribute("aria-disabled") === "true"; }

      // Teclado: el paso, un décimo del recorrido con RePág/AvPág, y los
      // extremos con Inicio/Fin (los extremos que permite la otra manilla).
      manillas.forEach(function (t, i) {
        t.addEventListener("keydown", function (e) {
          if (deshabilitado()) return;
          var p = paso || rango / 100;
          var grande = Math.max(p, rango / 10);
          var v = valores[i];
          switch (e.key) {
            case "ArrowRight": case "ArrowUp": v += p; break;
            case "ArrowLeft": case "ArrowDown": v -= p; break;
            case "PageUp": v += grande; break;
            case "PageDown": v -= grande; break;
            case "Home": v = min; break;
            case "End": v = max; break;
            default: return;
          }
          e.preventDefault();
          if (poner(i, v)) emitir("change");
        });
      });

      // Puntero: un clic en el riel lleva ahí la manilla más cercana, y se
      // puede seguir arrastrando sin soltar.
      function valorEn(e) {
        var r = el.getBoundingClientRect();
        var f = vertical ? (r.bottom - e.clientY) / r.height : (e.clientX - r.left) / r.width;
        return min + Math.min(1, Math.max(0, f)) * rango;
      }
      var activa = -1, movio = false, empate = false;
      function tomar(i) {
        if (activa >= 0) manillas[activa].classList.remove("is-active");
        activa = i;
        manillas[i].classList.add("is-active");
        manillas[i].focus({ preventScroll: true, focusVisible: false });
      }
      el.addEventListener("pointerdown", function (e) {
        if (deshabilitado() || e.button !== 0) return;
        var v = valorEn(e);
        // La manilla más cercana; si empatan, la que puede ir hacia allá.
        var tocada = 0;
        for (var i = 1; i < valores.length; i++) {
          var d = Math.abs(valores[i] - v), dMejor = Math.abs(valores[tocada] - v);
          if (d < dMejor || (d === dMejor && v > valores[i])) tocada = i;
        }
        // Dos manillas en el mismo punto: se decide cuál es con el primer
        // movimiento, o la de arriba quedaría trabada contra la de abajo.
        empate = valores.filter(function (x) { return x === valores[tocada]; }).length > 1;
        tomar(tocada);
        movio = poner(activa, v);
        if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      el.addEventListener("pointermove", function (e) {
        if (activa < 0) return;
        var v = valorEn(e);
        if (empate && ajustar(v) !== valores[activa]) {
          var iguales = [];
          valores.forEach(function (x, i) { if (x === valores[activa]) iguales.push(i); });
          tomar(v < valores[activa] ? iguales[0] : iguales[iguales.length - 1]);
          empate = false;
        }
        if (poner(activa, v)) movio = true;
      });
      function soltar() {
        if (activa < 0) return;
        manillas[activa].classList.remove("is-active");
        activa = -1;
        if (movio) emitir("change");
        movio = false;
      }
      el.addEventListener("pointerup", soltar);
      el.addEventListener("pointercancel", soltar);
      el.addEventListener("lostpointercapture", soltar);

      manillas.forEach(function (t) { if (deshabilitado()) t.setAttribute("tabindex", "-1"); });
      render();
    });
  });
})();
