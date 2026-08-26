# Cómo contribuir

## Flujo

Si no manejas git, [`PUBLICAR.md`](PUBLICAR.md) explica el ciclo completo paso a paso.

```bash
npm install               # sólo la primera vez
npm start                 # sirve el proyecto; abre /src/styleguide.html
# editar src/styles.css y src/styleguide.html
npm run build             # regenera dist/ con los cambios
npm test                  # 18 verificaciones
```

`dist/` se versiona en el repositorio y el CI comprueba que coincida con lo que produce el build.
**Si cambias `src/`, corre `npm run build` antes de commitear** o el CI va a fallar con
`dist/ no coincide con src/`.

El styleguide (`src/styleguide.html`) es a la vez la documentación y el entorno de trabajo: cada
componente aparece con todas sus variantes y estados. Si agregas un componente, agrégalo ahí
también, o `npm test` va a avisar que tiene CSS sin uso.

## Reglas del kit

1. **Prefija todo.** Clases con `dcc-`, variables con `--dcc-`. Sin excepciones salvo `is-*`
   (estado) y `js-*` (ganchos de JavaScript, sin estilos).

2. **Nada de selectores por etiqueta descendiente en el andamiaje.** `.dcc-section h3` alcanza
   cualquier `h3` dentro de cualquier componente y le gana por especificidad. Este error causó tres
   bugs durante el desarrollo. El andamiaje del styleguide usa clases `dcc-sg-*`.

3. **Usa los tokens.** Si necesitas un color que no está en la paleta, agrégalo como token derivado
   del perfil HSL del resto — no lo escribas suelto en una regla.

4. **Verifica el contraste** antes de elegir un color: 4,5:1 para texto pequeño, 3:1 para gráficos e
   íconos. Varios colores de Figma no llegan; `docs/decisiones-de-diseno.md` lista cuáles.

5. **Cada componente interactivo necesita teclado.** Si se usa con mouse, tiene que poder usarse sin
   él. El arrastre de tarjetas, por ejemplo, también funciona con las flechas.

6. **Respeta `prefers-reduced-motion`** en cualquier animación.

## Íconos

Vienen de [Lucide](https://lucide.dev) **0.544.0**, pineado. Para agregar uno, copia su contenido a
`<defs>` en `src/styleguide.html` como `<g id="i-nombre">` y corre `npm run build`.

No pongas `stroke-width` ni `fill` como atributo en el `<g>`: los atributos de presentación le ganan
a la herencia CSS y después no se pueden sobrescribir por instancia. Eso deja los íconos imposibles
de ajustar, y ya pasó dos veces.

## Publicar

1. Sube la versión en `package.json` y anota los cambios en `CHANGELOG.md`.
2. `npm run build && npm test`.
3. Commit, tag `vX.Y.Z` y push.
4. Copia `dist/` al servidor en `/ui-kit/X.Y.Z/`. **Carpeta nueva, nunca sobrescribir una anterior.**
