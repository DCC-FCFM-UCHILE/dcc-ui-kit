# DCC UI Kit

Sistema de diseño del **Departamento de Ciencias de la Computación** de la Universidad de Chile.

CSS sin dependencias ni framework: clases planas sobre variables. Funciona igual en React, Vue y
HTML plano (monolitos Django), porque no hay build de por medio para consumirlo.

[**Ver la documentación**](https://dcc-fcfm-uchile.github.io/dcc-ui-kit/) ·
[Guía de consumo](dist/README.md) ·
[Integrar en Django](docs/integracion-django.md) ·
[Decisiones de diseño](docs/decisiones-de-diseno.md) ·
[Cómo publicarlo](PUBLICAR.md)

---

## Uso rápido

```html
<link rel="stylesheet" href="https://cdn.dcc.uchile.cl/ui-kit/2.6.0/dcc-ui.min.css">
<script src="https://cdn.dcc.uchile.cl/ui-kit/2.6.0/dcc-ui.bundle.min.js" defer></script>

<button class="dcc-btn dcc-btn--md dcc-btn--contained">
  Guardar <svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-check"/></svg>
</button>
```

O como paquete:

```bash
npm i github:DCC-FCFM-UCHILE/dcc-ui-kit#v2.6.0
```

La [guía de consumo](dist/README.md) cubre React, Vue, Django y las cabeceras que debe servir el
servidor.

---

## Qué incluye

**23 familias de componentes.** Color, tipografía, botones, badges, controles de selección, alerts,
tablas (con orden), navegación institucional y de aplicación, sidebar, footer, inputs, switch,
avatares, listas, acordeón, breadcrumb, tabs, paginación, stepper, bottom navigation, calendario con
date picker, tarjeta de programa y tarjeta comprimida.

**41 íconos** de [Lucide](https://lucide.dev) 0.544.0, en sprite.

**51 tokens** de diseño como variables CSS.

**El comportamiento incluido.** Acordeón, tabs, combobox, tabla ordenable, calendario y el resto
vienen en un bundle que se auto-inicializa. Dos etiquetas y funciona; no hay JavaScript que copiar
a cada app.

**Tema oscuro.** Opcional: `data-dcc-theme="dark"` en `<html>` (o en cualquier contenedor), o
`data-dcc-theme="auto"` para seguir al sistema. Sin el atributo, el kit se queda en claro.

Todo con teclado y ARIA donde corresponde, y respetando `prefers-reduced-motion`.

---

## Estructura

```
src/
  styles.css          la fuente de verdad del CSS
  behaviors.js        la fuente de verdad del comportamiento
  icons.svg           los íconos Lucide del kit
  assets/             logotipos y placeholders
  sitio/              la documentación: plantilla y un fragmento por componente
dist/                 lo que se publica (generado, versionado y verificado en CI)
site/                 la documentación generada: portada y una página por componente
scripts/
  build.mjs           genera dist/ y site/ desde src/
  sitio.mjs           arma site/ a partir de src/sitio/
  verify.mjs          28 verificaciones, incluidas las de comportamiento
docs/
  decisiones-de-diseno.md   por qué cada cosa es como es
```

---

## Desarrollo

```bash
npm install
npm start          # sirve el repo en http://localhost:4173/site/
                   # (respeta PORT si viene del entorno)
npm run build      # regenera dist/ y site/
npm test           # verifica que dist/ esté sincronizado y que nada se rompió
```

La documentación es el entorno de trabajo. Tiene una portada con todos los componentes y una página
por componente, con sus demos y el HTML de cada una listo para copiar. Se edita `src/styles.css`,
`src/behaviors.js` o un fragmento de `src/sitio/componentes/`, se corre `npm run build` y se mira el
resultado en `site/`.

Las páginas cargan el mismo `styles.css` y el mismo `behaviors.js` que se publican, y las pruebas de
comportamiento corren sobre esos mismos fragmentos. Si el kit se rompe, se rompe también la
documentación: no pueden divergir.

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
