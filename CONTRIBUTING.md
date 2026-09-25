# Cómo contribuir

## Flujo

Si no manejas git, [`PUBLICAR.md`](PUBLICAR.md) explica el ciclo completo paso a paso.

```bash
npm install               # sólo la primera vez
npm start                 # sirve el proyecto en http://localhost:4173/site/
# editar src/styles.css o un fragmento de src/sitio/componentes/
npm run build             # regenera dist/ y site/ con los cambios
npm test                  # 28 verificaciones
```

`dist/` se versiona en el repositorio y el CI comprueba que coincida con lo que produce el build.
**Si cambias `src/`, corre `npm run build` antes de commitear** o el CI va a fallar con
`dist/ o site/ no coinciden con src/`.

La documentación (`site/`) es a la vez la vitrina y el entorno de trabajo: una portada con todos los
componentes y una página por cada uno, con todas sus variantes y estados. Se genera desde
`src/sitio/`. Para agregar un componente, crea `src/sitio/componentes/<slug>.html`: empieza con una
cabecera (`titulo`, `grupo`, `resumen`, `miniatura`; ver `scripts/sitio.mjs`) y cada demo va en un
`<div class="dcc-doc-demo">`. El build le agrega debajo el HTML listo para copiar, y el componente
aparece solo en la portada y en la navegación.

## Reglas del kit

1. **Prefija todo.** Clases con `dcc-`, variables con `--dcc-`. Sin excepciones salvo `is-*`
   (estado) y `js-*` (ganchos de JavaScript, sin estilos).

2. **Nada de selectores por etiqueta descendiente en el andamiaje.** `.dcc-section h3` alcanza
   cualquier `h3` dentro de cualquier componente y le gana por especificidad. Este error causó tres
   bugs durante el desarrollo. El andamiaje de la documentación usa clases `dcc-doc-*`, y el build las saca de `dist/`.

3. **Usa los tokens.** Si necesitas un color que no está en la paleta, agrégalo como token derivado
   del perfil HSL del resto — no lo escribas suelto en una regla.

4. **Verifica el contraste** antes de elegir un color: 4,5:1 para texto pequeño, 3:1 para gráficos e
   íconos. Varios colores de Figma no llegan; `docs/decisiones-de-diseno.md` lista cuáles.

5. **Cada componente interactivo necesita teclado.** Si se usa con mouse, tiene que poder usarse sin
   él. El arrastre de tarjetas, por ejemplo, también funciona con las flechas.

6. **Respeta `prefers-reduced-motion`** en cualquier animación.

## Íconos

Vienen de [Lucide](https://lucide.dev) **0.544.0**, pineado. Para agregar uno, copia su contenido a
`<defs>` en `src/icons.svg` como `<g id="i-nombre">` y corre `npm run build`.

No pongas `stroke-width` ni `fill` como atributo en el `<g>`: los atributos de presentación le ganan
a la herencia CSS y después no se pueden sobrescribir por instancia. Eso deja los íconos imposibles
de ajustar, y ya pasó dos veces.

## Publicar

1. Sube la versión en `package.json` y anota los cambios en `CHANGELOG.md`.
2. `npm run build && npm test`.
3. Commit, tag `vX.Y.Z` y push.
4. Copia `dist/` al servidor en `/ui-kit/X.Y.Z/`. **Carpeta nueva, nunca sobrescribir una anterior.**
