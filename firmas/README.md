# Firmas de correo del DCC

La firma institucional en HTML, lista para Gmail, Outlook y Apple Mail.

- **`index.html`** — el generador. Cada persona completa nombre, cargo, los últimos 5 dígitos de
  su teléfono (el `+56 2297` es fijo), edificio (Poniente o Norte), piso (2 o 3) y oficina; la calle,
  Beauchef #851, va fija. Revisa la firma en ancho de escritorio y de teléfono, y la copia o la
  descarga. Copiar y descargar se bloquean mientras falte un dato, para que nadie envíe una firma con
  los marcadores "#####" o "Poniente/Norte". Con `npm start` queda en
  `http://localhost:4173/firmas/`.
- **`plantilla.js`** — la firma misma: `firmaDCC(datos, { base })` devuelve el HTML. La usan el
  generador y `generar-ejemplo.mjs`.
- **`ejemplo.html`** — una firma completa de muestra. Se regenera con
  `node firmas/generar-ejemplo.mjs`.
- **`img/`** — logotipo e íconos en PNG, más el logotipo original en SVG. Los PNG se publican con
  cada versión del kit en `dist/firmas/img/` (ver abajo).

En escritorio la firma tiene dos columnas: a la izquierda el logotipo gris del DCC y las redes;
a la derecha nombre, cargo, teléfono y dirección, separados de las redes por una línea roja. En el
teléfono las columnas se apilan solas y la línea queda a la izquierda del nombre. No lleva correo:
quien la recibe ya lo tiene en el remitente.

## Por qué está hecha así

Un correo no es una página web, y cada decisión sale de lo que los clientes de correo aceptan:

- **Tablas y estilos en línea.** Gmail y Outlook borran el `<style>` de una firma al pegarla, así
  que no puede depender de clases ni de media queries.
- **Responsiva sin media queries.** Las dos columnas son bloques en línea con `max-width` (técnica
  "fluid hybrid"): en una pantalla de menos de 640px caen una bajo la otra solas. Outlook de
  escritorio ignora `max-width`, y para él hay una tabla fantasma en comentarios `[if mso]`.
- **PNG, no SVG.** Gmail y Outlook no muestran SVG. Los PNG están a unas 3 veces su tamaño en
  pantalla (54px para íconos de 20px, 690px para un logotipo de 252px), para que se vean nítidos en
  pantallas retina, y llevan `width` y `height` para que Outlook no los agrande.
- **Fondo blanco explícito**, para que en modo oscuro el logotipo gris no quede sobre negro.
- **Arial**, con Poppins sólo como primera opción del nombre: casi ningún cliente de correo carga
  fuentes web, y quien no tenga Poppins verá Arial.

## Antes de usarla

1. **Las imágenes ya viajan con el kit.** El build copia los PNG de `img/` a `dist/firmas/img/`, y
   cada versión queda publicada en `https://apps.dcc.uchile.cl/ui-kit/<versión>/firmas/img/`. Las
   firmas copiadas cargan los PNG desde esa dirección, que va en un campo oculto del generador
   (`name="base"`). La dirección lleva la versión a propósito: una firma ya enviada sigue viéndose aunque
   después cambie el logotipo. Al publicar una versión nueva, actualiza ese valor en `index.html`.
2. **Confirmar las redes.** Los enlaces de TikTok, Facebook, Instagram y LinkedIn suponen la cuenta
   `dccuchile` en todas (`REDES` en `plantilla.js`). Conviene verificar cada URL, en particular la de
   LinkedIn.

## Regenerar las imágenes

Los íconos salen de `src/icons.svg` (Lucide) y el logotipo de `img/logo-dcc-gris.svg`. Se
rasterizaron con QuickLook de macOS (`qlmanage -t`) y se les recuperó la transparencia: como cada
pieza es de un solo color sobre blanco, el alfa de cada pixel se despeja con exactitud.
