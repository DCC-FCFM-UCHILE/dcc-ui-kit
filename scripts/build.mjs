#!/usr/bin/env node
/**
 * Build del DCC UI Kit.
 *
 *   node scripts/build.mjs          construye dist/
 *   node scripts/build.mjs --check  verifica que dist/ coincida con el fuente
 *
 * El modo --check es el que corre en CI: si alguien edita dist/ a mano o
 * cambia src/ sin reconstruir, el build falla y lo deja en evidencia.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "lightningcss";
import { minify } from "terser";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(raiz, "src");
const DIST = join(raiz, "dist");
const pkg = JSON.parse(readFileSync(join(raiz, "package.json"), "utf8"));
const VERSION = pkg.version;
const check = process.argv.includes("--check");

/* --------------------------------------------------------------------------
   1. Andamiaje del styleguide: existe sólo para la página de documentación y
      no debe viajar a las aplicaciones que consumen el kit.
   -------------------------------------------------------------------------- */
const ANDAMIAJE = [
  "dcc-page", "dcc-page-header", "dcc-toc", "dcc-section", "dcc-sg-h3", "dcc-sub-label",
  "dcc-palette-group", "dcc-swatches", "dcc-swatch", "dcc-chip", "dcc-meta", "dcc-name",
  "dcc-hex", "dcc-type-grid", "dcc-type-item", "dcc-type-spec", "dcc-type-sample",
  "dcc-demo-grid", "dcc-demo-stack", "dcc-surface-dark", "dcc-table-row",
  "dcc-menu-states", "dcc-nav-demo", "dcc-sidebar-demo", "dcc-phone",
];
const RE_ANDAMIAJE = new RegExp(
  `\\.(?:${ANDAMIAJE.join("|")})(?:__[\\w-]+|--[\\w-]+)?(?![\\w-])`
);

/** Recorre las reglas conservando comentarios y descarta las de andamiaje. */
function filtrar(texto) {
  const salida = [];
  let i = 0;
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const previo = texto.slice(i, m.index);
    i = re.lastIndex;
    const quedan = m[1].split(",").map((s) => s.trim())
      .filter((s) => s && !RE_ANDAMIAJE.test(s));
    if (quedan.length === 0) {
      // se descarta la regla y también el comentario que la precedía
      salida.push(previo.replace(/\/\*[^*]*(?:\*(?!\/)[^*]*)*\*\/\s*$/, ""));
      continue;
    }
    salida.push(previo + quedan.join(",\n") + " {" + m[2] + "}");
  }
  salida.push(texto.slice(i));
  return salida.join("");
}

/** Separa los @media para poder filtrarlos por dentro. */
function partirMedia(css) {
  const partes = [];
  let last = 0;
  const re = /@media[^{]*\{/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    let prof = 0, j = m.index + m[0].length - 1;
    for (;;) {
      if (css[j] === "{") prof++;
      else if (css[j] === "}" && --prof === 0) break;
      j++;
    }
    partes.push(["css", css.slice(last, m.index)]);
    partes.push(["media", css.slice(m.index, j + 1)]);
    last = j + 1;
    re.lastIndex = last;
  }
  partes.push(["css", css.slice(last)]);
  return partes;
}

const FUENTES = `/* Fuentes auto-hospedadas. Las rutas son relativas a este archivo, así que
   basta con mantener la carpeta fonts/ junto al CSS. */
@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(fonts/inter-latin-400-normal.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(fonts/inter-latin-ext-400-normal.woff2) format('woff2');unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(fonts/inter-latin-500-normal.woff2) format('woff2')}
@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(fonts/inter-latin-700-normal.woff2) format('woff2')}
@font-face{font-family:Inter;font-style:italic;font-weight:400;font-display:swap;src:url(fonts/inter-latin-400-italic.woff2) format('woff2')}
@font-face{font-family:Poppins;font-style:normal;font-weight:700;font-display:swap;src:url(fonts/poppins-latin-700-normal.woff2) format('woff2')}
`;

/* --------------------------------------------------------------------------
   2. CSS
   -------------------------------------------------------------------------- */
const fuenteCss = readFileSync(join(SRC, "styles.css"), "utf8");
const lib = partirMedia(fuenteCss).map(([tipo, txt]) => {
  if (tipo === "css") return filtrar(txt);
  const cab = txt.slice(0, txt.indexOf("{") + 1);
  const cuerpo = txt.slice(txt.indexOf("{") + 1, txt.lastIndexOf("}"));
  const f = filtrar(cuerpo).trim();
  return f ? `${cab}\n  ${f.replace(/\n/g, "\n  ")}\n}\n` : "";
}).join("").replace(/\n{3,}/g, "\n\n");

const cabecera = `/*! DCC UI Kit ${VERSION} — Departamento de Ciencias de la Computación, U. de Chile
   Todas las clases van prefijadas con dcc- y las variables con --dcc-, para no
   colisionar con el CSS de la aplicación que lo consume.
   Los íconos requieren la clase .dcc-i en el <svg>. */

`;
const cssCompleto = cabecera + FUENTES + "\n" + lib;
const cssMin = transform({
  filename: "dcc-ui.css",
  code: Buffer.from(cssCompleto),
  minify: true,
}).code.toString();

const tokens = [...lib.matchAll(/:root \{[^}]*\}/g)].map((m) => m[0]);
const tokensCss = `/*! DCC UI Kit ${VERSION} — tokens de diseño */\n\n${tokens.join("\n\n")}\n`;

/* --------------------------------------------------------------------------
   3. Sprite de íconos + inyector
      <use href="https://otro-origen/…"> está bloqueado por los navegadores, así
      que el sprite se embebe en un JS que lo inyecta en el documento.
   -------------------------------------------------------------------------- */
const guia = readFileSync(join(SRC, "styleguide.html"), "utf8");
const defs = guia.slice(guia.indexOf("<defs>") + 6, guia.indexOf("</defs>"));
const simbolos = [...defs.matchAll(/<g id="(i-[^"]+)"([^>]*)>([\s\S]*?)<\/g>/g)]
  .map(([, id, attrs, cuerpo]) =>
    `  <symbol id="${id}" viewBox="0 0 24 24"${attrs.trim() ? " " + attrs.trim() : ""}>` +
    `${cuerpo.replace(/\s+/g, " ").trim()}</symbol>`);
const sprite =
  `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n` +
  `<!-- DCC UI Kit ${VERSION} — iconos Lucide ${pkg.lucideVersion} (ISC). Version pineada a proposito. -->\n` +
  `${simbolos.join("\n")}\n</svg>\n`;

const iconosJs = `/*! DCC UI Kit ${VERSION} — inyector del sprite de íconos.
 *
 *  Por qué existe: <use href="https://otro-origen/icons.svg#id"> está BLOQUEADO
 *  por los navegadores. Un sprite servido desde el CDN no se puede referenciar
 *  directamente desde la app, y falla en silencio. Este script lleva el sprite
 *  embebido y lo inyecta, con lo cual <use href="#i-star"> pasa a ser una
 *  referencia local y funciona en cualquier origen.
 *
 *  Uso:  <script src=".../dcc-icons.js" defer></script>
 *        <svg class="dcc-i" viewBox="0 0 24 24"><use href="#i-star"/></svg>
 */
(function () {
  "use strict";
  var SPRITE = ${JSON.stringify(sprite)};
  function inyectar() {
    if (document.getElementById("dcc-icon-sprite")) return;
    var cont = document.createElement("div");
    cont.id = "dcc-icon-sprite";
    cont.setAttribute("aria-hidden", "true");
    cont.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    cont.innerHTML = SPRITE;
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inyectar);
  } else {
    inyectar();
  }
})();
`;

/* --------------------------------------------------------------------------
   4. Comportamiento
       El JavaScript de los componentes se publica como archivo, en vez de
       vivir embebido en el styleguide: si no, cada app tendría que copiarlo a
       mano y las copias derivarían entre sí.
   -------------------------------------------------------------------------- */
const comportamiento = readFileSync(join(SRC, "behaviors.js"), "utf8");

const banner = (que) => `/*! DCC UI Kit ${VERSION} — ${que} | MIT | ${pkg.homepage} */\n`;

const behaviorsJs = banner("comportamiento de los componentes") + comportamiento;

// El bundle es lo que instala una app corriente: sprite de íconos más
// comportamiento, en un solo archivo, para que la instalación sean dos
// etiquetas y no cuatro. Mismo criterio que bootstrap.bundle.js.
const bundleJs = banner("bundle (íconos + comportamiento)") + iconosJs + "\n" + comportamiento;

const minificar = async (js, nombre) => {
  const r = await minify(js, { format: { comments: /^!/ } });
  if (r.error) throw new Error(`terser falló en ${nombre}: ${r.error}`);
  return r.code + "\n";
};

/* --------------------------------------------------------------------------
   5. Assets compartidos
       Logotipos institucionales e imágenes que cualquier aplicación puede
       necesitar. Se publican tal cual, sin transformar: basta dejar el archivo
       en src/assets/ y reconstruir.

       Van como salidas —y no copiados aparte, como las fuentes— para que
       `--check` los cubra: si alguien edita dist/assets/ a mano, el CI falla.

       OJO: los logotipos del DCC, la FCFM, la Universidad y el CNA NO están
       cubiertos por la licencia MIT del kit. Son marcas institucionales y su
       uso se rige por las normas gráficas de la Universidad.
   -------------------------------------------------------------------------- */
const ASSETS = join(SRC, "assets");
const assets = {};
if (existsSync(ASSETS)) {
  for (const archivo of readdirSync(ASSETS).sort()) {
    if (archivo.startsWith(".")) continue;
    assets[`assets/${archivo}`] = readFileSync(join(ASSETS, archivo), "utf8");
  }
}

/* --------------------------------------------------------------------------
   6. Escritura y verificación
   -------------------------------------------------------------------------- */
const salidas = {
  "dcc-ui.css": cssCompleto,
  "dcc-ui.min.css": cssMin,
  "dcc-tokens.css": tokensCss,
  "dcc-icons.svg": sprite,
  "dcc-icons.js": iconosJs,
  "dcc-behaviors.js": behaviorsJs,
  "dcc-behaviors.min.js": await minificar(behaviorsJs, "dcc-behaviors.js"),
  "dcc-ui.bundle.js": bundleJs,
  "dcc-ui.bundle.min.js": await minificar(bundleJs, "dcc-ui.bundle.js"),
  ...assets,
};

const sri = (txt) => "sha384-" + createHash("sha384").update(txt).digest("base64");
salidas["SRI.txt"] =
  `DCC UI Kit ${VERSION} — hashes de integridad (sha384)\n\n` +
  ["dcc-ui.css", "dcc-ui.min.css", "dcc-tokens.css", "dcc-icons.js",
   "dcc-behaviors.js", "dcc-behaviors.min.js", "dcc-ui.bundle.js", "dcc-ui.bundle.min.js"]
    .map((f) => f.padEnd(22) + " " + sri(salidas[f])).join("\n") + "\n";

if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

let difieren = [];
for (const [nombre, contenido] of Object.entries(salidas)) {
  const destino = join(DIST, nombre);
  if (!check) mkdirSync(dirname(destino), { recursive: true });
  if (check) {
    const actual = existsSync(destino) ? readFileSync(destino, "utf8") : null;
    if (actual !== contenido) difieren.push(nombre);
  } else {
    writeFileSync(destino, contenido);
  }
}

// las fuentes se copian desde node_modules para no versionar binarios a mano
const FUENTES_SRC = [
  ["@fontsource/inter", "inter-latin-400-normal.woff2"],
  ["@fontsource/inter", "inter-latin-ext-400-normal.woff2"],
  ["@fontsource/inter", "inter-latin-500-normal.woff2"],
  ["@fontsource/inter", "inter-latin-700-normal.woff2"],
  ["@fontsource/inter", "inter-latin-400-italic.woff2"],
  ["@fontsource/poppins", "poppins-latin-700-normal.woff2"],
];
if (!check) {
  mkdirSync(join(DIST, "fonts"), { recursive: true });
  for (const [paquete, archivo] of FUENTES_SRC) {
    const origen = join(raiz, "node_modules", paquete, "files", archivo);
    if (existsSync(origen)) writeFileSync(join(DIST, "fonts", archivo), readFileSync(origen));
  }
}

if (check) {
  if (difieren.length) {
    console.error("✗ dist/ no coincide con src/. Archivos desincronizados:");
    difieren.forEach((f) => console.error("    " + f));
    console.error("\n  Corre `npm run build` y vuelve a commitear.");
    process.exit(1);
  }
  console.log("✓ dist/ está sincronizado con src/");
} else {
  const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + " KB";
  const nota = {
    "dcc-tokens.css": `(${tokens.length} bloques :root)`,
    "dcc-icons.svg": `(${simbolos.length} íconos)`,
    "dcc-ui.bundle.min.js": "← el que instalan las apps",
  };
  console.log(`DCC UI Kit ${VERSION} construido:`);
  for (const [nombre, contenido] of Object.entries(salidas)) {
    console.log(`  ${nombre.padEnd(22)} ${kb(contenido).padStart(8)}  ${nota[nombre] || ""}`.trimEnd());
  }
}
