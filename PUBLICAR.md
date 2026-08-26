# Cómo subir esto a GitHub

Guía paso a paso, sin dar por sabido nada de git. Sigue los pasos en orden.

Tiempo estimado: 15 minutos la primera vez.

---

## Antes de empezar: cinco palabras que vas a leer

No necesitas entender git a fondo, pero estas cinco aparecen todo el tiempo:

| Palabra | Qué es |
|---|---|
| **Repositorio** | La carpeta del proyecto, con todo su historial de cambios. La tuya es `~/Documents/dcc-ui-kit`. |
| **Commit** | Una foto guardada del proyecto en un momento dado, con un mensaje que dice qué cambió. Tu proyecto ya tiene 3. |
| **Remoto** | La copia que vive en GitHub. Ahora mismo **no tienes ninguno**: todo está sólo en tu computador. |
| **Push** | Subir tus commits al remoto. Es la acción de "publicar". |
| **Tag** | Una etiqueta que marca una versión. El tuyo se llama `v1.0.0`. |

Lo que vas a hacer es: crear el remoto en GitHub y hacer el primer push.

---

## Paso 1 — Instalar la herramienta de GitHub

Se llama `gh`. Sirve para no pelear con contraseñas y llaves, que es donde más gente se atasca.

Abre la **Terminal** (Cmd+Espacio, escribe "Terminal", Enter) y pega:

```bash
brew install gh
```

**Si te dice `command not found: brew`**, no tienes Homebrew. Descarga el instalador directo desde
<https://cli.github.com> — es un `.pkg`, doble clic y siguiente.

Para comprobar que quedó instalado:

```bash
gh --version
```

Deberías ver algo como `gh version 2.62.0`.

---

## Paso 2 — Conectar `gh` con tu cuenta

```bash
gh auth login
```

Te va a hacer cuatro preguntas. Responde así, moviéndote con las flechas y confirmando con Enter:

1. *What account do you want to log into?* → **GitHub.com**
2. *What is your preferred protocol?* → **HTTPS**
3. *Authenticate Git with your GitHub credentials?* → **Yes**
4. *How would you like to authenticate?* → **Login with a web browser**

Te muestra un código de 8 caracteres (tipo `A1B2-C3D4`). Cópialo, presiona Enter, se abre el
navegador, pegas el código y autorizas.

Al terminar deberías ver `✓ Logged in as tu-usuario`.

> **Por qué este paso importa.** Desde 2021 GitHub no acepta tu contraseña normal desde la terminal.
> `gh auth login` te configura las credenciales una sola vez y después git funciona solo. Si te
> saltas esto, el push del paso 4 va a fallar pidiendo una contraseña que no existe.

---

## Paso 3 — Situarte en la carpeta del proyecto

Todos los comandos que siguen tienen que correr **dentro** de la carpeta del proyecto:

```bash
cd ~/Documents/dcc-ui-kit
```

Para confirmar que estás en el lugar correcto:

```bash
git log --oneline
```

Deberías ver tres líneas, la primera terminando en *"Apunta las URLs a la organización
DCC-FCFM-UCHILE"*. Si en vez de eso sale `not a git repository`, estás en otra carpeta: repite el
`cd` de arriba.

---

## Paso 4 — Crear el repositorio y subirlo

Un solo comando hace las tres cosas: crea el repositorio en GitHub, lo conecta con tu carpeta y sube
los commits.

```bash
gh repo create DCC-FCFM-UCHILE/dcc-ui-kit \
  --public \
  --source=. \
  --description "Sistema de diseño del DCC, Universidad de Chile" \
  --push
```

Y después, para subir también la etiqueta de versión:

```bash
git push --tags
```

**Cómo saber que funcionó:** la terminal termina mostrando una URL. Ábrela — deberías ver tus
archivos y, abajo, el README.

```
https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit
```

### Si algo falla en este paso

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| `HTTP 403` o `Resource not accessible` | Tu cuenta no puede crear repositorios en esa organización | Ve a la sección "Si no tienes permisos" al final |
| `name already exists` | Ya existe un repositorio con ese nombre | Elige otro nombre, o usa el que ya existe (avísame y ajusto las URLs) |
| `could not read Username` | Falta el paso 2 | Corre `gh auth login` |

---

## Paso 5 — Publicar el styleguide como página web

Esto hace que el catálogo de componentes quede accesible por URL, para que cualquiera del equipo lo
vea sin descargar nada.

1. Entra a `https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit`
2. Pestaña **Settings** (arriba a la derecha)
3. En el menú de la izquierda, **Pages**
4. En *Source*, elige **GitHub Actions**

No hay que apretar Guardar: se aplica solo.

Espera 2 o 3 minutos y entra a:

```
https://dcc-fcfm-uchile.github.io/dcc-ui-kit/
```

> Ojo: la dirección va **toda en minúsculas**, aunque la organización se escriba con mayúsculas. Es
> una regla de GitHub, no un error.

---

## Paso 6 — Proteger la rama principal

Esto evita que alguien suba un cambio que rompa el kit sin darse cuenta.

1. **Settings** → **Branches** (menú izquierdo)
2. Botón **Add branch protection rule**
3. En *Branch name pattern* escribe: `main`
4. Marca **Require a pull request before merging**
5. Marca **Require status checks to pass before merging**
6. En el buscador que aparece, escribe y selecciona **Build y verificaciones**
7. Abajo del todo, **Create**

**Qué logras con esto:** cada vez que alguien proponga un cambio, GitHub corre solo las 18
verificaciones del proyecto. Si algo se rompe —una clase sin estilo, un ícono roto, el `dist/`
desactualizado— no deja mezclar el cambio. Es la red de seguridad del repositorio.

---

## Después: el día a día

Cada vez que cambies algo del kit, son siempre los mismos cinco comandos, en este orden:

```bash
cd ~/Documents/dcc-ui-kit

npm run build     # 1. regenera la carpeta dist/ con tus cambios
npm test          # 2. comprueba que no rompiste nada
git add -A        # 3. marca todos los cambios para guardar
git commit -m "Describe acá qué cambiaste"    # 4. guarda la foto
git push          # 5. sube a GitHub
```

**El paso 1 no es opcional.** Si editas `src/styles.css` y no corres `npm run build`, lo publicado
queda distinto del código fuente y GitHub te va a rechazar el cambio.

**El paso 2 tampoco.** Si sale `18 verificaciones pasan, 0 fallan`, vas bien. Si alguna falla, el
mensaje dice cuál y por qué; arréglalo antes de seguir.

### Cuando quieras publicar una versión nueva

Además de lo anterior:

```bash
# 1. Edita "version" en package.json (ej: de 1.0.0 a 1.1.0)
# 2. Anota los cambios en CHANGELOG.md
npm run build && npm test
git add -A && git commit -m "Versión 1.1.0"
git tag v1.1.0
git push && git push --tags
```

Y copia la carpeta `dist/` al servidor, en una carpeta nueva con el número de versión —nunca encima
de una anterior, porque las apps que usan la versión vieja se romperían.

---

## Si no tienes permisos en la organización

Es lo más probable si nunca has creado repositorios ahí. En ese caso:

**Pídele a quien administre `DCC-FCFM-UCHILE`** que cree un repositorio **vacío** llamado
`dcc-ui-kit`, público. Que **no** marque ninguna casilla de "Add a README", "Add .gitignore" ni
"Choose a license" — esos archivos ya existen en tu carpeta, y si GitHub crea los suyos los dos
historiales chocan y el push falla.

Cuando esté creado, tú corres:

```bash
cd ~/Documents/dcc-ui-kit
git remote add origin https://github.com/DCC-FCFM-UCHILE/dcc-ui-kit.git
git push -u origin main
git push --tags
```

Y sigues desde el paso 5.

---

## Pendientes antes de considerarlo terminado

Nada de esto impide publicar, pero conviene resolverlo:

- [ ] Reemplazar los logotipos de U. de Chile, FCFM y CNA en `src/assets/` — son marcadores de
      posición, no los logos reales (no se pudieron exportar desde Figma)
- [ ] Reemplazar `src/assets/card-media.svg` por una imagen real, en proporción 3:2
- [ ] Confirmar la dirección del CDN: hoy dice `cdn.dcc.uchile.cl` en `README.md` y en
      `dist/README.md`, que fue una suposición
- [ ] Decidir si los badges `subtle` de LightBlue y Green suben de contraste — hoy quedan bajo el
      mínimo de accesibilidad (ver `docs/decisiones-de-diseno.md`)
