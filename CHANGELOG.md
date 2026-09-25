# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado según [SemVer](https://semver.org/lang/es/).

Para este kit eso significa:

- **patch** — arreglos visuales que no cambian el markup.
- **minor** — componentes o variantes nuevas, retrocompatibles.
- **major** — cambia un nombre de clase, un token, o el markup que una app debe escribir.

## [2.6.0] — 2026-09-25

### Agrega

- **Tema oscuro.** Se activa con `data-dcc-theme="dark"` en `<html>` o en cualquier contenedor, o
  con `data-dcc-theme="auto"` para seguir al sistema. Sin el atributo el kit se queda en claro, así
  que ninguna aplicación cambia de aspecto al actualizar.
  - Una capa de **colores por rol** en `:root` (`--dcc-bg`, `--dcc-surface`, `--dcc-surface-raised`,
    `--dcc-surface-muted`, `--dcc-fg`, `--dcc-fg-strong`, `--dcc-fg-accent`, `--dcc-fg-muted`,
    `--dcc-border`, `--dcc-border-subtle`, `--dcc-accent`, `--dcc-on-accent`, `--dcc-focus` y los
    estados `--dcc-danger`, `--dcc-success`, `--dcc-info`, `--dcc-warning` con sus `-bg` y
    `-strong`). Todos los componentes pasaron a pedir el rol en vez del color de paleta.
  - En claro los roles valen lo mismo que los colores de antes: se comparó el color calculado de
    cada elemento de las 26 páginas antes y después, y sólo cambian el blanco de las superficies
    (`#fcfdfe` → `#fff`) y el texto de las alertas (`gray-700` → `grey-dark`).
  - La nav, el pie, la barra lateral y la navegación inferior son de marca y se quedan oscuras en
    los dos temas.
- **Selector de tema en la documentación**, como el de MUI: Claro, Oscuro o Sistema. La elección
  se guarda en el navegador y se aplica antes de pintar.
- **Adornos en campos y select** (el `InputAdornment` de MUI): `.dcc-adorned` con
  `.dcc-adorned__input` y uno o más `.dcc-adornment` —texto, ícono o botón— antes o después del
  valor. `.dcc-adornment--box` le da fondo propio y separador. El select (`.dcc-combo__button`)
  acepta un adorno al principio. Un clic en el contenedor enfoca el campo.
- **Mostrar u ocultar la contraseña** con `.js-password-toggle`: alterna el tipo del campo y
  `aria-pressed`.
- **Íconos `i-sun`, `i-moon`, `i-eye` e `i-eye-off`.**
- **Sitio de documentación nuevo, en `site/`, que reemplaza al styleguide.** Como el de MUI: una
  portada con todos los componentes agrupados, cada uno con una miniatura viva, y una página por
  componente con sus demos, el HTML de cada demo listo para copiar, navegación lateral e índice de
  la página. Se genera con `npm run build` desde `src/sitio/`, un fragmento por componente, y el
  `--check` del CI lo cubre igual que a `dist/`.
- **Botón con dos ejes, variante y color, como en MUI.**
  - Variantes: `--contained` (por omisión), `--outlined` y la nueva `--text`.
  - Colores: `--primary` (por omisión), y los nuevos `--secondary` (`Grey/Light`, el del Figma),
    `--success` (`Green/Dark`) y `--error` (`Red/Default`), más `--white` para fondos oscuros.
  - Cualquier variante combina con cualquier color: el color sólo fija `--dcc-btn-main` y
    `--dcc-btn-on`.
  - Estado deshabilitado (`disabled` o `aria-disabled="true"`) y foco de teclado visible.
- **`--dcc-shadow-button-hover`**: la sombra del botón con desplazamiento y difuminado ×1,5 y las
  opacidades un tercio más altas. Es el salto de elevación 2 a 4 de MUI dicho con la sombra del kit.
- **Íconos `i-trash` e `i-send`.**

### Cambia

- **Todos los botones se comportan igual bajo el cursor.** Aparece una capa del color de la
  etiqueta al 8% y el botón sube un escalón de sombra (el de texto, que no tiene sombra, sólo gana
  la capa). Al presionar o con foco, la capa sube al 12%. Fondo, borde y etiqueta no cambian, así
  que el contraste en hover es el mismo que en reposo.
- **El hover deja de ser rojo.** Sale el `Red/Default` de la asunción de la sección 0.12. Los links
  pasan a `Grey/Light`, como en el Figma.
- **La transición pasa de 150ms `ease` a 250ms sobre la curva estándar de Material.**
- **Los íconos viven en `src/icons.svg`** y no dentro de la página de documentación.
- **La raíz del repositorio y GitHub Pages abren `site/`.**

### Se mantiene

- **`--primary-grey`, `--primary-white`, `--secondary-grey` y `--secondary-white` siguen
  funcionando**, así que las aplicaciones no tienen que tocar nada. En esos nombres “primario” y
  “secundario” eran la variante, no el color; la página del botón trae la tabla de equivalencias.

### Corrige

- **El build dejaba CSS roto en `dist/`** cuando un comentario con comas precedía a una regla: lo
  partía como si fueran selectores. Ahora separa los comentarios antes de filtrar el andamiaje, y
  `dist/dcc-ui.css` conserva sus comentarios intactos.

### Anota

- `--secondary` da 4,35:1 con etiqueta blanca: es el color del Figma y no llega a 4,5:1. `--success`
  usa `Green/Dark` porque `Green/Default` da 3,25:1. Sección 0.18.

## [2.5.1] — 2026-09-10

### Cambia

- **La sangría de la barra lateral se ajustó a la de Faro**, que era la referencia de la 2.5.0 pero
  se había copiado de más. Medidos los dos rieles en pantalla a 1280px, el ancho era el mismo —240px
  en ambos— y lo que se veía distinto era el relleno: el ítem seleccionado ocupaba 192 de esos 240 y
  quedaba a 24px de cada borde, contra los 223 a 8px de Faro. Ahora la caja de cada bloque se pega
  más al borde a medida que baja: 24px la marca, 16px el botón de acción y el pie, 8px los ítems.
  - **El ítem pasa de 192 a 224px** y deja de llevar ancho fijo: se estira al de la lista.
  - **El relleno del ítem sube de 12 a 20px** por costado, que es lo que deja el texto a 60px del
    borde del riel, igual que en Faro. El subítem acompaña con 52px de sangría en vez de 44.
  - **El eje de los íconos baja de 36 a 28px** y ahí siguen cayendo los tres: el del botón, los de
    la lista y el avatar del pie.
- **`scrollbar-gutter: stable` en la lista.** Reemplaza al ancho fijo de 192px, que estaba para que
  los ítems no se encogieran al aparecer la barra de desplazamiento. Reservar el hueco siempre
  resuelve lo mismo sin clavar el ancho, y permite que el relleno sea parejo a los cuatro lados.
  - **El hueco cuesta ancho.** Medido en Chrome con barras clásicas, reserva 11px y el ítem queda en
    213px: 8px de sangría a la izquierda y 19 a la derecha. Donde el sistema dibuja barras flotantes
    el hueco es 0 y el ítem llega a los 224 parejos. Faro no reserva nada: sus ítems miden 223 y se
    encogen a 213 mientras la lista desborda. Se prefirió el ancho quieto al ancho exacto.

## [2.5.0] — 2026-09-07

### Agrega

- **Logotipo horizontal** (`dcc-logo-dcc-h`, `assets/logo-dcc-horizontal.svg`). El vertical es
  casi cuadrado —160×79— y obligaba a una barra de aplicación de 119px de alto. El horizontal
  mide 240×44 y la deja en 92, con la misma legibilidad.
- **Nombre de la aplicación en la barra lateral** (`dcc-sidebar__app`), con un separador entre el
  logotipo y él. Sin esto la barra se veía igual en las cinco aplicaciones del departamento.
- **Contadores en los ítems** (`dcc-sidebar__count`, y `--alert` para lo que no se ha visto).
- **Grupos desplegables en la barra lateral** (`dcc-sidebar__sub`, `dcc-sidebar__subitem`,
  `js-sidebar-group`). No es el acordeón: ahí sólo uno puede estar abierto y el panel se anima;
  acá cada grupo es independiente y se esconde de verdad, porque un panel a media altura dentro
  de una lista que scrollea deja el resto de los ítems fuera de alcance.
- **Pie del usuario con menú** (`dcc-sidebar__foot`, `__user`, `__avatar`, `__who`, `__gear`).
  Antes el nombre y el avatar eran decorado: no había dónde hacer clic para perfil, notificaciones
  o salir.
- **`dcc-menu--up`**, que despliega el menú hacia arriba. La regla general abre siempre bajo el
  disparador —se decidió así en la 2.4.0 para el avatar de la barra de aplicación—, pero en el pie
  de una barra lateral eso lo manda fuera de la pantalla.
- **`dcc-footer--plano`** (`dcc-footer__linea`, `dcc-footer__sep`). Pie de una sola línea para
  aplicaciones internas, donde el pie completo es más de lo que se necesita. Venía del Portal, que
  se lo había hecho aparte; su propio comentario ya lo llamaba «el pie del kit en su versión
  delgada». Cada aplicación escribe su texto; el componente pone la forma. Bajo 560px cae a un
  renglón por parte y los separadores se esconden: un punto medio suelto al inicio de un renglón
  se lee peor que nada.
- Dos íconos al sprite en uso: el pie del sidebar consume `i-bell` y `i-log-out`, que ya existían.

### Cambia

- **La barra lateral se rehízo entera** (§12c), tomando la disposición de Faro y la forma de
  marcar el seleccionado de Titulación. Todo cuelga de dos verticales: 24px para el borde de las
  cajas —logotipo, botón, relleno del ítem, separadores, bloque de usuario— y 36px para los
  íconos, donde caen tanto el del botón como los de la lista.
  - **El seleccionado se marca con relleno y peso, no con un borde.** El borde de 1px era el mismo
    trazo que el hover, así que no se distinguían. Ahora hover y activo son el mismo blanco a dos
    intensidades —7% y 18%—: uno insinúa lo que el otro confirma.
  - Ítem: 192px de ancho útil en vez de 176, ícono de 20px en vez de 16, 12px entre ícono y texto
    en vez de 20, radio 8 en vez de 4, y 4px de separación entre ítems en vez de 8 —el relleno del
    activo ya separa—.
  - La lista tiene su propio scroll y el logotipo, el botón y el pie no se mueven.
  - El avatar baja de 40 a 32px y se alinea en el eje de los íconos.
- **La barra de aplicación centra el nombre en su eje vertical.** El par logotipo + nombre estaba
  centrado como bloque, lo que dejaba el nombre 8,7px bajo el eje. Ahora manda el nombre y el
  logotipo lo sigue, sin soltar su borde inferior. Título a 30px en vez de 36, y 32px de
  separación en vez de 40.
- **El botón de la barra lateral admite desplegable.** Se le puede colgar un `dcc-menu` para que
  la acción lleve a varios destinos —a un área, a una persona, a uno mismo—. Sigue siendo una
  píldora blanca.

### Corrige

- **La barra de desplazamiento ya no encoge los ítems de la barra lateral.** Al aparecer, el área
  de contenido se angostaba y los ítems se encogían con ella: terminaban 11px antes que el botón,
  con el que están alineados. Ahora llevan ancho fijo y esa barra ocupa el margen derecho de 24px.
  Con `flex: none` se arregla además un problema latente: en una columna flex los hijos se
  aplastan a lo alto cuando sobran, así que con veinte ítems se comprimían en vez de desplazarse.
- **El comprobador del menú miraba la regla equivocada.** `verify.mjs` buscaba `.dcc-menu__list`
  con un patrón sin anclar, así que cualquier selector descendiente que la afinara se comía el
  match. Y tomaba el primer `.js-menu` del documento, que desde esta versión es el del sidebar;
  ahora apunta al ejemplo canónico por id.

### Nota de migración

El markup de la 2.4.0 sigue renderizando: `dcc-sidebar__top`, `__group` y `__bottom` se conservan.
La barra se ve distinta —es el punto de la versión—, pero ninguna página deja de funcionar. Para
las nuevas, la estructura es `__brand` · `__action` · `__nav` · `__foot`, y los grupos se separan
con `__sep` dentro de `__nav`.

## [2.4.0] — 2026-08-27

### Agrega

- **Menú desplegable** (`dcc-menu`). Faltaba, y por eso el Portal SSO tuvo que quedarse con el de
  Bootstrap para el menú de usuario. Abre con clic, Enter o flechas; se recorre con flechas, Home y
  End, saltando las opciones deshabilitadas; cierra con Escape —devolviendo el foco al botón—, con
  Tab, con un clic fuera o al activar una opción, porque son acciones y no un valor que quede
  seleccionado.
  - `dcc-menu--end` lo cuelga del borde derecho, para disparadores en una esquina.
  - `dcc-menu__group` separa bloques de opciones.
  - Se despliega **siempre bajo** el disparador: el avatar tiene que seguir visible con el menú
    abierto.
- Tres íconos de Lucide 0.544.0: `i-archive`, `i-log-out` e `i-chart-column`. El sprite queda en 41.
- `dcc-nav-app__user-name`, para poder ocultar el nombre en pantallas angostas sin tocar el avatar.

### Cambia

- **Las alertas ocupan el ancho de su contenedor.** Eran 400px fijos, lo que las dejaba cortas
  dentro de una columna ancha. Si quieres una más angosta, limítala desde el contenedor.
- **La barra de aplicación cabe en una línea en el teléfono.** Antes envolvía y gastaba dos franjas
  de alto donde el alto es lo escaso: logo a 88px, título a 18px con recorte, y el nombre de la
  persona se oculta dejando su avatar.

### Corrige

- **El color se declara en `.dcc-nav-app`, no sólo en `.dcc-nav-app__user`.** Al colgar el menú en
  la barra, el nombre quedaba en gris oscuro sobre azul —1,38:1— porque `.dcc-menu__trigger`
  declara `color: inherit` y ganaba por orden. Ahora cualquier componente que se cuelgue en la
  barra hereda blanco: 8,01:1.
- El styleguide mostraba los dos menús cerrados, así que la sección parecía vacía. Ahora abre con
  un ejemplo desplegado fijo.

### Notas

- Verificaciones: de 28 a 37.

## [2.3.0] — 2026-08-27

- Los logotipos institucionales dejan de ser marcadores de posición: entran los reales del DCC, la
  FCFM, la Universidad de Chile y el CNA.

> **Ojo con esta versión.** Se etiquetó sin subir `package.json`, así que los archivos publicados en
> `/ui-kit/2.3.0/` se identifican a sí mismos como 2.2.0 —su `SRI.txt` y las cabeceras del CSS—. El
> contenido es correcto; sólo la etiqueta interna quedó atrasada. Se corrige desde 2.4.0. Al
> publicar, el orden importa: primero `package.json`, después `npm run build`, y recién entonces el
> tag.

## [2.2.0] — 2026-08-27

### Agrega

- **El kit publica sus logotipos.** `src/assets/` ya existía pero el build no lo tocaba, así que
  los archivos no llegaban a `dist/` y ninguna aplicación podía usarlos. Ahora se publican en
  `assets/` y quedan disponibles por URL, igual que el CSS:

      https://cdn.dcc.uchile.cl/ui-kit/2.2.0/assets/logo-dcc.svg

  Para agregar uno nuevo basta dejarlo en `src/assets/` y reconstruir. Van como salidas del build,
  no copiados aparte, así que `npm run check:dist` también los cubre: editar `dist/assets/` a mano
  hace fallar el CI.
- Export `@dcc/ui/assets/*` para quien lo consuma como paquete.

### Notas

- Los logotipos del DCC, la FCFM, la Universidad de Chile y el CNA **no** están cubiertos por la
  licencia MIT del kit: son marcas institucionales.
- Los cuatro logotipos que vienen hoy siguen siendo **marcadores de posición**; falta reemplazarlos
  por los reales.

## [2.1.0] — 2026-08-26

### Agrega

- Dos íconos de Lucide 0.544.0: `i-flask-conical` —ambiente de pruebas— y `i-monitor` —entorno
  local—. Con eso el sprite queda en 38.

### Corrige

- **La descripción de la tarjeta comprimida es de una línea**, con puntos suspensivos si no
  alcanza. Antes crecía con el texto y descuadraba el alto de las tarjetas de una misma fila; la
  tarjeta se llama comprimida justamente porque su alto no debería depender del largo del texto.
- **La portada de la propuesta B va centrada** respecto del cuerpo. Con `align-items: flex-start`
  quedaba pegada arriba y dejaba un hueco visiblemente mayor abajo: 17px arriba contra 36 abajo.

## [2.0.0] — 2026-08-26

El kit dejó de pisarle los estilos a la aplicación que lo consume.

### Cambia (incompatible)

- **Los resets de elemento ya no son globales.** `p`, `ul`, `hr`, `a`, `button`, `table`, `img` y
  `svg` sólo se resetean dentro de los componentes del kit. Antes alcanzaban a toda la página: al
  integrarlo en una app con Bootstrap le cambiaban la tipografía, el color de los enlaces, las
  viñetas y los márgenes.
- **La tipografía y el fondo del kit son opt-in.** Antes vivían en `body`. Ahora hay que poner la
  clase `dcc-root` en el `<body>` —o en un contenedor— para activarlos. Una app que sólo quiere
  componentes sueltos no la pone y el kit no le toca nada.

**Qué hay que hacer al actualizar desde 1.x:** si tu página se apoyaba en la tipografía o el fondo
del kit, agrega `class="dcc-root"` al `<body>`. Si no, no hay nada que cambiar: los componentes se
ven igual y dejan de contaminar el resto.

### Notas

- El reset acotado usa `[class*="dcc-"] :where(elemento)`, que deja la especificidad en (0,1,0):
  le gana a los resets de elemento de la app —(0,0,1)— y pierde con las reglas de componente del
  propio kit, que se declaran después.
- Verificado midiendo 1053 elementos del styleguide por 17 propiedades antes y después: **cero
  diferencias**. Y en una página con Bootstrap y el kit cargado al final, cero fugas.

## [1.1.0] — 2026-08-26

El kit ahora publica su JavaScript. Antes había que copiarlo a mano desde el styleguide a cada
aplicación, y las copias derivaban entre sí.

### Agrega

- `dcc-ui.bundle.min.js` — íconos y comportamiento en un archivo. Con el CSS, la instalación son
  dos etiquetas y no hay que llamar a ninguna función.
- `dcc-behaviors.min.js` — sólo el comportamiento, para apps que sirven el kit desde su mismo
  origen y referencian el sprite directo.
- Ambos también en versión legible, y todos cubiertos por `SRI.txt`.
- `DCCUI.init(elemento)` para enlazar HTML que aparece después de cargar la página. Es idempotente.
- Enganche automático a `htmx:afterSwap`: con htmx no hay que escribir nada.

### Cambia

- El comportamiento vive en `src/behaviors.js`, no embebido en `src/styleguide.html`. El styleguide
  carga ese mismo archivo, así que documentación y kit no pueden divergir.
- Las verificaciones pasan de 18 a 28. Las nuevas cubren la API pública, la re-inicialización, el
  DOM inyectado, el bundle publicado y que las URLs de la documentación apunten a la versión real.

### Corrige

- La guía de consumo documentaba una versión 1.0.1 que nunca existió, listaba un `app.html` que el
  build no genera y apuntaba al script de `index.html`.
- El conteo de tokens decía 54; son 51.
- `package-lock.json` estaba en `.gitignore`, lo que dejaba el CI sin poder correr `npm ci`.

## [1.0.0] — 2026-08-25

Primera versión publicable.

### Incluye

- 23 familias de componentes traducidas de Figma o diseñadas sobre sus tokens.
- 51 tokens de diseño como variables CSS.
- 36 íconos de Lucide 0.544.0 en sprite, con inyector para consumo entre orígenes.
- Fuentes Inter y Poppins auto-hospedadas.
- Styleguide navegable en `src/styleguide.html`.

### Notas de la primera versión

- **Todo va prefijado** (`dcc-` en clases, `--dcc-` en variables). 26 de las clases originales
  colisionaban con Bootstrap.
- **Lucide pineado en 0.544.0**: la 1.33 rediseñó el ícono `smile`.
- Los logotipos de U. de Chile, FCFM y CNA son **placeholders**: no se pudieron exportar desde
  Figma. Ver `docs/decisiones-de-diseno.md`, sección 1.1.
- La tipografía original de Figma es Adelle Sans, de licencia comercial; el kit usa Inter.
