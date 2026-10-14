/* Indicador (Badge de MUI): el contador o punto que se monta en la esquina de
   un ícono, un botón o un avatar.

   El CSS basta si la aplicación ya escribe el número y el nombre accesible en
   el servidor. Este script sólo hace falta cuando el valor cambia en el
   navegador, o para no repetir en cada plantilla la regla del máximo ("99+")
   y la de ocultar el cero:

     <span class="dcc-indicator js-indicator" data-valor="4" data-max="99"
           data-etiqueta="Notificaciones|Notificaciones, 1 nueva|Notificaciones, {n} nuevas">
       <button …>…</button>
       <span class="dcc-indicator__badge" aria-hidden="true">4</span>
     </span>

   data-valor        el número.
   data-max          el tope; sobre él se muestra "99+" (por omisión 99, como MUI).
   data-mostrar-cero con 0 el indicador se oculta salvo que esté este atributo
                     (showZero de MUI).
   data-etiqueta     el nombre accesible del control (o del ícono con role="img"),
                     con {n} donde va el número.
                     Una sola forma, o tres separadas por "|": cero|uno|varios.
                     Pasado el tope, {n} se lee "más de 99".

   El número visible lleva aria-hidden: quien usa lector de pantalla lo recibe
   en el nombre del control ("Notificaciones, 4 nuevas"), que es lo que se
   anuncia al llegar a él.

   API: DCCUI.indicador.fijar(envoltorio, n) cambia el valor y lo vuelve a
   dibujar. */
(function () {
  "use strict";

  function dibujar(env) {
    var badge = env.querySelector(".dcc-indicator__badge");
    if (!badge || !env.hasAttribute("data-valor")) return;
    var n = parseInt(env.getAttribute("data-valor"), 10) || 0;
    var max = parseInt(env.getAttribute("data-max"), 10);
    if (!(max > 0)) max = 99;
    var punto = env.classList.contains("dcc-indicator--dot");
    var excede = n > max;

    badge.textContent = punto ? "" : (excede ? max + "+" : String(n));
    var visible = n !== 0 || env.hasAttribute("data-mostrar-cero");
    badge.classList.toggle("is-invisible", !visible);

    var plantilla = env.getAttribute("data-etiqueta");
    var control = env.querySelector("button, a[href], [role='button'], [tabindex], [role='img']");
    if (plantilla && control) {
      var formas = plantilla.split("|");
      var forma = formas.length === 3 ? formas[n === 0 ? 0 : n === 1 ? 1 : 2] : formas[0];
      control.setAttribute("aria-label", forma.replace("{n}", excede ? "más de " + max : String(n)).trim());
    }
  }

  DCCUI.indicador = {
    fijar: function (env, n) {
      env.setAttribute("data-valor", String(n));
      dibujar(env);
    }
  };

  DCCUI.registrar(function (raiz, cada) {
    cada(raiz, ".js-indicator", "indicador", dibujar);
    // Botones que suman o restan al indicador cuyo id nombran:
    // <button data-dcc-indicador="id" data-paso="-1">. Así la demo no necesita
    // JavaScript en línea, y una app puede usar lo mismo para un contador.
    cada(raiz, "[data-dcc-indicador]", "indicador-paso", function (boton) {
      boton.addEventListener("click", function () {
        var env = document.getElementById(boton.getAttribute("data-dcc-indicador"));
        if (!env) return;
        var paso = parseInt(boton.getAttribute("data-paso"), 10) || 1;
        DCCUI.indicador.fijar(env, Math.max(0, (parseInt(env.getAttribute("data-valor"), 10) || 0) + paso));
      });
    });
  });
})();
