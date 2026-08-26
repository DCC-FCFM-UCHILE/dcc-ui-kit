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
const markup = guia.replace(/<script>[\s\S]*?<\/script>/g, "");
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
const dom = new JSDOM(guia, { runScripts: "dangerously" });
const { window } = dom;
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

console.log(`\n${ok} verificaciones pasan, ${fail} fallan\n`);
process.exit(fail ? 1 : 0);
