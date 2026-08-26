# DCC UI Kit

Sistema de diseño del **Departamento de Ciencias de la Computación** de la Universidad de Chile.

CSS sin dependencias ni framework: clases planas sobre variables. Funciona igual en React, Vue y
HTML plano (monolitos Django), porque no hay build de por medio para consumirlo.

[**Ver el styleguide**](https://dcc-fcfm-uchile.github.io/dcc-ui-kit/src/styleguide.html) ·
[Guía de consumo](dist/README.md) ·
[Decisiones de diseño](docs/decisiones-de-diseno.md)

---

## Uso rápido

```html
<link rel="stylesheet" href="https://cdn.dcc.uchile.cl/ui-kit/1.0.0/dcc-ui.min.css">
<script src="https://cdn.dcc.uchile.cl/ui-kit/1.0.0/dcc-icons.js" defer></script>

<button class="dcc-btn dcc-btn--md dcc-btn--primary-grey">
  Guardar <svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-check"/></svg>
</button>
```

O como paquete:

```bash
npm i github:DCC-FCFM-UCHILE/dcc-ui-kit#v1.0.0
```

La [guía de consumo](dist/README.md) cubre React, Vue, Django y las cabeceras que debe servir el
servidor.

---

## Qué incluye

**23 familias de componentes.** Color, tipografía, botones, badges, controles de selección, alerts,
tablas (con orden), navegación institucional y de aplicación, sidebar, footer, inputs, switch,
avatares, listas, acordeón, breadcrumb, tabs, paginación, stepper, bottom navigation, calendario con
date picker, tarjeta de programa y tarjeta comprimida.

**36 íconos** de [Lucide](https://lucide.dev) 0.544.0, en sprite.

**54 tokens** de diseño como variables CSS.

Todo con teclado y ARIA donde corresponde, y respetando `prefers-reduced-motion`.

---

## Estructura

```
src/
  styleguide.html     documentación viva: cada componente con sus variantes
  styles.css          la fuente de verdad del CSS
  assets/             logotipos y placeholders
dist/                 lo que se publica (generado, versionado y verificado en CI)
scripts/
  build.mjs           genera dist/ desde src/
  verify.mjs          18 verificaciones, incluidas las de comportamiento
docs/
  decisiones-de-diseno.md   por qué cada cosa es como es
```

---

## Desarrollo

```bash
npm install
npm start          # sirve el repo; abre /src/styleguide.html
npm run build      # regenera dist/
npm test           # verifica que dist/ esté sincronizado y que nada se rompió
```

El styleguide es el entorno de trabajo: se edita `src/styles.css`, se mira el resultado en
`src/styleguide.html` y se corre `npm run build` antes de commitear.

---

## Dos convenciones que no son negociables

**Todo va prefijado.** Clases con `dcc-`, variables con `--dcc-`. No es cosmético: 26 de las 101
clases originales chocaban con Bootstrap —`btn`, `card`, `badge`, `alert`, `table`, `input`— y el CSS
que cargue segundo gana. Con el prefijo, el kit convive con lo que la app ya tenga.

Se dejaron **sin** prefijo dos familias, a propósito:

- `is-*` — estado (`is-open`, `is-dragging`). Siempre bajo un padre prefijado.
- `js-*` — ganchos de JavaScript, sin estilos. Así nadie confunde un selector de comportamiento con
  uno de presentación.

**Lucide va pineado en 0.544.0.** La versión 1.33 rediseñó el ícono `smile`, y eso hizo que los
íconos del kit dejaran de coincidir con Figma. Si actualizas, revisa ícono por ícono.

---

## Origen del diseño

Traducido de dos archivos de Figma:

- [UI-KIT-DCC](https://www.figma.com/design/Zlsslv2Q26TFqKxuVOFE0B/UI-KIT-DCC) — la base
- [Educación Continua](https://www.figma.com/design/XRlMGrAb847dxcKC3s4kw5/Educaci%C3%B3n-Continua) —
  la tarjeta de programa

Figma es la fuente de verdad del diseño; este repositorio, la del código. Cuando difieren,
[`docs/decisiones-de-diseno.md`](docs/decisiones-de-diseno.md) explica por qué — incluyendo un par de
discrepancias del propio archivo y varios componentes que no existen en Figma y se diseñaron acá.

---

## Licencias

El código de este repositorio va bajo [MIT](LICENSE).

De terceros, con licencia propia:

| Recurso | Licencia |
|---|---|
| Íconos [Lucide](https://lucide.dev) 0.544.0 | ISC |
| [Inter](https://rsms.me/inter/) | SIL Open Font License 1.1 |
| [Poppins](https://fonts.google.com/specimen/Poppins) | SIL Open Font License 1.1 |

Los logotipos del DCC, la FCFM y la Universidad de Chile **no** están cubiertos por la licencia MIT:
son marcas institucionales y su uso se rige por las normas gráficas de la Universidad.
