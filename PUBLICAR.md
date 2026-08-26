# Cómo subirlo a GitHub

El repositorio ya está inicializado, con el commit inicial y el tag `v1.0.0`. Falta crear el remoto
y empujar — eso requiere tus credenciales, así que lo tienes que correr tú.

## 1. Crear el repositorio en GitHub

Con [GitHub CLI](https://cli.github.com), desde esta misma carpeta:

```bash
gh repo create DCC-FCFM-UCHILE/dcc-ui-kit \
  --public \
  --source=. \
  --description "Sistema de diseño del DCC, Universidad de Chile" \
  --push
```

O a mano: crea `DCC-FCFM-UCHILE/dcc-ui-kit` **vacío** en github.com —sin README, sin .gitignore, sin
licencia, porque ya vienen— y luego:

```bash
git remote add origin git@github.com:DCC-FCFM-UCHILE/dcc-ui-kit.git
git push -u origin main
git push --tags
```

## 2. Activar GitHub Pages

`Settings → Pages → Source: GitHub Actions`.

El workflow ya está configurado: publica el styleguide en cada push a `main`, después de que pasen
las verificaciones. Queda en:

```
https://dcc-fcfm-uchile.github.io/dcc-ui-kit/
```

## 3. Proteger `main`

`Settings → Branches → Add rule` sobre `main`:

- Require a pull request before merging
- Require status checks to pass → marcar **Build y verificaciones**

Ese check es el que impide que `dist/` se desincronice del fuente.

## 4. Publicar al CDN

```bash
scp -r dist/* servidor:/var/www/cdn/ui-kit/1.0.0/
```

Carpeta nueva por versión, nunca sobrescribir. Las cabeceras que debe servir están en
[`dist/README.md`](dist/README.md), sección 7 — sobre todo `Access-Control-Allow-Origin`, sin la cual
las fuentes fallan en silencio.

## 5. Antes del primer release público

- [ ] Reemplazar los logotipos placeholder de U. de Chile, FCFM y CNA (`src/assets/`)
- [ ] Reemplazar `src/assets/card-media.svg` por la imagen real, proporción 3:2
- [ ] Confirmar la URL del CDN en `README.md` y en `dist/README.md`
- [ ] Decidir si los badges `subtle` de LightBlue y Green suben de contraste
      (hoy quedan bajo AA; ver `docs/decisiones-de-diseno.md`)
