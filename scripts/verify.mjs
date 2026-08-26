#!/usr/bin/env node
/**
 * Verificaciones del kit. Corre en CI y también en local con `npm test`.
 *
 * Cubre las tres familias de errores que aparecieron durante el desarrollo:
 *   1. Clases del markup sin regla CSS, y viceversa.
 *   2. Íconos rotos: <use> que apunta a un id inexistente.
 *   3. Regresiones de comportamiento: acordeón, tabs, calendario, orden de
 *      tabla, combobox, favoritos y arrastre — ejecutados de verdad sobre el DOM.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const guia = readFileSync(join(raiz, "src/styleguide.html"), "utf8");
const css = readFileSync(join(raiz, "src/styles.css"), "utf8");
const comportamiento = readFileSync(join(raiz, "src/behaviors.js"), "utf8");
const markup = guia.replace(/<script[\s\S]*?<\/script>/g, "");
const cssSinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");

let ok = 0, fail = 0;
const check = (cond, msg) => {
  if (cond) { ok++; console.log("  ✓ " + msg); }
  else { fail++; console.error("  ✗ " + msg); }
};

/* ---------- 1. coherencia entre markup y CSS ---------- */
console.log("\nCoherencia de clases");
const usadas = new Set();
for (const m of markup.matchAll(/class="([^"]+)"/g))
  m[1].split(/\s+/).filter(Boolean).forEach((c) => usadas.add(c));
const definidas = new Set([...cssSinComentarios.matchAll(/\.([A-Za-z][\w-]*)/g)].map((m) => m[1]));

const huerfanas = [...usadas].filter((c) => !definidas.has(c) && !c.startsWith("js-")).sort();
check(huerfanas.length === 0, `las ${usadas.size} clases del markup tienen regla CSS` +
  (huerfanas.length ? ` — faltan: ${huerfanas.join(", ")}` : ""));

const sinPrefijo = [...usadas].filter((c) => !/^(dcc-|is-|js-)/.test(c)).sort();
check(sinPrefijo.length === 0, "todas las clases están prefijadas" +
  (sinPrefijo.length ? ` — sueltas: ${sinPrefijo.join(", ")}` : ""));

/* ---------- 2. variables ---------- */
console.log("\nVariables CSS");
const declaradas = new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
const usadasVar = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
for (const m of guia.matchAll(/var\((--[\w-]+)/g)) usadasVar.add(m[1]);
const sinDeclarar = [...usadasVar].filter((v) => !declaradas.has(v)).sort();
check(sinDeclarar.length === 0, `las ${usadasVar.size} variables usadas están declaradas` +
  (sinDeclarar.length ? ` — faltan: ${sinDeclarar.join(", ")}` : ""));
const varSinPrefijo = [...declaradas].filter((v) => !v.startsWith("--dcc-")).sort();
check(varSinPrefijo.length === 0, "todas las variables llevan el prefijo --dcc-" +
  (varSinPrefijo.length ? ` — sueltas: ${varSinPrefijo.join(", ")}` : ""));

/* ---------- 3. íconos ---------- */
console.log("\nÍconos");
const ids = new Set([...markup.matchAll(/<g id="(i-[^"]+)"/g)].map((m) => m[1]));
const refs = new Set([...guia.matchAll(/<use href="#([^"]+)"/g)].map((m) => m[1]));
const rotos = [...refs].filter((r) => !ids.has(r)).sort();
check(rotos.length === 0, `los ${refs.size} <use> resuelven` + (rotos.length ? ` — rotos: ${rotos.join(", ")}` : ""));
const sobran = [...ids].filter((i) => !refs.has(i)).sort();
check(sobran.length === 0, `los ${ids.size} íconos del sprite se usan` +
  (sobran.length ? ` — sin uso: ${sobran.join(", ")}` : ""));

/* ---------- 4. assets ---------- */
console.log("\nAssets");
const assets = [...new Set([...markup.matchAll(/src="(assets\/[^"]+)"/g)].map((m) => m[1]))];
const faltan = assets.filter((a) => !existsSync(join(raiz, "src", a)));
check(faltan.length === 0, `los ${assets.length} assets referenciados existen` +
  (faltan.length ? ` — faltan: ${faltan.join(", ")}` : ""));

/* ---------- 5. comportamiento, sobre el DOM real ---------- */
console.log("\nComportamiento");
// jsdom no descarga scripts externos, así que el fuente se inyecta tal cual.
// Importa que sea el mismo archivo que se publica: si estas pruebas pasaran
// contra una copia, dejarían de proteger lo que usan las apps.
const guiaEjecutable = guia.replace(
  '<script src="behaviors.js" defer></script>',
  "<script>" + comportamiento + "</script>",
);
const dom = new JSDOM(guiaEjecutable, { runScripts: "dangerously" });
const { window } = dom;

// El módulo se enlaza en DOMContentLoaded, igual que en un navegador. Hay que
// esperarlo o las pruebas consultarían un DOM todavía sin enlazar.
await new Promise((listo) => {
  if (window.document.readyState !== "loading") listo();
  else window.document.addEventListener("DOMContentLoaded", listo);
});
const doc = window.document;
window.HTMLElement.prototype.scrollIntoView = function () {};
const click = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const key = (el, k) => el.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

const picker = doc.querySelector(".js-datepicker");
const cal = picker.querySelector(".js-calendar");
click(picker.querySelector(".js-dp-toggle"));
check(!cal.hidden, "el date picker abre");
const mes = cal.querySelector(".dcc-calendar__title").textContent;
click(cal.querySelector('.dcc-calendar__nav[data-step="1"]'));
check(!cal.hidden, "no se cierra al cambiar de mes");
check(cal.querySelector(".dcc-calendar__title").textContent !== mes, "y el mes efectivamente cambia");

const th = doc.querySelector(".js-sortable th.is-sortable");
click(th.querySelector(".dcc-th-sort"));
check(th.getAttribute("aria-sort") === "descending", "la tabla ordena y expone aria-sort");

const combo = doc.querySelector(".js-combo");
click(combo.querySelector(".dcc-combo__button"));
check(!combo.querySelector(".dcc-combo__list").hidden, "el selector abre");
click(combo.querySelectorAll(".dcc-combo__option")[2]);
check(combo.querySelector(".dcc-combo__value").textContent === "Doctorado", "y selecciona la opción");

const trigger = doc.querySelector(".js-accordion .dcc-accordion__trigger");
const antes = trigger.getAttribute("aria-expanded");
click(trigger);
check(trigger.getAttribute("aria-expanded") !== antes, "el acordeón alterna");

const tab = doc.querySelectorAll('.js-tabs [role="tab"]')[1];
click(tab);
check(tab.getAttribute("aria-selected") === "true", "los tabs cambian de panel");

const fav = doc.querySelector(".dcc-ccard__fav");
const favAntes = fav.getAttribute("aria-pressed");
click(fav);
check(fav.getAttribute("aria-pressed") !== favAntes, "el favorito alterna");
check(doc.querySelector(".dcc-ccard__fav--heart"), "existe la variante de corazón");

const lista = doc.querySelector(".js-dnd");
const titulos = () => [...lista.querySelectorAll(".dcc-ccard--draggable .dcc-ccard__title")].map((t) => t.textContent.trim());
const orden = titulos();
key(lista.querySelectorAll(".dcc-ccard__grip")[1], "ArrowUp");
check(titulos()[0] === orden[1], "las tarjetas se reordenan con el teclado");

/* ---------- 6. la API pública, que es de lo que dependen las apps ---------- */
console.log("\nAPI de DCCUI");
check(typeof window.DCCUI === "object" && typeof window.DCCUI.init === "function",
  "expone DCCUI.init()");

// Volver a inicializar no debe duplicar manejadores: si lo hiciera, un solo
// clic contaría doble y el acordeón parecería no responder.
const trigger2 = doc.querySelector(".js-accordion .dcc-accordion__trigger");
window.DCCUI.init();
window.DCCUI.init(doc);
const estadoPrevio = trigger2.getAttribute("aria-expanded");
click(trigger2);
check(trigger2.getAttribute("aria-expanded") !== estadoPrevio,
  "init() es idempotente: no duplica manejadores");

// El caso de htmx y de cualquier HTML que llegue por AJAX: el kit tiene que
// poder enlazar un trozo recién insertado.
const inyectado = doc.createElement("div");
inyectado.innerHTML =
  '<div class="js-accordion"><button class="dcc-accordion__trigger" aria-expanded="false"' +
  ' aria-controls="panel-inyectado">Nuevo</button>' +
  '<div class="dcc-accordion__panel" id="panel-inyectado"></div></div>';
doc.body.appendChild(inyectado);
const triggerNuevo = inyectado.querySelector(".dcc-accordion__trigger");
click(triggerNuevo);
check(triggerNuevo.getAttribute("aria-expanded") === "false",
  "el DOM inyectado no se enlaza solo (hasta que se llama a init)");
window.DCCUI.init(inyectado);
click(triggerNuevo);
check(triggerNuevo.getAttribute("aria-expanded") === "true",
  "DCCUI.init(elemento) enlaza DOM inyectado después de cargar");

// htmx no requiere llamar a nada: el kit escucha el evento por su cuenta.
const porHtmx = doc.createElement("div");
porHtmx.innerHTML =
  '<div class="js-accordion"><button class="dcc-accordion__trigger" aria-expanded="false"' +
  ' aria-controls="panel-htmx">htmx</button>' +
  '<div class="dcc-accordion__panel" id="panel-htmx"></div></div>';
doc.body.appendChild(porHtmx);
porHtmx.dispatchEvent(new window.CustomEvent("htmx:afterSwap", { bubbles: true }));
const triggerHtmx = porHtmx.querySelector(".dcc-accordion__trigger");
click(triggerHtmx);
check(triggerHtmx.getAttribute("aria-expanded") === "true",
  "htmx:afterSwap enlaza lo que llega, sin escribir código");

/* ---------- 7. el artefacto publicado, sobre una página que no es el styleguide ----------
   Las pruebas de arriba corren sobre src/. Esta corre sobre dist/, en una página
   como la que escribiría una app: sin markup del styleguide y con una sola
   etiqueta <script>. Es lo que garantiza que la instalación de dos líneas sirve. */
console.log("\nBundle publicado");
const pkg = JSON.parse(readFileSync(join(raiz, "package.json"), "utf8"));
const bundle = readFileSync(join(raiz, "dist/dcc-ui.bundle.min.js"), "utf8");

const paginaApp = `<!DOCTYPE html><html><body>
  <svg class="dcc-i" viewBox="0 0 24 24"><use href="#i-check"/></svg>
  <div class="js-accordion">
    <button class="dcc-accordion__trigger" aria-expanded="false" aria-controls="p1">Requisitos</button>
    <div class="dcc-accordion__panel" id="p1">contenido</div>
  </div>
  <script>${bundle}<\/script></body></html>`;

const domApp = new JSDOM(paginaApp, { runScripts: "dangerously" });
await new Promise((listo) => {
  if (domApp.window.document.readyState !== "loading") listo();
  else domApp.window.document.addEventListener("DOMContentLoaded", listo);
});
const docApp = domApp.window.document;

check(!!docApp.getElementById("dcc-icon-sprite"), "el bundle inyecta el sprite de íconos");
check(!!docApp.getElementById("i-check"), "los <use> resuelven sin tocar rutas");
const trApp = docApp.querySelector(".dcc-accordion__trigger");
trApp.dispatchEvent(new domApp.window.MouseEvent("click", { bubbles: true }));
check(trApp.getAttribute("aria-expanded") === "true",
  "los componentes funcionan con una sola etiqueta <script>");

/* ---------- 8. la documentación no puede apuntar a una versión que no existe ----------
   Los números de versión de las URLs se escriben a mano. Ya ocurrió que la guía
   de consumo quedó ofreciendo una 1.0.1 inexistente; esta comprobación lo corta. */
console.log("\nVersión");
const docs = ["README.md", "dist/README.md"];
const desfasados = [];
for (const d of docs) {
  const texto = readFileSync(join(raiz, d), "utf8");
  for (const m of texto.matchAll(/ui-kit\/(\d+\.\d+\.\d+)\//g))
    if (m[1] !== pkg.version) desfasados.push(`${d} → ${m[1]}`);
  for (const m of texto.matchAll(/dcc-ui-kit#v(\d+\.\d+\.\d+)/g))
    if (m[1] !== pkg.version) desfasados.push(`${d} → v${m[1]}`);
}
check(desfasados.length === 0,
  `las URLs de la documentación apuntan a ${pkg.version}` +
  (desfasados.length ? ` — desfasadas: ${[...new Set(desfasados)].join(", ")}` : ""));

const sri = readFileSync(join(raiz, "dist/SRI.txt"), "utf8");
check(sri.includes(`DCC UI Kit ${pkg.version}`), "SRI.txt corresponde a la versión actual");

console.log(`\n${ok} verificaciones pasan, ${fail} fallan\n`);
process.exit(fail ? 1 : 0);
