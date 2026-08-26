# Cómo publicar y mantener esto

El repositorio **ya está creado y publicado** en GitHub:

<https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit>

Esta guía cubre lo que queda por hacer y el día a día. No da por sabido nada de git.

---

## Cinco palabras que vas a leer

| Palabra | Qué es |
|---|---|
| **Repositorio** | La carpeta del proyecto con todo su historial. La tuya es `~/Documents/dcc-ui-kit`. |
| **Commit** | Una foto guardada del proyecto, con un mensaje que dice qué cambió. |
| **Remoto** | La copia que vive en GitHub. Ya está conectada, se llama `origin`. |
| **Push** | Subir tus commits al remoto. Es la acción de "publicar". |
| **Tag** | Una etiqueta que marca una versión. La primera se llama `v1.0.0`. |

---

## Lo que ya está hecho

- [x] Repositorio creado en la organización `DCC-FCFM-UCHILE`, público
- [x] Remoto `origin` conectado a tu carpeta
- [x] `gh` instalado y con tu sesión iniciada
- [x] Tag `v1.0.0` subido
- [x] Protección de la rama `main`: exige pull request y que pasen las verificaciones
- [x] GitHub Pages activo: el styleguide se republica en cada push a `main`
- [x] El kit publica su JavaScript: la instalación son dos etiquetas (v1.1.0)

---

## Lo que falta

### ~~Activar el styleguide como página web~~ — hecho

El styleguide ya está publicado y se actualiza solo en cada push a `main`:

<https://dcc-fcfm-uchile.github.io/dcc-ui-kit/>

### Montar el CDN

Hoy el README y la guía de consumo apuntan a `https://cdn.dcc.uchile.cl/ui-kit/1.0.0/`. **Ese
dominio todavía no sirve nada.** Hasta que alguien lo monte, ninguna app puede consumir el kit por
URL.

Para montarlo:

1. Copia la carpeta `dist/` completa al servidor, dentro de `/ui-kit/1.0.0/`.
2. Configura las cabeceras que pide la sección 7 de [`dist/README.md`](dist/README.md). El
   `Access-Control-Allow-Origin` **no es opcional**: sin él las fuentes fallan en silencio.
3. Cada versión nueva va en su propia carpeta —`/ui-kit/1.1.0/`— y **nunca encima de una anterior**,
   porque las apps que usan la versión vieja se romperían.

Mientras tanto, las apps con build (React, Vue) sí pueden consumirlo ya:

```bash
npm i github:DCC-FCFM-UCHILE/dcc-ui-kit#v1.0.0
```

---

## El día a día

Cada vez que cambies algo del kit, son siempre los mismos comandos, en este orden:

```bash
cd ~/Documents/dcc-ui-kit

npm run build     # 1. regenera la carpeta dist/ con tus cambios
npm test          # 2. comprueba que no rompiste nada
git add -A        # 3. marca todos los cambios para guardar
git commit -m "Describe acá qué cambiaste"    # 4. guarda la foto
git push          # 5. sube a GitHub
```

**El paso 1 no es opcional.** Si editas `src/styles.css` y no corres `npm run build`, lo publicado
queda distinto del código fuente y el CI te va a rechazar el cambio.

**El paso 2 tampoco.** Si sale `28 verificaciones pasan, 0 fallan`, vas bien. Si alguna falla, el
mensaje dice cuál y por qué; arréglalo antes de seguir.

### Si el push te rebota

La rama `main` está protegida: exige pull request. Como eres administrador de la organización puedes
saltártela, pero lo limpio es proponer el cambio:

```bash
git checkout -b mi-cambio
git push -u origin mi-cambio
gh pr create --fill
```

GitHub corre solo las 28 verificaciones. Cuando pasen, mezclas con `gh pr merge --squash`.

### Cuando quieras publicar una versión nueva

```bash
# 1. Edita "version" en package.json (ej: de 1.0.0 a 1.1.0)
# 2. Anota los cambios en CHANGELOG.md
# 3. Actualiza los números de versión de las URLs en README.md y dist/README.md
npm run build && npm test
git add -A && git commit -m "Versión 1.1.0"
git tag v1.1.0
git push && git push --tags
```

Y copia `dist/` al servidor en la carpeta nueva, como dice arriba.

> **Cuidado con el paso 3.** Los números de versión de las URLs se escriben a mano: el build no los
> genera. Ya pasó una vez que la guía de consumo quedó apuntando a una versión que no existía.

---

## Si el CI falla

Entra a <https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit/actions> y abre la corrida roja. O desde la
terminal:

```bash
gh run list --limit 5
```

Para ver por qué falló la última:

```bash
gh run view --log-failed
```

Los dos fallos típicos:

| Mensaje | Qué pasó | Qué hacer |
|---|---|---|
| `dist/ no coincide con src/` | Editaste `src/` y no reconstruiste | `npm run build`, commitea de nuevo |
| `Dependencies lock file is not found` | Falta `package-lock.json` en el repositorio | Tiene que estar versionado; no lo agregues a `.gitignore` |
| `Get Pages site failed` | Pages se desactivó | Settings → Pages → Source: GitHub Actions |
| `las URLs de la documentación apuntan a…` | Subiste la versión y quedaron URLs viejas | Actualiza los números en `README.md` y `dist/README.md` |

---

## Pendientes antes de considerarlo terminado

Nada de esto impide publicar, pero conviene resolverlo:

- [ ] Montar `cdn.dcc.uchile.cl` (ver arriba) — sin eso el kit no se puede consumir por URL
- [ ] Reemplazar los logotipos de U. de Chile, FCFM y CNA en `src/assets/` — son marcadores de
      posición, no los logos reales (no se pudieron exportar desde Figma)
- [ ] Reemplazar `src/assets/card-media.svg` por una imagen real, en proporción 3:2
- [ ] Decidir si los badges `subtle` de LightBlue y Green suben de contraste — hoy quedan bajo el
      mínimo de accesibilidad (ver `docs/decisiones-de-diseno.md`)
- [ ] Decidir si un ícono suelto —fuera de un componente del kit— debe tener tamaño por defecto.
      Hoy se renderiza 0×0 sin avisar (ver sección 3 de `dist/README.md`)
