# Integrar el DCC UI Kit en una app Django

Instrucciones para consumir el sistema de diseño del DCC desde una aplicación Django.

## Lo esencial

El kit son **dos archivos servidos por URL**. No hay build, no hay npm, no se copia nada dentro del
proyecto y no hay que llamar a ninguna función.

| Archivo | Peso | Qué trae |
|---|---|---|
| `dcc-ui.min.css` | 48 KB (8.7 KB con gzip) | Los 23 componentes, 51 tokens y las fuentes Inter y Poppins |
| `dcc-ui.bundle.min.js` | 20 KB | Los 36 íconos y el comportamiento de los componentes |

Actualizar el kit en la app es cambiar el número de versión de la URL. Nada más.

## Qué URL usar hoy

El CDN institucional está configurado pero **todavía no desplegado**. Mientras tanto el kit se sirve
desde GitHub Pages, que ya funciona y entrega las cabeceras CORS que necesitan las fuentes:

```
https://dcc-fcfm-uchile.github.io/dcc-ui-kit/dist
```

> **Esta URL no está versionada:** sirve siempre lo último de `main`. Sirve para integrar y
> desarrollar, pero antes de salir a producción hay que moverse al CDN, que sí da rutas inmutables
> por versión. El paso 1 está pensado para que ese cambio sea de una línea.

Cuando el CDN esté arriba, la URL pasa a ser
`https://cdn.dcc.uchile.cl/ui-kit/1.1.0` —o `https://apps.dcc.uchile.cl/ui-kit/1.1.0`, que no
depende de que se cree el subdominio—.

---

## 1. Define la URL base en `settings.py`

No pongas la URL a mano en las plantillas. Si queda repetida, migrar al CDN significa buscarla por
todo el proyecto.

```python
# settings.py
DCC_UI_KIT = "https://dcc-fcfm-uchile.github.io/dcc-ui-kit/dist"
```

```python
# tu_app/context_processors.py
from django.conf import settings

def dcc_ui_kit(request):
    return {"DCC_UI_KIT": settings.DCC_UI_KIT}
```

```python
# settings.py — dentro de TEMPLATES
"OPTIONS": {
    "context_processors": [
        # ...los que ya tengas
        "tu_app.context_processors.dcc_ui_kit",
    ],
},
```

## 2. Agrega las dos etiquetas al `base.html`

```django
{# templates/base.html #}
<link rel="stylesheet" href="{{ DCC_UI_KIT }}/dcc-ui.min.css">
<script src="{{ DCC_UI_KIT }}/dcc-ui.bundle.min.js" defer></script>
```

Eso es toda la instalación. El bundle inyecta los íconos y enlaza los componentes solo, al terminar
de cargar la página.

## 3. Usa las clases

Todo va prefijado con `dcc-`, para que el kit conviva con Bootstrap o lo que la app ya tenga.

```django
<button class="dcc-btn dcc-btn--md dcc-btn--primary-grey">Guardar</button>

<div class="dcc-alert dcc-alert--info">
  <svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-info"/></svg>
  El plazo vence el viernes.
</div>
```

Hay dos familias **sin** prefijo, a propósito:

- `is-*` — estado (`is-open`, `is-active`). Siempre bajo un padre prefijado.
- `js-*` — ganchos de JavaScript. No tienen estilos; no los uses para maquetar.

El catálogo completo, con cada variante y su markup, está en el
[styleguide](https://dcc-fcfm-uchile.github.io/dcc-ui-kit/).

## 4. Íconos

Son 36, de Lucide. Se referencian por `id`, sin rutas:

```django
<svg class="dcc-icon dcc-i" viewBox="0 0 24 24"><use href="#i-check"/></svg>
```

**El tamaño lo pone el componente que lo contiene**, no el ícono. `.dcc-btn` lo deja en 16px,
`.dcc-alert` en 24px, `.dcc-badge` en 12px.

> **Un ícono suelto en tu propio markup se renderiza 0×0.** No se ve nada y no hay error en
> consola. Si necesitas uno fuera de un componente del kit, ponle el tamaño tú:
> `<svg class="dcc-i" viewBox="0 0 24 24" width="20" height="20">`.

La clase `.dcc-i` es obligatoria en todos los casos: es la que fija el grosor de trazo.

## 5. Contenido que llega sin recargar la página

Si usas **htmx no tienes que hacer nada**: el kit escucha `htmx:afterSwap` y enlaza lo que llegue.

Si insertas HTML por otra vía —una respuesta AJAX, un modal— avísale al kit:

```js
DCCUI.init(elementoNuevo);
```

Es idempotente: enlaza cada elemento una sola vez, así que llamarlo de más no duplica manejadores.

## 6. Paginación

El kit aporta las clases; la paginación la resuelve el `Paginator` de Django como siempre. El
bloque de JavaScript de paginación del styleguide es sólo una demostración del estado visual.

---

## Advertencias

**No copies los archivos dentro del proyecto.** Es exactamente lo que este montaje evita. Si los
copias, la app deja de recibir las correcciones del kit y las copias derivan entre sí.

**Si la app tiene Content-Security-Policy**, hay que permitir el origen del kit en `style-src`,
`script-src` y `font-src`. Es la causa más común de que no cargue nada estando todo bien.

**En React o Vue usa sólo el CSS**, no el bundle: enlaza manejadores sobre el DOM, que es justo lo
que esos frameworks quieren administrar. Para el comportamiento, Radix o Headless UI con las clases
del kit.

## Verificación

Cuando termines, comprueba estas cuatro cosas en el navegador:

1. El cuerpo de la página se ve en **Inter** — si sale en la tipografía del sistema, las fuentes no
   cargaron (mira si hay error de CORS o de CSP en consola).
2. Un ícono dentro de un `.dcc-btn` mide **16×16**, no 0×0.
3. Un acordeón **abre y cierra** al hacer clic.
4. La consola está **sin errores**.

## Referencias

- [Styleguide](https://dcc-fcfm-uchile.github.io/dcc-ui-kit/) — catálogo de componentes con su markup
- [Guía de consumo](https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit/blob/main/dist/README.md) — detalle de cada caso
- [Repositorio](https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit)
