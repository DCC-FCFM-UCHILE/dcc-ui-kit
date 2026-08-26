# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado según [SemVer](https://semver.org/lang/es/).

Para este kit eso significa:

- **patch** — arreglos visuales que no cambian el markup.
- **minor** — componentes o variantes nuevas, retrocompatibles.
- **major** — cambia un nombre de clase, un token, o el markup que una app debe escribir.

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
