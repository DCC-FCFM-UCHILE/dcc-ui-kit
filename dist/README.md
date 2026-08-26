# DCC UI Kit 1.1.0 — guía de consumo

CSS servido desde tus propios servidores, como Bootstrap. Funciona igual en React, Vue y
Django, porque son clases planas sobre variables CSS: no hay build ni framework de por medio.

---

## 1. Qué se sirve

```
https://cdn.dcc.uchile.cl/ui-kit/1.1.0/
├── dcc-ui.min.css        48 KB   el CSS, minificado        ← se usa en producción
├── dcc-ui.bundle.min.js  20 KB   íconos + comportamiento   ← se usa en producción
├── dcc-ui.css            76 KB   el CSS legible, para depurar
├── dcc-ui.bundle.js      29 KB   el JS legible, para depurar
├── dcc-tokens.css         4 KB   sólo las 51 variables, por si alguien quiere sólo la paleta
├── dcc-behaviors.min.js  10 KB   sólo el comportamiento, sin los íconos (ver sección 3)
├── dcc-behaviors.js      18 KB   lo mismo, legible
├── dcc-icons.js          11 KB   sólo el inyector de íconos, sin el comportamiento
├── dcc-icons.svg          9 KB   el sprite suelto, para consumo del mismo origen
├── fonts/               144 KB   Inter y Poppins en woff2
└── SRI.txt                       hashes de integridad
```

Al navegador viajan sólo dos archivos: **48 KB de CSS y 20 KB de JavaScript**, más las fuentes que
la página realmente use. El resto de la carpeta son variantes legibles y piezas sueltas para casos
particulares.

**La ruta lleva la versión.** Publica cada release en su propia carpeta inmutable y no la toques
nunca más. Así una app puede quedarse en `1.0.0` mientras otra pasa a `1.1.0`, y nadie se rompe por
sorpresa. No uses un alias tipo `/ui-kit/latest/`: te va a morder.

---

## 2. Instalación en dos líneas

```html
<link rel="stylesheet" href="https://cdn.dcc.uchile.cl/ui-kit/1.1.0/dcc-ui.min.css">
<script src="https://cdn.dcc.uchile.cl/ui-kit/1.1.0/dcc-ui.bundle.min.js" defer></script>
```

Eso es todo. No hay que llamar a ninguna función: el bundle inyecta los íconos y enlaza los
componentes por su cuenta al terminar de cargar la página.

Con integridad verificada, si quieres los hashes de `SRI.txt`:

```html
<link rel="stylesheet"
      href="https://cdn.dcc.uchile.cl/ui-kit/1.1.0/dcc-ui.min.css"
      integrity="sha384-…"
      crossorigin="anonymous">
<script src="https://cdn.dcc.uchile.cl/ui-kit/1.1.0/dcc-ui.bundle.min.js"
        integrity="sha384-…"
        crossorigin="anonymous" defer></script>
```

Las fuentes se cargan solas: el `@font-face` está dentro del CSS con rutas relativas, así que basta
con que `fonts/` viva junto al archivo.

**Actualizar es cambiar el número de versión de esas dos líneas.** No hay archivos que copiar dentro
de cada app.

---

## 3. Qué trae el JavaScript, y por qué

El bundle hace dos cosas.

**Inyecta el sprite de íconos.** `<use href="https://otro-origen/icons.svg#id">` está bloqueado por
los navegadores: un sprite servido desde el CDN no se puede referenciar desde la app si están en
orígenes distintos, y falla en silencio —no hay error en consola, simplemente no se dibuja nada—.
El bundle lleva el sprite embebido y lo inyecta, con lo que la referencia pasa a ser local:

```html
<button class="dcc-btn dcc-btn--md dcc-btn--primary-grey">
  Favorito <svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-star"/></svg>
</button>
```

**Enlaza el comportamiento de los componentes.** Acordeón, tabs, combobox, tabla ordenable,
calendario, menú hamburguesa, favoritos, arrastre, limpiar búsqueda, quitar badge y bottom
navigation. Sin esto son markup muerto: el CSS los dibuja pero no responden.

Se auto-inicializa al cargar. No hay que llamar a nada.

### DOM que aparece después

Si tu app inserta HTML sin recargar la página —htmx, una respuesta AJAX, un modal— hay que enlazar
lo que llegó:

```js
DCCUI.init(elementoNuevo);
```

Es idempotente: enlaza cada elemento una sola vez, así que llamarlo de más no duplica manejadores.

**Con htmx no hay que llamar a nada:** el kit escucha `htmx:afterSwap` por su cuenta.

### Las piezas sueltas

Si te sirve el kit desde **el mismo origen** que la app —el caso de Django con `staticfiles`— puedes
referenciar el sprite directo y ahorrarte su peso:

```html
<script src="/static/ui-kit/dcc-behaviors.min.js" defer></script>
<svg class="dcc-icon dcc-i" viewBox="0 0 24 24">
  <use href="/static/ui-kit/dcc-icons.svg#i-star"/>
</svg>
```

Son 10 KB en vez de 20. A cambio, cada `<use>` lleva la ruta completa. Si dudas, usa el bundle.

### El tamaño lo pone el componente, no el ícono

Esto sorprende, y falla en silencio. `.dcc-i` fija **sólo el grosor de trazo**. El tamaño lo pone
siempre el componente que contiene al ícono: `.dcc-btn` lo deja en 16px, `.dcc-alert` en 24px,
`.dcc-badge` en 12px, y así.

Un ícono suelto en tu propio markup, fuera de cualquier componente del kit, **se renderiza 0×0**:
no se ve nada y no hay error en consola.

```html
<!-- invisible: nada le da tamaño -->
<svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-check"/></svg>

<!-- bien: dentro de un componente del kit -->
<button class="dcc-btn dcc-btn--md dcc-btn--primary-grey">
  Guardar <svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-check"/></svg>
</button>

<!-- bien: fuera del kit, poniéndole tú el tamaño -->
<svg class="dcc-i" viewBox="0 0 24 24" width="20" height="20"><use href="#i-check"/></svg>
```

> **La clase `.dcc-i` es obligatoria en cada `<svg>`.** Sin ella los íconos se ven notoriamente más
> delgados.

---

## 4. React

```jsx
// una sola vez, en el layout raíz
<link rel="stylesheet" href="https://cdn.dcc.uchile.cl/ui-kit/1.1.0/dcc-ui.min.css" />

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

**En React no uses el JavaScript del kit.** Enlaza manejadores sobre el DOM, que es justo lo que
React quiere administrar él. Carga sólo el CSS. Para acordeón, tabs, combobox y paginación usa
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

Es el caso más directo: el kit está escrito en vanilla y las páginas las arma el servidor, que es
exactamente el escenario para el que fue pensado. No hay nada que portar ni que copiar.

### Desde el CDN

```django
{# templates/base.html #}
<link rel="stylesheet" href="https://cdn.dcc.uchile.cl/ui-kit/1.1.0/dcc-ui.min.css">
<script src="https://cdn.dcc.uchile.cl/ui-kit/1.1.0/dcc-ui.bundle.min.js" defer></script>
```

```django
<button class="dcc-btn dcc-btn--md dcc-btn--primary-grey">
  Guardar <svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-check"/></svg>
</button>
```

Para actualizar, cambias `1.1.0` por la versión nueva en esas dos líneas del `base.html`. Nada más.

### Desde `staticfiles`, sin CDN

Si prefieres servirlo tú, copia `dist/` a `static/ui-kit/` y usa `{% static %}`:

```django
{% load static %}
<link rel="stylesheet" href="{% static 'ui-kit/dcc-ui.min.css' %}">
<script src="{% static 'ui-kit/dcc-ui.bundle.min.js' %}" defer></script>
```

Dos cosas que hay que respetar:

- **`fonts/` tiene que quedar junto al CSS.** El `@font-face` usa rutas relativas; si separas la
  carpeta, las fuentes fallan en silencio y la página cae a la tipografía del sistema.
- **CORS deja de importar.** La advertencia de la sección 7 sólo aplica si el CSS viene de otro
  dominio.

Con `ManifestStaticFilesStorage` no hay que tocar nada: reescribe bien las rutas relativas de las
fuentes al hashearlas.

La contra de esta vía es que vuelves a copiar archivos en cada app y en cada actualización, que es
justo lo que el CDN evita.

### Con htmx

Funciona sin escribir código: el kit se engancha a `htmx:afterSwap` y enlaza lo que llegue. Si
insertas HTML por otra vía, llama a `DCCUI.init(elemento)` (sección 3).

### Paginación

El bloque de paginación del kit sólo mueve el `aria-current`; es una demostración del estado
visual. En Django la paginación la resuelve el `Paginator` del servidor y tú aprovechas las clases.

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
