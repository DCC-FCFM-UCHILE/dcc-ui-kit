# DCC UI Kit 1.0.1 — guía de consumo

CSS servido desde tus propios servidores, como Bootstrap. Funciona igual en React, Vue y
Django, porque son clases planas sobre variables CSS: no hay build ni framework de por medio.

---

## 1. Qué se sirve

```
https://cdn.dcc.uchile.cl/ui-kit/1.0.1/
├── dcc-ui.css          73 KB   todo el kit, legible
├── dcc-ui.min.css      47 KB   lo mismo, minificado  ← el que se usa en producción
├── dcc-tokens.css       4 KB   sólo las 51 variables, por si alguien quiere sólo la paleta
├── dcc-icons.js        11 KB   inyector del sprite (ver sección 3)
├── dcc-icons.svg        9 KB   el sprite suelto, para consumo del mismo origen
├── fonts/             144 KB   Inter y Poppins en woff2
├── app.html                    ejemplo mínimo de consumo, sin envoltorios del kit
└── SRI.txt                     hashes de integridad
```

Total: **293 KB**, de los cuales sólo viajan al navegador ~47 KB de CSS más las fuentes que la
página realmente use.

Abre `app.html` para ver el kit funcionando en una página que **no** usa nada del styleguide: es la
prueba de que no hay dependencias ocultas.

**La ruta lleva la versión.** Publica cada release en su propia carpeta inmutable y no la toques
nunca más. Así una app puede quedarse en `1.0.0` mientras otra pasa a `1.1.0`, y nadie se rompe por
sorpresa. No uses un alias tipo `/ui-kit/latest/`: te va a morder.

---

## 2. Instalación en dos líneas

```html
<link rel="stylesheet" href="https://cdn.dcc.uchile.cl/ui-kit/1.0.1/dcc-ui.min.css">
<script src="https://cdn.dcc.uchile.cl/ui-kit/1.0.1/dcc-icons.js" defer></script>
```

Con integridad verificada, si quieres el hash de `SRI.txt`:

```html
<link rel="stylesheet"
      href="https://cdn.dcc.uchile.cl/ui-kit/1.0.1/dcc-ui.min.css"
      integrity="sha384-…"
      crossorigin="anonymous">
```

Las fuentes se cargan solas: el `@font-face` está dentro del CSS con rutas relativas, así que basta
con que `fonts/` viva junto al archivo.

---

## 3. Íconos: por qué hay un archivo `.js`

**`<use href="https://otro-origen/icons.svg#id">` está bloqueado por los navegadores.** Un sprite
servido desde el CDN no se puede referenciar desde la app si están en orígenes distintos, y falla en
silencio: no hay error en consola, simplemente no se dibuja nada.

`dcc-icons.js` lleva el sprite embebido y lo inyecta en el documento. Con eso la referencia pasa a
ser local y funciona desde cualquier origen:

```html
<svg class="dcc-i" viewBox="0 0 24 24"><use href="#i-star"/></svg>
```

Es idempotente —cargarlo dos veces no duplica nada— y funciona tanto con `defer` como inyectado
tarde.

Si el CDN termina sirviéndose desde **el mismo origen** que la app, puedes saltarte el JS y
referenciar el sprite directo: `<use href="/ui-kit/1.0.1/dcc-icons.svg#i-star">`.

> **La clase `.dcc-i` es obligatoria en cada `<svg>`.** Es la que fija el grosor de trazo. Sin ella
> los íconos se ven notoriamente más delgados.

---

## 4. React

```jsx
// una sola vez, en el layout raíz
<link rel="stylesheet" href="https://cdn.dcc.uchile.cl/ui-kit/1.0.1/dcc-ui.min.css" />

export function Boton({ children }) {
  return (
    <button className="dcc-btn dcc-btn--md dcc-btn--primary-grey">
      {children}
    </button>
  );
}
```

**Para los íconos, mejor el paquete oficial que el sprite:**

```bash
npm i lucide-react@0.544.0     # la versión importa, ver más abajo
```

```jsx
import { Star } from "lucide-react";
<Star className="dcc-i" size={18} />
```

**No portes el JavaScript del styleguide.** Sus 10 bloques consultan `document` al cargar, lo que se
rompe con DOM dinámico. Para acordeón, tabs, combobox y paginación usa
[Radix](https://www.radix-ui.com/) o [Headless UI](https://headlessui.com/) y aplícales las clases
del kit: te resuelven teclado y accesibilidad, tú pones el CSS. El único que conviene portar a mano
es el calendario.

---

## 5. Vue 3

```vue
<script setup>
import { Star } from "lucide-vue-next";   // pinear 0.544.0
</script>

<template>
  <button class="dcc-btn dcc-btn--md dcc-btn--primary-grey">
    Guardar <Star class="dcc-i" :size="18" />
  </button>
</template>
```

Mismo criterio que en React: CSS del CDN, comportamiento con headless (Radix Vue o Headless UI Vue).

---

## 6. Django y HTML plano

Es el caso más directo, porque **el JavaScript del styleguide funciona tal cual**: fue escrito en
vanilla, sin dependencias.

```django
{# templates/base.html #}
<link rel="stylesheet" href="https://cdn.dcc.uchile.cl/ui-kit/1.0.1/dcc-ui.min.css">
<script src="https://cdn.dcc.uchile.cl/ui-kit/1.0.1/dcc-icons.js" defer></script>
```

```django
<button class="dcc-btn dcc-btn--md dcc-btn--primary-grey">
  Guardar <svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-check"/></svg>
</button>
```

Copia los bloques de comportamiento que necesites desde el `<script>` de `index.html` a un
`dcc-behaviors.js` propio.

---

## 7. Lo que tiene que servir el servidor

```nginx
location /ui-kit/ {
    add_header Access-Control-Allow-Origin "*";          # imprescindible para las fuentes
    add_header Cache-Control "public, max-age=31536000, immutable";
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
}
```

**El `Access-Control-Allow-Origin` no es opcional.** Los `@font-face` cruzados de origen exigen CORS:
sin esa cabecera las fuentes fallan en silencio y el navegador cae a la tipografía del sistema. Es el
error más común al montar un CDN propio.

El `immutable` sólo es seguro porque la versión va en la ruta.

---

## 8. Convenciones del kit

**Todo va prefijado con `dcc-`.** No es cosmético: 26 de las 101 clases del kit chocaban con
Bootstrap —`btn`, `card`, `badge`, `alert`, `table`, `input`, `list`, `pagination`, `breadcrumb`,
`accordion`— y el CSS que cargue segundo gana. Con el prefijo, el kit convive con Bootstrap,
Tailwind o lo que la app ya tenga.

Se dejaron **sin** prefijo dos familias, a propósito:

- `is-*` — estado (`is-open`, `is-active`, `is-selected`). Siempre viven bajo un padre prefijado.
- `js-*` — ganchos de JavaScript. No tienen estilos; sirven para que nadie confunda un selector de
  comportamiento con uno de presentación.

**Pinea Lucide en 0.544.0.** No es paranoia: la versión 1.33 rediseñó el ícono `smile` y por eso los
íconos de este kit se veían distintos a los de Figma. Sin pin, cada app va a derivar sola.

---

## 9. Tarjeta comprimida: favorito y arrastre

**Favorito con estrella o corazón.** El color del estado activo viaja en tres variables locales, así
que una variante sólo las redefine — no hay reglas duplicadas:

```html
<!-- estrella amarilla (por defecto) -->
<button class="dcc-ccard__fav" aria-pressed="false" aria-label="Marcar como favorito">
  <svg class="dcc-i" viewBox="0 0 24 24"><use href="#i-star"/></svg>
</button>

<!-- corazón rojo -->
<button class="dcc-ccard__fav dcc-ccard__fav--heart" aria-pressed="false" aria-label="Marcar como favorito">
  <svg class="dcc-i" viewBox="0 0 24 24"><use href="#i-heart"/></svg>
</button>
```

Ambos se rellenan al marcarse y usan el mismo JavaScript. El estado vive en `aria-pressed`: el CSS y
el lector de pantalla leen la misma fuente. Para una variante nueva basta con:

```css
.dcc-ccard__fav--mia { --fav-on: var(--green-dark); --fav-on-strong: …; --fav-on-soft: …; }
```

**Variante arrastrable.** El arrastre se inicia **sólo desde el asa**, para que se pueda seleccionar
texto dentro de la tarjeta sin dispararlo sin querer:

```html
<article class="dcc-ccard dcc-ccard--media dcc-ccard--draggable">
  <button class="dcc-ccard__grip" aria-label="Reordenar, usa las flechas para mover">
    <svg class="dcc-i" viewBox="0 0 24 24"><use href="#i-grip-vertical"/></svg>
  </button>
  …
</article>
```

Estados: `.is-dragging` en la que se mueve y `.is-over` en el destino. **También se reordena con el
teclado**: enfocar el asa y usar las flechas. El arrastre por mouse es inaccesible por definición, y
sin esto la funcionalidad quedaría fuera del alcance de quien no usa puntero.

Contenedor de la lista: `<div class="dcc-ccard-grid js-dnd">`.

---

## 10. Publicar una versión nueva

1. Sube el número en `dcc-ui.css`, `dcc-tokens.css` y `dcc-icons.js`.
2. Regenera `dcc-ui.min.css` y `SRI.txt`.
3. Publica en una carpeta nueva `/ui-kit/X.Y.Z/`. **No sobrescribas las anteriores.**
4. Semver: `patch` para arreglos visuales, `minor` para componentes nuevos, `major` si cambia un
   nombre de clase o el valor de un token.

Las apps migran cuando pueden, cambiando un número en su plantilla base.
