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

La configuración de nginx ya está escrita y en `main` del repositorio
[web-config](https://github.com/DCC-FCFM-UCHILE/web-config), junto con el script que publica las
versiones. Falta **desplegarla**, que se hace una sola vez:

```bash
ssh -p210 apps 'cd ~/apps/web-config/produccion && make update && make build && make ui-kit'
```

Eso deja el kit servido en `https://apps.dcc.uchile.cl/ui-kit/<versión>/`.

Y después, para que las versiones nuevas se publiquen solas, instala el cron (una vez):

```cron
*/10 * * * * $HOME/apps/web-config/common/scripts/publicar-ui-kit.sh >> $HOME/logs/ui-kit.log 2>&1
```

Para que además funcione `cdn.dcc.uchile.cl` hay que pedirle a sistemas que apunte el subdominio a
ese host y lo incluya en el terminador TLS. El vhost ya está escrito y esperando.

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
# 1. Edita "version" en package.json (ej: de 1.1.0 a 1.2.0)
# 2. Anota los cambios en CHANGELOG.md
# 3. Actualiza los números de versión de las URLs en README.md y dist/README.md
npm run build && npm test
git add -A && git commit -m "Versión 1.2.0"
git tag v1.2.0
git push && git push --tags
```

**El tag es lo que publica.** Con el cron instalado, dentro de los 10 minutos siguientes la versión
aparece sola en el CDN. No hay que entrar al servidor ni copiar nada.

Si no quieres esperar:

```bash
ssh -p210 apps 'cd ~/apps/web-config/produccion && make ui-kit'
```

> **Un push a `main` sin tag no publica nada**, y está bien que así sea: las carpetas de versión son
> inmutables porque las apps clavan la versión en la URL. Si cambias el CSS, sube la versión. Para
> ver cambios sin publicar está el styleguide, que sí se actualiza en cada push.

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

- [ ] Desplegar el CDN: `make update && make build && make ui-kit` en el servidor, más el cron
      (ver arriba). La configuración ya está escrita; falta aplicarla
- [ ] Pedir a sistemas el DNS de `cdn.dcc.uchile.cl` y su inclusión en el terminador TLS
- [ ] Reemplazar los logotipos de U. de Chile, FCFM y CNA en `src/assets/` — son marcadores de
      posición, no los logos reales (no se pudieron exportar desde Figma)
- [ ] Reemplazar `src/assets/card-media.svg` por una imagen real, en proporción 3:2
- [ ] Decidir si los badges `subtle` de LightBlue y Green suben de contraste — hoy quedan bajo el
      mínimo de accesibilidad (ver `docs/decisiones-de-diseno.md`)
- [ ] Decidir si un ícono suelto —fuera de un componente del kit— debe tener tamaño por defecto.
      Hoy se renderiza 0×0 sin avisar (ver sección 3 de `dist/README.md`)
- [ ] Decidir qué hacer con los resets de elemento **sin prefijar** (`a`, `p`, `ul`, `hr`, `img`,
      `svg`, `button`, `table`). Contradicen la promesa de que "el kit convive con lo que la app ya
      tenga": al integrarlo en el Portal SSO le cambiaron la tipografía, el color de los enlaces y
      los márgenes a toda la aplicación. El paliativo es cargar el kit antes que Bootstrap, pero la
      solución de fondo es que cada componente declare lo que necesita en vez de apoyarse en un
      reset global. Ver la advertencia del paso 2 en `docs/integracion-django.md`
