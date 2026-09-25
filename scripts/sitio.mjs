/**
 * Sitio de documentación del DCC UI Kit.
 *
 * Arma site/ a partir de src/sitio/: una portada con todos los componentes
 * —como la de MUI— y una página por componente. Cada página sale de un
 * fragmento en src/sitio/componentes/<slug>.html que empieza con una cabecera:
 *
 *   <!--
 *   titulo: Botón
 *   grupo: Entradas
 *   resumen: Una frase que aparece bajo el título y en la portada.
 *   miniatura: .selector      el elemento que se muestra en la tarjeta de la portada
 *   escala: 0.6               opcional: cuánto se achica la miniatura
 *   ancho: 900px              opcional: el ancho al que se dibuja antes de achicarla
 *   -->
 *
 * Cada <div class="dcc-doc-demo"> recibe debajo su HTML listo para copiar, sin
 * el andamiaje de la documentación. `data-codigo="no"` lo omite.
 *
 * Lo llama scripts/build.mjs, que escribe o verifica las salidas junto con dist/.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";

const GRUPOS = [
  "Fundamentos", "Entradas", "Visualización de datos", "Retroalimentación",
  "Superficies", "Navegación",
];

// Envoltorios que existen sólo para ordenar la demo: en el código copiado se
// reemplazan por su contenido.
const ENVOLTORIOS = [".dcc-doc-row", ".dcc-doc-matrix"];
// Notas y rótulos de la documentación: no van en el código copiado.
const ANOTACIONES = [".dcc-sub-label", ".dcc-doc-p", ".dcc-sg-note"];
const BOOLEANOS = ["disabled", "hidden", "checked", "readonly", "selected", "open", "inert", "required", "multiple"];

const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Quita la sangría común y las líneas vacías sobrantes. */
function sangrar(texto) {
  const lineas = texto.replace(/^\s*\n|\s+$/g, "").split("\n")
    .filter((l, i, a) => l.trim() || (a[i - 1] && a[i - 1].trim()));
  const min = Math.min(...lineas.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lineas.map((l) => l.slice(min)).join("\n");
}

/** Lee la cabecera `clave: valor` y separa el cuerpo. */
function leerFragmento(texto, archivo) {
  const m = texto.match(/^<!--\n([\s\S]*?)\n-->\n/);
  if (!m) throw new Error(`${archivo}: falta la cabecera <!-- titulo: … -->`);
  const meta = Object.fromEntries(m[1].split("\n").map((l) => {
    const i = l.indexOf(":");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }));
  for (const k of ["titulo", "grupo", "resumen", "miniatura"])
    if (!meta[k]) throw new Error(`${archivo}: la cabecera no trae "${k}"`);
  if (!GRUPOS.includes(meta.grupo)) throw new Error(`${archivo}: grupo desconocido "${meta.grupo}"`);
  return { meta, cuerpo: texto.slice(m[0].length) };
}

/** El HTML de una demo, sin andamiaje, listo para copiar. */
function codigoDe(demo) {
  const copia = demo.cloneNode(true);
  copia.querySelectorAll(ANOTACIONES.join(",")).forEach((n) => n.remove());
  for (const sel of ENVOLTORIOS)
    copia.querySelectorAll(sel).forEach((n) => n.replaceWith(...n.childNodes));
  let html = copia.innerHTML;
  for (const b of BOOLEANOS) html = html.replaceAll(` ${b}=""`, ` ${b}`);
  return sangrar(html);
}

/** Una copia inerte del elemento de muestra, sin ids ni enganches de JS. */
function miniaturaDe(doc, selector, archivo) {
  const el = doc.querySelector(selector);
  if (!el) throw new Error(`${archivo}: la miniatura "${selector}" no existe en la página`);
  const copia = el.cloneNode(true);
  for (const n of [copia, ...copia.querySelectorAll("*")]) {
    for (const a of ["id", "for", "aria-controls", "aria-labelledby", "aria-describedby", "tabindex"])
      n.removeAttribute(a);
    for (const c of [...n.classList]) if (c.startsWith("js-")) n.classList.remove(c);
  }
  return copia.outerHTML;
}

export function construirSitio({ raiz, version }) {
  const SITIO = join(raiz, "src", "sitio");
  const plantilla = readFileSync(join(SITIO, "plantilla.html"), "utf8");
  const iconos = readFileSync(join(raiz, "src", "icons.svg"), "utf8")
    .replace(/<!--[\s\S]*?-->\s*/, "").trim();

  const paginas = readdirSync(join(SITIO, "componentes"))
    .filter((f) => f.endsWith(".html")).sort()
    .map((archivo) => {
      const { meta, cuerpo } = leerFragmento(readFileSync(join(SITIO, "componentes", archivo), "utf8"), archivo);
      return { slug: archivo.replace(/\.html$/, ""), archivo, meta, cuerpo };
    });

  const porGrupo = GRUPOS.map((g) => ({
    grupo: g,
    paginas: paginas.filter((p) => p.meta.grupo === g)
      .sort((a, b) => a.meta.titulo.localeCompare(b.meta.titulo, "es")),
  })).filter((g) => g.paginas.length);

  const navegacion = (actual) =>
    `<a class="dcc-doc-nav__home"${actual === "index" ? ' aria-current="page"' : ""} href="index.html">Todos los componentes</a>\n` +
    porGrupo.map(({ grupo, paginas: ps }) =>
      `      <p class="dcc-doc-nav__group">${grupo}</p>\n      <ul class="dcc-doc-nav__list">\n` +
      ps.map((p) => `        <li><a href="${p.slug}.html"${p.slug === actual ? ' aria-current="page"' : ""}>${p.meta.titulo}</a></li>`).join("\n") +
      "\n      </ul>").join("\n");

  const armar = ({ actual, titulo, descripcion, contenido, indice }) => plantilla
    .replaceAll("{{titulo}}", titulo)
    .replaceAll("{{descripcion}}", escapar(descripcion))
    .replaceAll("{{version}}", version)
    .replace("{{iconos}}", iconos)
    .replace("{{navegacion}}", navegacion(actual))
    .replace("{{indice}}", indice)
    .replace("{{contenido}}", contenido);

  const salidas = {};
  const miniaturas = {};

  for (const p of paginas) {
    const dom = new JSDOM(`<main>${p.cuerpo}</main>`);
    const doc = dom.window.document;
    const main = doc.querySelector("main");
    miniaturas[p.slug] = miniaturaDe(doc, p.meta.miniatura, p.archivo);

    for (const demo of main.querySelectorAll(".dcc-doc-demo")) {
      if (demo.dataset.codigo === "no") { demo.removeAttribute("data-codigo"); continue; }
      const codigo = doc.createElement("details");
      codigo.className = "dcc-doc-code";
      codigo.innerHTML =
        `<summary>Ver HTML</summary><button class="dcc-doc-code__copy" type="button">Copiar</button>` +
        `<pre><code>${escapar(codigoDe(demo))}</code></pre>`;
      demo.after(codigo);
    }

    const secciones = [...main.querySelectorAll("h2.dcc-doc-h2[id]")];
    const indice = secciones.length < 2 ? "" :
      `<aside class="dcc-doc-toc" aria-label="En esta página">\n    <p class="dcc-doc-toc__title">En esta página</p>\n    <ul>\n` +
      secciones.map((h) => `      <li><a href="#${h.id}">${h.textContent}</a></li>`).join("\n") +
      "\n    </ul>\n  </aside>";

    const contenido =
      `<p class="dcc-doc-crumb"><a href="index.html">Componentes</a> / ${p.meta.grupo}</p>\n` +
      `      <h1 class="dcc-doc-title">${p.meta.titulo}</h1>\n` +
      `      <p class="dcc-doc-lead">${p.meta.resumen}</p>\n` +
      main.innerHTML.replaceAll('src="assets/', 'src="../src/assets/');

    salidas[`${p.slug}.html`] = armar({
      actual: p.slug, titulo: `${p.meta.titulo} — UI Kit DCC`,
      descripcion: p.meta.resumen, contenido, indice,
    });
  }

  const portada =
    `<h1 class="dcc-doc-title">Todos los componentes</h1>\n` +
    `      <p class="dcc-doc-lead">El sistema de diseño del Departamento de Ciencias de la Computación. ` +
    `Cada componente es CSS con prefijo <code>dcc-</code>: sirve igual en React, Vue o una plantilla de Django.</p>\n` +
    porGrupo.map(({ grupo, paginas: ps }) =>
      `      <h2 class="dcc-doc-h2">${grupo}</h2>\n      <div class="dcc-doc-cards">\n` +
      ps.map((p) =>
        `        <div class="dcc-doc-card">\n` +
        `          <div class="dcc-doc-card__preview" aria-hidden="true" inert>` +
        `<div class="dcc-doc-card__scale" style="--dcc-doc-escala:${p.meta.escala || 0.75}${p.meta.ancho ? `;--dcc-doc-ancho:${p.meta.ancho}` : ""}">${miniaturas[p.slug].replaceAll('src="assets/', 'src="../src/assets/')}</div></div>\n` +
        `          <a class="dcc-doc-card__link" href="${p.slug}.html">${p.meta.titulo}</a>\n` +
        `        </div>`).join("\n") +
      "\n      </div>").join("\n");

  salidas["index.html"] = armar({
    actual: "index", titulo: "UI Kit DCC — Todos los componentes",
    descripcion: "Sistema de diseño del DCC, Universidad de Chile.", contenido: portada, indice: "",
  });

  return { salidas, paginas };
}
