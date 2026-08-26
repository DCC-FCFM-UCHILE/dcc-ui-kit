# Qué tuve que suponer

> **Revisión 19** — eliminada de raíz la fuga de especificidad del andamiaje, y nueva tarjeta
> comprimida con dos propuestas (sección 0.17).
> **Revisión 18** — el título de la tarjeta heredaba estilos del styleguide, y se quitaron las
> notas visibles del kit (sección 0.16).
> **Revisión 17** — eliminado el destello oscuro de ~60 ms al enfocar (sección 0.15).
> **Revisión 16** — encontrada la causa real de la línea negra del foco, y el botón de la
> tarjeta pasa a ser el del kit (sección 0.14).
> **Revisión 15** — paginación única, foco sin costura oscura, título de tarjeta a dos líneas
> y etiquetas dentro de la paleta (sección 0.13).
> **Revisión 14** — revertido el rojo claro en fondos oscuros, e incorporada la tarjeta de
> programa desde el archivo «Educación Continua» (sección 0.12).

> **Revisión 13** — foco, orden de tabla, calendario redondo y stepper con texto secundario
> (sección 0.11).
> **Revisión 12** — 12 ajustes de color, contraste y estados (sección 0.10).
> **Revisión 11** — el date picker se cerraba al navegar de mes (sección 0.9).
> **Revisión 10** — desborde del calendario, resaltado del bottom nav, acentos rojos de más y
> responsive de nav y footer (sección 0.8).
> **Revisión 9** — kit unificado en un solo `index.html` (21 secciones) y 8 correcciones
> reportadas (sección 0.7).
> **Revisión 8** — extensión del kit con 12 familias de componentes nuevos. Nada de esto
> existe en Figma (sección 0.6).

> **Revisión 7** — centrado vertical del texto en las tablas (sección 0.5).
> **Revisión 6** — footer a sangre, separador del sidebar, ancho de botones e ícono smile (sección 0.4).
> **Revisión 5** — grosor de trazo del ícono de usuario corregido (sección 0.3).
> **Revisión 4** — separación del menú medida y corregida (sección 0.2).
> **Revisión 3** — ancho máximo de contenedor aplicado a las barras (sección 0.1).
> **Revisión 2** — logo DCC instalado; nav institucional corregida contra los component sets
> `128:774` (Menú Principal) y `128:1005` (Menú Secundario). Detalle en la sección 0.

---

## 0.17 Fuga de especificidad: arreglada de raíz

Audité los 85 selectores del CSS que usan un descendiente por etiqueta. La gran mayoría son
inofensivos porque están acotados a su propio componente (`.combo__option svg`, `.card__date b`):
la clase padre es específica, así que no pueden alcanzar nada ajeno.

Los peligrosos eran sólo dos, y son los que ya habían causado el bug del título:

| Antes | Problema |
|---|---|
| `.section h3` | `.section` envuelve **todos** los componentes, así que alcanzaba cualquier `h3` dentro de cualquiera de ellos |
| `.table-row h3` | igual |

Ambos pasaron a clase propia: **`.sg-h3`**. Los 10 encabezados del andamiaje la llevan; los `h3`
de los componentes ya no reciben nada que no sea suyo. Como el conflicto desapareció, `.card__title`
volvió a ser un selector de una sola clase, sin la especificidad extra de parche.

**Convención que queda establecida en el kit,** anotada también en el CSS:

> El andamiaje del styleguide nunca usa selectores por etiqueta descendiente. Todo lo que es
> andamiaje lleva su propia clase `sg-*`.

Con eso, agregar componentes nuevos ya no puede chocar con los estilos de la página.

---

## Tarjeta comprimida

Dos propuestas sobre la misma base `.ccard`, ambas con los tokens del kit:

**A — estado de tarea.** Fila de chips arriba (estado + un chip punteado para añadir categoría),
título en Inter Bold 16, y metadatos de 12 px con ícono de 14 px. El estado reutiliza el `.badge` del
kit: rojo sólido para atrasado, y las variantes `soft` de alto contraste para el resto.

**B — ficha de sistema.** Portada cuadrada de 56 px a la izquierda con un ícono centrado, y a la
derecha el bloque de texto. La categoría y la versión comparten la primera línea con
`justify-content: space-between`, así la versión queda en la esquina superior derecha **sin recurrir
a posición absoluta** ni a reservar padding a mano — que se rompe cuando el texto cambia de largo.

La portada acepta también una imagen: `.ccard__cover img` está preparado con `object-fit: cover`, así
que reemplazar el ícono por una foto no requiere tocar CSS.

Fondos de portada tomados de la paleta, con el ícono en el tono `Dark` del mismo color. Todos
superan de sobra el 3:1 que WCAG pide para gráficos: Green 6,07 · Blue 9,11 · Red 7,83 ·
LightBlue 6,28 : 1.

**Sobre el tamaño del título:** ambas propuestas ya usaban la misma clase `.ccard__title` (Inter Bold
16 px), así que no hubo nada que igualar — lo verifiqué en el DOM. Si en pantalla se veía distinto,
era el efecto del espacio a su alrededor, no del tamaño.

Decisiones sin referencia: metadatos, descripción y versión van a **12 px** porque la escala del kit
es 12/16/20 y en las capturas esos textos rondan los 14 px, que no está en la escala.

**Un detalle de contraste que conviene saber:** el antetítulo de categoría usa `Grey/Light` sobre
blanco, que da **4,43 : 1** — apenas bajo el mínimo AA de 4,5 para texto pequeño. La versión sí la
puse en `Grey/Default` (8,16 : 1). Si quieres cerrar el hueco, basta subir el antetítulo a
`Grey/Default`; lo dejé más claro a propósito para que no compita con el título.

### Favorito

**No se estaba rellenando, y era un bug real.** El `<g id="i-star">` de `<defs>` traía
`fill="none"` como atributo de presentación, y eso le gana a la herencia CSS: por más que el CSS
pidiera `fill: currentColor`, el atributo mandaba. **Es exactamente el mismo caso que el grosor de
trazo del ícono de usuario** (sección 0.3) — segunda vez que este patrón muerde. Quitado el atributo
del `<g>`, el `fill` se hereda hasta el shadow tree que crea `<use>` y la estrella se rellena.

**Amarillo nuevo en la paleta.** No existe en Figma, así que lo derivé del perfil HSL del resto de
los colores: la paleta promedia S 57 % / L 42 %, y el ámbar elegido queda en **H 38° · S 70 % ·
L 42 %** = `#B67F20`. Da 3,47 : 1 sobre blanco, sobre el 3:1 que WCAG pide para gráficos. Agregué la
escala completa (`ultralight` / `light` / `default` / `dark`) para que se comporte como el resto de
la paleta, y la documenté en la sección Color.

**Categoría menos pesada.** 12 px ya es el mínimo de la escala del kit, así que achicarla más la
sacaría de escala; lo que sí se puede bajar es el peso, de 700 a **500** (Inter Medium, que el kit ya
carga y usa en el menú y en los tabs).

**La estrella es opcional.** Basta omitir el `<button>`: en A la fila de chips no se altera porque el
botón sólo usaba `margin-left: auto`, y en B la versión sigue anclada a la derecha porque el
antetítulo es quien tiene `flex: 1`. Dejé un ejemplo sin estrella en cada propuesta para que se vea
que ninguna de las dos depende de ella.

Al presionar, la estrella se hunde a 0,85 y rebota a 1,08 al quedar marcada. Respeta
`prefers-reduced-motion`.

**El espacio entre categoría y título tenía dos causas, y una era un bug.** El `gap` de la columna
era de 6 px, pero además **el botón de estrella estiraba la fila de la categoría**: mide 28 px y esa
fila sólo necesita 14,4 px, así que sobraban 4,8 px repartidos arriba y abajo. Consecuencia: las
tarjetas con estrella tenían **10,8 px** de separación y las que no la llevaban, **6 px** — no eran
consistentes entre sí.

Con márgenes de −7 px arriba y abajo el botón aporta 14 px, menos que los 14,4 de la categoría, así
que deja de mandar en el alto. Sumado al `gap` bajado a 2 px, el ritmo queda:

> categoría → **2 px** → título → 6 px → descripción

Idéntico en las cuatro tarjetas, con estrella o sin ella. La descripción conserva su aire con un
`margin-top` propio, así que lo único que se apretó fue lo que pediste. La propuesta A no se tocó.

Botón de estrella en las dos propuestas: en **A** cierra la fila de chips, en **B** va junto a la
versión. En ambos casos queda en la esquina superior derecha.

Tres decisiones:

- **Un solo ícono para los dos estados.** La estrella de Lucide es un trazo cerrado, así que la misma
  ruta sirve en contorno y rellena: el CSS sólo cambia `fill`. No hay que mantener dos íconos.
- **El estado vive en `aria-pressed`**, no en una clase. Es un `<button>` de dos estados, así que el
  lector de pantalla lo anuncia solo, y el CSS se cuelga del mismo atributo — no hay dos fuentes de
  verdad que se puedan desincronizar. El `aria-label` también cambia entre «Marcar como favorito» y
  «Quitar de favoritos».
- **Rojo para el estado activo**, coherente con el resto del kit, donde el rojo marca lo
  seleccionado (nav, tabs, paso actual del stepper). Contraste sobre blanco: sin marcar 4,43 · hover
  8,16 · favorito 5,01 : 1 — los tres sobre el 3:1 que WCAG pide para gráficos.

El botón mide 28 px con márgenes negativos de 4 px, así que su área táctil es cómoda pero no
agranda la fila donde vive.

---

## 0.16 El título de la tarjeta no era el título de la tarjeta

Otra colisión de especificidad, y esta era gorda. El título es un `<h3 class="card__title">` dentro
de una `<section class="section">`, así que competían:

| Regla | Especificidad |
|---|---|
| `.section h3` (el encabezado del styleguide) | **(0, 1, 1)** |
| `.card__title` | (0, 1, 0) |

Ganaba `.section h3`. El título de la tarjeta estaba recibiendo **`margin: 40px 0 20px`** —esos son
los 40 px de aire de más entre «Magíster en» y el título— y además `font-family: Inter` en vez de
Poppins, `line-height: 1.2` en vez de 1, y el color `Gray/800` en vez de `Grey/Default`. O sea: no
estaba usando ninguno de los valores que traje de Figma.

Corregido con `.card .card__title` (0, 2, 0). Ahora el espacio entre la categoría y el título es el
`gap: 8px` que define el archivo original, y la tipografía es la que corresponde. Subí por el mismo
motivo la especificidad de `.card__eyebrow`, `.card__meta` y `.card__rule`.

Es el tercer bug de este tipo en el kit (hover contra foco, ícono del input, y este). El patrón
común: reglas genéricas del styleguide con un selector de etiqueta que le ganan a las clases de
componente. Si el kit sigue creciendo, conviene acotar las reglas del andamiaje a `.section > h3`
para que no se filtren dentro de los componentes.

**Notas visibles eliminadas.** Se quitaron los 22 bloques de anotación azules y el párrafo
introductorio. Todo lo que decían está en este documento. Los comentarios dentro de `styles.css`
se conservaron, porque explican decisiones que no se deducen leyendo el código —si también los
quieres fuera, se hace en un paso.

---

## 0.15 El destello que quedaba

Quitar el hover mató el borde negro *permanente*, pero quedaba un parpadeo de unos 60 ms. La causa
es la transición: el hover ya había llevado el borde a `Grey/Default`, y al hacer clic el grosor
salta a 2 px **de inmediato** mientras el color tarda 150 ms en llegar al azul. Durante ese viaje el
borde grueso pasa por tonos muy oscuros:

| ms | Color | Contraste vs. el blanco del input |
|---:|---|---:|
| 0 | `#40506a` | 8,16 : 1 — se lee negro |
| 40 | `#3e5c7a` | 6,96 : 1 — se lee negro |
| 80 | `#3a759d` | 4,96 : 1 — oscuro |
| 150 | `#3594c7` | 3,38 : 1 — ya es azul |

Con `transition: none` en el estado enfocado el borde salta directo al azul y nunca atraviesa un
tono oscuro. El estado normal conserva su transición, así que el hover sigue siendo suave y al
desenfocar también.

---

## 0.14 La línea negra: la causa real

**Me equivoqué en el diagnóstico anterior.** Dije que era una costura de antialiasing entre el borde
y un `box-shadow` inset. No era eso. Tu descripción —negro con el mouse encima, correcto al
retirarlo— apuntaba exactamente al problema:

| Regla | Especificidad |
|---|---|
| `.input:hover:not(:disabled)` | **(0, 4, 0)** ← `:not()` suma la especificidad de su argumento |
| `.input:focus` | (0, 2, 0) |

El hover ganaba. Con el input enfocado **y** el mouse encima, el `border-color` lo ponía el hover:
`Grey/Default` `#40506a`, que a 2 px de grosor se lee como negro. Al sacar el mouse el hover dejaba
de aplicar y aparecía el color del foco. El grosor sí venía del foco, por eso se engrosaba igual.

La corrección es que el hover se apague cuando hay foco: `:hover:not(:disabled):not(:focus)`. El
mismo error estaba en el combobox, donde además había que contemplar el estado abierto.

Nota: el cambio de la revisión 15 —de `box-shadow` inset a borde real de 2 px— se queda igual. No
era la causa de este bug, pero sigue siendo la forma correcta de engrosar el borde.

**Botón de la tarjeta.** Ya no tiene botón propio: usa `.btn--md .btn--primary-grey` del kit. El
`<Fab>` del archivo original mide 34 px de alto y `.btn--md` mide 35,2 px, así que la sustitución es
casi exacta. Verificado que cabe: en los 268 px de contenido de la tarjeta, el bloque de fecha ocupa
125 px y el botón 114 px, con 8 px de separación quedan 247 px de 268.

**Queda un valor fuera de la escala del kit:** el bloque «Inicio / 29 de octubre» usa 14 px, que
viene de la tipografía del otro archivo (`typography/body2/400`). La escala de este kit es 12 / 16 /
20. Si quieres cerrar eso también, la opción natural es bajarlo a 12 px.

---

## 0.13 Cuatro ajustes

**La línea negra del foco era mía, y tenía una causa concreta.** Usaba
`box-shadow: inset 0 0 0 1px` para engrosar el borde. Esa hairline queda pegada al borde real y el
navegador la compone con antialiasing: en pantallas con DPR fraccionario las dos capas se mezclan y
dejan una costura oscura. Lo reemplacé por un **borde de verdad de 2 px** con 1 px menos de padding,
así no hay dos capas que componer y tampoco se mueve el contenido. La compensación cubre también los
inputs con ícono a la izquierda o a la derecha.

**Paginación:** queda sólo la propuesta B, plegada en la base del componente. Ya no hay modificadores
`--ghost` ni `--compact`. Botones de 36 px, radio 4 px, hover en `Grey/Ultralight` y página actual en
`Grey/Default`.

**Título de la tarjeta:** reserva siempre el alto de dos líneas (`min-height: 2em`, con
`line-height: 1` eso son exactamente dos) y recorta ahí con `line-clamp`. Así todas las tarjetas de
una fila alinean la regla, la duración y el pie aunque los títulos midan distinto. En la demo hay
títulos de 21, 29 y 30 caracteres justamente para que se note.

**Etiquetas dentro de la paleta**, con el mismo criterio que se aplicó a las tipografías:

| Etiqueta | Original | Ahora | Blanco encima |
|---|---|---|---:|
| Magíster | `#4d37f5` morado | `Blue/Default` `#4957a3` | 6,61 : 1 (el original daba 6,60) |
| Bootcamp | `#9747ff` violeta | `Green/Dark` `#20626a` | 6,96 : 1 |
| Diploma | `#d32f16` | `Red/Default` `#d23118` | 5,01 : 1 |

Blue/Default cae casi exactamente en la misma luminancia que el morado original, así que el cambio
casi no se nota. Para Bootcamp elegí `Green/Dark` en vez de otro azul porque las tres etiquetas
quedan separadas por **matiz** —rojo, índigo, verde azulado— y no sólo por brillo; dos azules
distintos a 12 px serían difíciles de distinguir. Ya no queda ningún color fuera de la paleta en
todo el kit.

---

## 0.12 Tarjeta de programa, y vuelta atrás del rojo claro

**Revertido.** El hover de los botones outlined y de los links sobre fondo oscuro vuelve a
`Red/Default`. Queda constancia del dato por si algún día importa: sobre `Grey/Default` ese rojo da
**1,63:1** de contraste, contra los 4,48:1 de `Red/Light`. Es una decisión de marca por sobre una de
legibilidad, y es legítima — pero conviene saberla.

**Tarjeta traída de «Educación Continua»** (`XRlMGrAb847dxcKC3s4kw5`), nodo `275:9776`, 300×374 px.

Cómo la encontré, porque no fue directo: `get_metadata` y `get_design_context` sobre la página
fallan con un error de parseo SSE. Hubo que listar los nodos con la Plugin API de Figma en modo
lectura, devolviendo respuestas cortas, y recién con el ID en mano `get_metadata` respondió bien
sobre ese subárbol.

Lo que trae tal cual del original: 300×374, imagen de 200 px al 80 % de opacidad con un velo negro
al 10 %, radio 4 px, sombra `elevation/1`, padding 16, gaps de 16 y 8, título Poppins Bold 20
mayúsculas, botón pastilla de 100 px con padding 5/8 y letter-spacing 0,5.

**Un hallazgo afortunado:** el texto de la tarjeta usa `#40506A`, que es **exactamente** el
`Grey/Default` de este kit. Los dos archivos comparten ese color, así que la tarjeta entra sin
retocar nada.

**Cuatro decisiones que tuve que tomar:**

| Qué | Decisión |
|---|---|
| Tipografía `Adelle Sans` (licencia comercial) | Cae a Inter, igual que en el resto del kit |
| Etiquetas `#4d37f5` (Magíster) y `#9747ff` (Bootcamp) | No existen en la paleta; quedan como tokens aparte `--tag-magister` y `--tag-bootcamp` |
| Etiqueta `#d32f16` (Diploma) | Está a 2 valores por canal de `Red/Default`: reutilizo el token del kit |
| Hover del botón «ver más» | El archivo no lo define; le puse el rojo del kit |

Las tres etiquetas pasan AA con texto blanco: 6,60 / 4,51 / 5,01 : 1.

**La imagen es un marcador de posición** (`assets/card-media.svg`) porque sigo sin poder descargar
desde figma.com. Reemplázala por la foto real manteniendo la proporción 3:2. El ícono de calendario
del original es `MdCalendarToday` de Material; usé el `calendar` de Lucide para no mezclar dos
familias de íconos en el mismo kit.

---

## 0.11 Ocho ajustes más

**Foco de los inputs.** Tu intuición del borde más grueso es la correcta, y hay una razón técnica:
el cambio de color por sí solo da **1,31:1** entre `Grey/Light` y `LightBlue/Default`, y WCAG pide
3:1. Al duplicar el grosor, el indicador deja de depender del tono. Lo hice con
`box-shadow: inset 0 0 0 1px` — sombra **sólida, sin desenfoque**, así que se ve como un borde de
2 px y no como el halo que quitamos, y además no desplaza el contenido.

**Tabla ordenable: ahora se distinguen por forma, no sólo por tono.** El problema era que tres
grises seguidos se parecen demasiado. Las flechas pasan a vivir en un chip:

| Estado | Chip | Glifo | Contraste |
|---|---|---|---:|
| Sin orden | ninguno | `Grey/Light` | 3,70:1 sobre la cabecera |
| Hover | blanco | `Grey/Default` | 8,16:1 dentro del chip |
| Ordenada | `Grey/Default` relleno | blanco | 8,01:1, y 6,81:1 del chip contra la cabecera |

**Badges con fondo *light* un paso más claro** (`Light` → `Ultralight`, tercera columna):

| Color | Antes | Ahora |
|---|---:|---:|
| LightBlue | 2,18:1 | 2,96:1 |
| Red | 2,75:1 | **4,19:1** |
| Blue | 3,41:1 | **5,30:1** |
| Green | 2,17:1 | 2,89:1 |

Mejoran todos, pero **lightblue y green siguen bajo el mínimo AA de 4,5:1** para texto pequeño: sus
tonos `Default` son demasiado claros para ir sobre un fondo claro. Si esos badges van a llevar texto
de 12 px, la variante que sí cumple es `badge--soft-*` (6,07–9,43:1). Esto ya es una desviación de
Figma, así que decidir aquí es decisión tuya, no del archivo.

**El resto:** los días del calendario se seleccionan en círculo (`border-radius: 9999px` con
`aspect-ratio: 1`); se eliminó el bottom navigation anclado al borde y queda sólo el flotante; el
botón dentro del input ya no se pinta de rojo en hover; y el stepper suma texto secundario en ambas
orientaciones, más acciones en el vertical.

**Alineación del stepper vertical:** el título ocupa exactamente los 32 px de la pelotita y centra
su línea dentro (`min-height: 32px` + `align-items: center`), así los dos quedan alineados por su
centro. Antes usaba un `padding-top` fijo de 6 px, que es lo que lo dejaba alto.

---

## 0.10 Doce ajustes de color y estados

Medí el contraste antes de elegir cada color. Tres de los cambios que pediste corrigen problemas
reales de legibilidad:

**Rojo sobre fondo oscuro.** `Red/Default` sobre `Grey/Default` da **1,63:1** — ilegible.
`Red/Light` da **4,48:1**. Aplicado al hover de los botones outlined y de los links sobre oscuro.

**Badges nuevos.** Las variantes `subtle` que vienen de Figma están todas bajo el mínimo AA de
4,5:1 para texto chico:

| Color | Fondo + texto de Figma | Contraste | Variante nueva `soft` | Contraste |
|---|---|---:|---|---:|
| LightBlue | Light + Default | 2,18:1 | Ultralight + Dark | **6,28:1** |
| Red | Light + Default | 2,75:1 | Ultralight + Dark | **7,83:1** |
| Blue | Light + Default | 3,41:1 | Ultralight + Dark | **9,11:1** |
| Green | Light + Default | 2,17:1 | Ultralight + Dark | **6,07:1** |

Importante: **no toqué los `subtle`**, porque son los que traduje del archivo. Agregué
`badge--soft-*` y lo usé sólo en los componentes nuevos (lista, tabla ordenable, badges de estado).
Si quieres, el mismo cambio se puede llevar a la sección Badge/Tags, pero ahí ya no sería fiel a
Figma.

**Flechas de orden en tres intensidades del mismo gris**, sin rojo ni juegos de opacidad:
`Grey/Light` sin orden (3,70:1), `Grey/Default` en hover (6,81:1), `Grey/Dark` cuando la tabla está
ordenada por esa columna (9,43:1).

**El resto:** fuera el hover rojo de las redes sociales (ahora bajan a 70 % de opacidad), del ícono
de la lista y del texto del acordeón; fuera el halo rojo del stepper; el ícono de usuario bajó de
40 a 32 px —con el trazo recalculado a 1,5 unidades para mantener los 2 px absolutos—; y en el
footer angosto desaparecen los enlaces de navegación —ya están en la nav— y todo queda centrado.

**Una advertencia sobre el foco.** Quitar el halo de los inputs deja el foco marcado sólo por el
cambio de color del borde. Funciona, pero es un indicador débil: WCAG pide 3:1 de contraste entre
el estado enfocado y el no enfocado, y `Grey/Light` → `LightBlue/Default` queda justo en el límite.
Si algún día hay que pasar una auditoría, la solución sin halo es engrosar el borde a 2 px en foco
compensando 1 px de padding para que no salte el layout.

**Tres propuestas de paginación**, las tres con la página actual en relleno `Grey/Default`:

- **A**, la del kit: cada número en su caja.
- **B**, sin cajas: el relleno hace todo el trabajo. Más liviana cuando la paginación convive con
  mucho contenido.
- **C**, compacta: dos flechas y «Página 2 de 12». Es la única cuyo ancho no depende de cuántas
  páginas haya, así que es la que sirve en móvil.

---

## 0.9 El date picker se cerraba al cambiar de mes

Una carrera entre el re-render y el listener de clic fuera:

1. Pulsas la flecha. El listener del calendario corre `render()`, que reemplaza el `innerHTML`.
2. El botón que pulsaste queda **desconectado del DOM**.
3. El evento sigue burbujeando hasta `document`, donde el guardia de «clic fuera» evalúa
   `picker.contains(e.target)`. Como el nodo ya no está en el árbol, devuelve `false`.
4. Se interpreta como un clic fuera y cierra el popover.

Dos arreglos: el guardia ahora descarta el evento si `e.target.isConnected` es falso —si el nodo ya
no está en el documento, el clic sólo pudo venir de adentro—, y tras el re-render se devuelve el
foco al botón de navegación equivalente, para no perder el hilo con el teclado.

**Verificado ejecutando el JavaScript real sobre el DOM real (jsdom), no leyendo el código:**
abrir, navegar meses en ambas direcciones sin cerrarse, seleccionar un día y que escriba la fecha,
cerrar con clic fuera y con Escape, el combobox, el acordeón, los tabs y el orden de la tabla
—incluyendo que la columna numérica ordene 41 < 76 < 94 < 128 y no alfabéticamente. 24 aserciones.

---

## 0.8 Seis correcciones más

**El calendario desbordaba, y la causa era doble.** La grilla usaba `repeat(7, 1fr)`, y `1fr`
arrastra un mínimo automático igual al `min-content` de la columna. Encima, los días son `<button>`,
que en Chrome traen `padding: 1px 6px` propio del navegador: 12 px extra por celda. Con eso el
mínimo por columna quedaba en 32 px:

| Ancho de la tarjeta | Disponible por columna | Antes | Ahora |
|---:|---:|---|---|
| 240 px | 27,7 px | desborda | ok |
| 260 px | 30,6 px | desborda | ok |
| 280 px | 33,4 px | ok | ok |

Y como el popover tenía `max-width: 100%`, se encogía al ancho del campo —que en esa fila queda bajo
270 px— disparando el desborde. Tres arreglos: `minmax(0, 1fr)`, `padding: 0` en los días, y el
popover fijo en 320 px cediendo sólo ante el viewport (`calc(100vw - 32px)`). El mínimo por columna
bajó de 32 a 20 px.

**El resto:**

| Reporte | Corrección |
|---|---|
| Borde rojo en las opciones del selector | Fuera. El check ahora usa `currentColor`, el mismo color del texto |
| Borde rojo lateral en la lista | Fuera. El ítem activo se distingue sólo por el fondo `Grey/Ultralight` |
| Separación en la línea de los tabs | `gap: 0` en la lista: los 2 px de cada pestaña forman una línea continua |
| En bottom nav sólo se resaltaba el ícono | La pastilla `Grey/Dark` pasó del ícono al ítem completo, ícono y etiqueta |
| Nav institucional angosta | Cerrado, el menú tenía `max-height: 0` pero seguía siendo ítem flex y aportaba dos gaps de 16 px, dejando un hueco vacío. Ahora sale del flujo con `display: none`, y las redes acompañan al menú en vez de ocupar una fila propia |
| Footer angosto | Enlaces en dos columnas bajo 768 px (una sola bajo 480), contacto alineado a la izquierda con quiebre de línea en correo y dirección, y logos centrados con altura pareja de 56 px (44 px bajo 480) |

---

## 0.7 Un solo archivo, y ocho correcciones

**El kit ahora es un único `index.html` con 21 secciones**: las 9 traducidas de Figma más las 12
nuevas. `componentes.html` quedó como redirección para no romper el enlace.

**Tipografía: no había nada que corregir.** Ambos documentos cargaban Poppins 700 e Inter
400/500/700 más itálica, y la escala calza exacto con los estilos de Figma (Display 48/1.1,
Headings 36/24/16, Body 20/16/12 a 1.2).

| Lo que reportaste | Causa | Corrección |
|---|---|---|
| Lista con demasiado color | Yo había inventado cajas de 32 px con fondo *ultralight* | Ícono suelto de 20 px en `Grey/Default`; el color queda para los badges |
| Iniciales del avatar desplazadas | El salto de línea del markup se convertía en un ítem anónimo con espacio en blanco dentro del grid | Iniciales siempre en `.avatar__label`, contenedor a `inline-flex`, y el contador centrado con grid en vez de `line-height` fijo |
| Dos cruces en la búsqueda | `type="search"` dibuja su propia cruz en Chrome y Safari, además de la mía | `::-webkit-search-cancel-button { display: none }` |
| El select abría la lista nativa | Un `<select>` nativo no permite estilizar su desplegable | Combobox propio con `role="combobox"` + `role="listbox"`, flechas, Inicio/Fin, Escape y clic fuera |
| El date picker no funcionaba | **Bug de especificidad mío:** `.input-wrap > .input-btn` heredaba `pointer-events: none` de la regla del ícono decorativo, y `.input-btn { pointer-events: auto }` tenía menos peso | El botón va en su propia regla con la misma especificidad, y el área de toque subió de 16 a 24 px |
| Poco aire en el acordeón | 16 px del título eran todo el espacio | +8 px arriba del texto (24 px totales) y el título abierto baja a 12 px |
| Línea roja en bottom nav | La había copiado de la nav institucional | Pastilla `Grey/Dark` detrás del ícono; el rojo queda reservado para la nav |
| Faltaba variante flotante | — | Barra despegada 12 px, radio 24 px (el de los botones) y sombra del kit |

**Decisión de color en bottom nav:** los ítems inactivos ahora van en `LightBlue/Light`, un token
del kit, en vez de blanco con opacidad. Era el único texto con transparencia que quedaba.

---

## 0.6 Componentes extendidos — todo es invención mía

`componentes.html` agrega 12 familias que **no existen en el archivo de Figma**. Comparte
`styles.css` con el styleguide base, así que los tokens siguen teniendo una sola fuente. Todo está
derivado de decisiones que el kit ya tomaba:

| Del kit | Cómo se reutiliza |
|---|---|
| Alto 40 px de la cabecera de tabla | Alto de inputs, select y botones de paginación |
| Radio 4 px de los chips de menú | Inputs, botones de paginación, celdas del calendario |
| Radio 8 px de la tabla | Tarjetas de lista, acordeón, calendario |
| Rojo = activo / hover | Tab activa, paso actual del stepper, hover de paginación, ítem activo de la lista |
| Línea roja bajo el menú institucional | Subrayado de la tab activa y borde superior del ítem activo en bottom nav |
| `LightBlue/Default` del foco de los checkbox | Anillo de foco de todos los campos |
| `Red/Default` y `Green/Default` de los alerts | Estados de error y éxito en formularios |
| Cajas `*/Ultralight` | Fondo de los íconos de lista y halo del paso actual |

**Decisiones que tomé sin referencia y que quizá quieras cambiar:**

- **Tipografía de los encabezados de componente.** Usé Inter Bold 16 en el acordeón y no la
  `Heading/S` del kit (Poppins Bold 16 mayúsculas), porque en un acordeón de preguntas las
  mayúsculas se leen peor. El calendario sí usa Poppins para el mes.
- **Anillo de foco.** `LightBlue/Default` al 35 % de opacidad. Es el único color con transparencia
  que introduje; el resto sale de las variables tal cual.
- **Semántica del stepper.** Completado en `Grey/Default`, actual en `Red/Default`. Podría
  argumentarse que completado debería ir en `Green/Default`, pero el kit usa verde sólo para estados
  de éxito puntuales, no para progreso.
- **Bottom nav.** Los inactivos van a 70 % de blanco. Es el único uso de opacidad sobre texto en
  todo el kit; la alternativa sería agregar una variable de gris claro sobre fondo oscuro.
- **Avatares.** No existían. Círculo con iniciales en 24/32/40/48/64 px, colores de la paleta, punto
  de estado de 12 px y contador de 18 px, ambos con borde blanco de 2 px para despegarse del fondo.

**Accesibilidad:** los tabs navegan con flechas, `Inicio` y `Fin` y saltan los deshabilitados; el
calendario con flechas, `Inicio`, `Fin`, `Re Pág` y `Av Pág`; el acordeón usa `aria-expanded` y
`aria-controls`; el orden de tabla vive en `aria-sort`, así que lo anuncia el lector de pantalla; y
las animaciones del switch y del acordeón respetan `prefers-reduced-motion`.

**Verificado:** HTML válido en modo estricto, JavaScript sin errores de sintaxis, las 115 clases del
markup tienen regla CSS, los 22 íconos definidos se usan todos y ninguno queda roto.

---

## 0.5 Centrado vertical en las tablas

`vertical-align: middle` centra la caja de línea en el **área de contenido**, que es la celda menos
el borde inferior. Como la cabecera tiene un borde de 2 px, el texto subía 1 px.

Lo calculé con las métricas reales de Poppins Bold e Inter Regular (ascendente, descendente y altura
de mayúscula), no a ojo:

| Celda | Borde inferior | Desvío antes | Ahora |
|---|---:|---:|---:|
| Cabecera, Poppins Bold 16/1.1, 40 px | 2 px | **−1,04 px** | −0,04 px |
| Fila, Inter Regular 16/1.2, 52 px | 0,5 px | −0,25 px | 0,00 px |
| Última fila, ídem | 2 px | −1,00 px | 0,00 px |

La corrección es `padding-top` igual al grosor del borde: así el área de contenido vuelve a quedar
simétrica y la caja de línea se centra en la celda completa. También pasé la tabla a
`border-collapse: separate`, porque con bordes colapsados el alto de la celda es ambiguo entre
navegadores y el cálculo dejaba de ser determinista. No hay bordes verticales, así que no se duplica
nada. Los altos de 40 y 52 px y el padding lateral de 24 px quedaron intactos.

**Una diferencia deliberada con Figma:** el archivo posiciona estos textos en `50% + 1px`,
`50% + 0,75px` y `50% + 1,5px`, o sea entre 0,75 y 1,5 px **bajo** el centro. Son artefactos de cómo
Figma calcula la caja del texto. Como pediste que se vea centrado, apunté al centro óptico real de
las mayúsculas, que queda ~1 px más arriba que Figma. Si prefieres calcar el archivo tal cual, hay
que sumar esos offsets al `padding-top`.

---

## 0.4 Cuatro correcciones

**Footer.** Ahora se comporta igual que la nav: banda a sangre completa, contenido topado en
`--container-max` y centrado, con la misma canaleta. A 1440 px reproduce los 60 px del frame. Nav y
footer quedan alineados en la misma columna a cualquier ancho.

**Separador del sidebar.** Estaba en `rgba(255,255,255,.35)`, un valor que me inventé. El correcto
es **`Grey/Light` #5D7C8E**: es la única variable del subárbol del sidebar (`154:335`) que no
consume ningún otro elemento —el fondo usa Grey/Default, el borde activo Grey/Ultralight, el botón
y los textos White— y el separador es lo único cuyo color no estaba explicado. El grosor de 1 px sí
estaba bien (`inset -0.5px`).

**Ancho de los botones.** No era el padding, era la rejilla de la demo: `.demo-grid` usa columnas de
mínimo 150 px y los ítems de grid se estiran por defecto. Los botones miden 85 px (sm), 93 px (md) y
109 px (lg) de ancho natural, así que sobraban entre 41 y 65 px. Corregido con `justify-items: start`.
Los paddings del diseño no se tocaron.

**Ícono smile.** Había instalado `lucide-static` v1.33.0, que **rediseñó el ícono**: ojos como trazos
verticales y boca en arco circular. Comparé las versiones 0.400, 0.469, 0.544 y 1.33 de los nueve
íconos que uso, y `smile` es el único cuya forma cambió — y sólo en la 1.33:

| Versión | smile |
|---|---|
| 0.400 – 0.544 | `circle` + `M8 14s1.5 2 4 2 4-2 4-2` + 2 `line` (ojos como puntos) |
| 1.33.0 | `M15 10V9` + `M16.472 15a6 6 0 01-8.943 0` + `M9 10V9` + `circle` |

Volví al trazado clásico. El resto de los íconos es idéntico entre 0.544 y 1.33, así que no hubo que
tocarlos (las diferencias en `mail`, `phone` y `menu` entre 0.400 y 0.544 son reescrituras con la
misma geometría).

---

## 0.3 Grosor de trazo del ícono de usuario

Yo escalaba el trazo junto con el ícono; Figma no lo hace. Los `inset` negativos que Figma pone
alrededor de cada vector son exactamente medio grosor de trazo, así que se puede despejar el valor:

| Ícono | Tamaño | Inset de Figma | Caja del vector | Trazo implícito |
|---|---:|---:|---:|---:|
| smile (badge) | 12 | −5 % | 10,0 | **1,00 px** |
| smile, users, plus, phone | 16 | −4,99 % | 13,33 | **1,33 px** |
| info, circle-check | 24 | −5 % | 20,0 | **2,00 px** |
| **circle-user** | **40** | **−3 %** | **33,33** | **2,00 px** |

Los tres primeros son 2 unidades del viewBox de 24 escaladas (1,00 / 1,33 / 2,00). El de 40 px
rompe el patrón: si escalara daría −5 % y 3,33 px, pero Figma declara −3 %, o sea **2 px absolutos**.
Ahí estaba el trazo grueso. Corregido a `stroke-width: 1.2` (2 × 24/40) en el ícono de 40 px.

De paso saqué `stroke-width` de los `<g>` de `<defs>` y lo pasé a CSS: como atributo de presentación
en el `<g>` gana sobre la herencia y no hay forma de cambiarlo por instancia. Ahora se hereda hasta
el shadow tree que crea cada `<use>` y se puede afinar donde haga falta.

---

## 0.2 Separación entre ítems del menú — el diseño está al límite

Medí los anchos con las métricas reales de Inter Medium 16 (paquete `@fontsource/inter`,
validadas contra el screenshot de Figma con ~2 % de error):

| Ítem | Texto | Caja (+16 padding +2 borde) |
|---|---:|---:|
| NOSOTROS | 90 | 108 |
| PREGRADO | 88 | 106 |
| POSTGRADO | 101 | 119 |
| EDUCACIÓN CONTINUA | 187 | 205 |
| INVESTIGACIÓN | 126 | 144 |
| DIFUSIÓN | 76 | 94 |
| VIME | 40 | 58 |
| ALUMNI | 63 | 81 |
| **Total** | | **916** |

La fila disponible a 1440 px es 1320 − logo 160 − gap 32 − redes 132 − gap 32 = **964 px**.
Es decir, **48 px de holgura para 7 huecos: 6,8 px cada uno**. Esa es la separación del diseño.

**El bug:** yo tenía `justify-content: space-between` con `flex-wrap: wrap`. Cuando el menú se
parte en dos filas —cosa que pasa en todo lo que baje de 1440 px— `space-between` reparte el
sobrante entre los pocos ítems de la primera fila y los abre hasta **62 px**. Eso era lo que se veía
demasiado separado.

**Corregido a `flex-start` con hueco fijo de 6 px** (`--nav-menu-gap`), que da separación constante
en cualquier ancho y cabe en una sola línea desde 1440 px, igual que el frame.

| Viewport | Antes (1ª fila) | Ahora |
|---:|---:|---:|
| 1024 | 22 px | 6 px |
| 1200 | 62 px | 6 px |
| 1320 | 40 px | 6 px |
| 1440+ | 22 px, en 2 filas | 6 px, **1 fila** |

Ojo con esto: a 1440 px sobran **6 px**. Si alguna vez se agrega un ítem al menú, o se alarga una
etiqueta, o Inter no carga y el navegador cae a una fuente más ancha, se parte en dos filas. Si
quieres margen de maniobra real hay que acortar etiquetas o bajar el tamaño de fuente del menú.

El submenú no lo toqué: mantiene los **20 px** de gap que define Figma, y ahí sí hay espacio de
sobra (la fila mide 881 px contra 964 disponibles).

---

## 0.1 Ancho máximo de las barras — 1320 px, **sin verificar en el sitio**

No pude leer el CSS de `dcc.uchile.cl`: la herramienta de fetch devuelve el HTML procesado pero se
cuelga con archivos `.css`, y la extensión de Chrome —que sí me dejaría leer el valor computado—
no está conectada. Así que **1320 px es una inferencia**, aunque con dos fuentes que coinciden:

1. **El propio Figma.** El frame de la nav mide 1440 y tiene 60 px de padding lateral:
   1440 − 120 = **1320** de contenido.
2. **Bootstrap 5.** El marcado del sitio usa `offcanvas`, nomenclatura exclusiva de Bootstrap 5,
   y ahí `.container` topa justamente en **1320 px** desde 1400 px de viewport.

Que el número de Figma y el de Bootstrap coincidan exactamente es buena señal, pero no es lo mismo
que medirlo. **Si al inspeccionarlo sale otro valor, cambia una sola línea:**

```css
:root { --container-max: 1320px; }   /* styles.css, bloque de tokens */
```

### Cómo quedó implementado
La banda de color sigue a sangre completa y sólo el contenido se centra y se topa — que es como se
comporta `dcc.uchile.cl`. El mecanismo es una canaleta fluida, sin wrappers extra en el HTML:

```css
padding-inline: max(<padding-mínimo>, calc((100% - var(--container-max)) / 2));
```

| Viewport | Padding nav institucional | Contenido |
|---:|---:|---:|
| 390 | 20 | 350 |
| 768 | 20 | 728 |
| 1024 | 32 | 960 |
| 1200 | 60 | 1080 |
| **1440** | **60** | **1320** ← reproduce el frame de Figma exacto |
| 1920 | 300 | 1320 |
| 2560 | 620 | 1320 |

Bajo 1440 px manda el padding mínimo del diseño (60 px en la nav institucional y el footer, 40 px
en la nav de aplicación); sobre 1440 px manda el tope de 1320. Los títulos de sección y la vitrina
de estados usan la misma canaleta, así que todo queda alineado en la misma columna.

El contenedor general del styleguide sigue en 1200 px (`--page-max`): es andamiaje mío, no parte
del kit. Si quieres unificarlo con 1320, dímelo.

---

## 0. Corregido en esta revisión

**Los estados del menú estaban mal.** Tenías razón: la selección del submenú no es un subrayado
rojo. Leí los dos component sets y estos son los estados reales, ya implementados:

| | Default | Hover | Active |
|---|---|---|---|
| **Menú Principal** (`128:774`) | borde 1px `Grey/Default` (invisible sobre el fondo) | **sólo contorno rojo**, sin relleno | **relleno rojo** `#D23118` |
| **Menú Secundario** (`128:1005`) | borde 1px `Grey/Default` (invisible) | borde 1px `Grey/Light` `#5D7C8E` | **borde 1px blanco** `#FCFDFE` |

Yo tenía el hover del menú principal con relleno rojo (es sólo contorno) y el submenú como texto
plano con subrayado rojo al pasar el cursor (son *chips* con borde, y la selección es blanca).

**El submenú no eran textos sueltos, eran chips.** Alto 30&nbsp;px, padding 4/8, radio 4&nbsp;px en
las cuatro esquinas, y **gap de 20&nbsp;px** entre ellos con el contenedor a `padding-top: 12px`.
Eso es lo que resuelve que se vieran pegados: yo tenía `space-between` con 8&nbsp;px y sin caja.

**La barra ahora ocupa todo el ancho.** La sección Nav sale del contenedor de 1200&nbsp;px y va de
borde a borde del viewport (`.section--bleed`). El menú principal reparte con `space-between` como
en Figma, con un `column-gap` mínimo de 16&nbsp;px para que nunca se toquen, y hace `wrap` antes de
colapsar. Los títulos y notas siguen centrados en la columna de 1200&nbsp;px.

**Agregué una vitrina de estados** al final de la sección Nav, con Default / Hover / Active de ambos
componentes lado a lado. No está en Figma como frame, pero los component sets sí existen.

---

Fuente: `figma.com/design/Zlsslv2Q26TFqKxuVOFE0B/UI-KIT-DCC`, página **Design Kit** (1.941 nodos).
Todo lo que no está listado aquí salió directo de las Variables, los estilos de texto y el contexto
de diseño de Figma, con las medidas verificadas una por una (28/28).

---

## 1. Bloqueantes — necesito algo de tu parte

### 1.1 Faltan 3 logotipos
El entorno donde corro no puede descargar desde `figma.com`. El HTML ya los enlaza: sólo reemplaza
el archivo y todo calza.

| Archivo | Medida | Nodo en Figma | Estado |
|---|---|---|---|
| `assets/logo-dcc.svg` | 160 × 79 | `128:802` | ✅ instalado (`DCC BLANCO.svg`) |
| `assets/logo-uchile.svg` | 225 × 95 | `133:2169` | ⬜ placeholder |
| `assets/logo-fcfm.svg` | 249 × 87 | `133:2170` | ⬜ placeholder |
| `assets/logo-cna.svg` | 400 × 117 | `145:269` | ⬜ placeholder |

El SVG que enviaste viene con `viewBox 720.2 × 354.9` (aspecto 2,029) y la caja de Figma es
160 × 79 (aspecto 2,025) — calza con 0,2 % de diferencia, imperceptible. Es de relleno blanco,
así que funciona sobre el fondo `Grey/Default` de la nav y del footer, pero **no sirve sobre fondo
claro**; si lo necesitas ahí, hará falta la versión en color.

En Figma: selecciona el nodo → panel Export → SVG → Export, y guarda con ese nombre exacto.

### 1.2 Los íconos sociales los dibujé yo
LinkedIn, Instagram, Facebook y YouTube son glifos simplificados que escribí a mano, **no** los
exports del kit (mismo bloqueo de red). Están inline en `index.html`, en el bloque `<defs>` al
inicio, con los ids `#i-linkedin`, `#i-instagram`, `#i-facebook`, `#i-youtube`. Si el kit usa
versiones oficiales, exporta los nodos `128:884`–`128:887` y reemplaza esos cuatro `<g>`.

### 1.3 Discrepancia real en el archivo
El swatch **Grey / Ultralight** tiene la etiqueta `#F6F9FB`, pero la Variable de Figma que consumen
los componentes (cabecera de tabla, badge ultralight, borde activo del sidebar) vale `#E2ECF3`.
Usé el valor de la Variable. Uno de los dos está desactualizado — dime cuál.

---

## 2. Decisiones de alcance

**El archivo no tiene pantallas.** No hay ni un frame de página, ni versiones móvil/tablet: son
9 secciones de biblioteca (Color, Typography, Icons, Buttons, Table, Badge/Tags, Selection Control,
Alert, Nav) más 3 sets de componentes. Así que construí una **styleguide navegable** del kit
completo, no una maqueta de sitio.

**Los ~1.500 íconos Lucide no están.** Sólo incluí los 13 que los componentes realmente usan
(`smile`, `info`, `circle-check`, `circle-user`, `users`, `plus`, `phone`, `mail`, `menu`, `check`,
`minus`, más `circle-alert` de repuesto). Vienen del paquete oficial `lucide-static` v1.33.0 (ISC),
que es la misma fuente que el kit referencia en las descripciones de componente.

---

## 3. Responsive — todo esto es inferido

Figma sólo define **1440 px**. No existe ningún frame de móvil ni tablet, así que los tres
breakpoints los deduje yo:

| Breakpoint | Qué cambia |
|---|---|
| **≤ 1024 px** | Swatches a 2 columnas, tipografía a 1 columna, menú del nav institucional pasa a wrap, título de app 36→28 px, footer a columnas fluidas |
| **≤ 768 px** | **Botón hamburguesa** en el nav institucional (no existe en Figma), menú y submenú verticales a ancho completo conservando la caja del chip, sidebar a ancho completo, footer apilado, logo DCC 160→120 px, Display 48→36 px |
| **≤ 480 px** | Swatches y badges a 1 columna, alerts a ancho completo |

Dos decisiones concretas dentro de eso:

- **La tabla hace scroll horizontal** en pantallas angostas en vez de reordenarse a tarjetas. Preferí
  no inventar un layout que el diseño no define. Si prefieres tarjetas apiladas, se cambia rápido.
- **El menú hamburguesa** es invención pura: markup, ícono (`menu` de Lucide), animación de apertura
  y estados `aria-expanded`. Nada de eso está diseñado.

---

## 4. Traducciones de Figma a HTML

- **Estados Default/Hover** son variantes separadas en Figma; los implementé como `:hover` real
  (más `:focus-visible`, para teclado). En botones y links el hover es rojo `#D23118`; en los menús,
  ver la tabla de la sección 0.
- **Botones secundarios**: en Figma el padding es 2 px menor que el primario en cada tamaño, porque
  el borde de 2 px lo compensa. Usé `box-sizing: border-box` con el mismo padding, así el tamaño
  exterior coincide.
- **Selection Control**: en Figma están aplanados como vectores. Los reconstruí con `<input>`
  nativos — accesibles, navegables con teclado — respetando medidas (checkbox y radio 20 px, switch
  36×20, borde 2 px `Grey/Light`). El radio marcado engrosa el borde a 6 px, tal como el diseño.
- **Tabla**: en Figma son 4 columnas independientes; aquí es un `<table>` semántico con `<thead>`.
- **Línea roja bajo el menú institucional**: es un vector suelto sin grosor declarado. Asumí
  `border-bottom: 2px`.
- **Separadores del sidebar**: mismo caso, asumí 1 px blanco al 35 %.
- **Alto del sidebar**: el frame mide 1099 px porque es una vitrina. Puse `min-height: 620px` para
  que se vea completo sin dominar la página.

---

## 5. Dos cosas que probablemente sean bugs del diseño

1. **El Alert de error usa el glifo `info`**, no `circle-alert` (nodo `124:8032`). Lo repliqué tal
   cual. Si fue descuido, en `index.html` cambia el `<use href="#i-info"/>` del alert rojo por
   `#i-circle-alert` — ya lo dejé definido.
2. **La fuente `Adelle Sans`** aparece en el componente *Menú Secundario* (nav de app y sidebar),
   pero es de licencia comercial y el resto del kit usa Inter. Caí a Inter. Si tienen licencia,
   cambia `--font-body` o agrega una regla específica.

---

## 6. Detalles menores

- Fuentes **Poppins 700** e **Inter 400/500/700 + itálicas** por Google Fonts, con fallback de
  sistema. Requiere internet la primera vez; si necesitas que funcione offline, se auto-alojan.
- El fondo de página usa `Grey/Ultralight` y cada sección es una tarjeta blanca con radio 16 px,
  que es como se ven los frames en el canvas de Figma.
- Los textos de ejemplo ("Label", "Lorem ipsum dolor", "Title") se mantuvieron literales del kit.
- Agregué un índice de secciones arriba y notas azules dentro de cada sección donde me desvié.
  Nada de eso está en Figma; bórralo si estorba.
