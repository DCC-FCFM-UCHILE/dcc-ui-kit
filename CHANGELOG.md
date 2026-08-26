# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado según [SemVer](https://semver.org/lang/es/).

Para este kit eso significa:

- **patch** — arreglos visuales que no cambian el markup.
- **minor** — componentes o variantes nuevas, retrocompatibles.
- **major** — cambia un nombre de clase, un token, o el markup que una app debe escribir.

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
