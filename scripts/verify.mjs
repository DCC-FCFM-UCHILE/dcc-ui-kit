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
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (...r) => readFileSync(join(raiz, ...r), "utf8");
// El sitio publicado, tal como lo ve quien lo visita. `npm test` corre antes
// check:dist, así que site/ ya está garantizado en sincronía con src/sitio/.
const sitio = readdirSync(join(raiz, "site")).filter((f) => f.endsWith(".html"))
  .map((f) => leer("site", f)).join("\n");
const iconos = leer("src/icons.svg");
// Para las pruebas de comportamiento, todos los fragmentos en un solo documento:
// es lo que era el styleguide, y deja probar cada componente una sola vez.
const DIR_FRAGMENTOS = join(raiz, "src/sitio/componentes");
const fragmentos = readdirSync(DIR_FRAGMENTOS).filter((f) => f.endsWith(".html")).sort()
  .map((f) => readFileSync(join(DIR_FRAGMENTOS, f), "utf8").replace(/^<!--[\s\S]*?-->\n/, "")).join("\n");
const guia = `<!DOCTYPE html><html lang="es"><body>${iconos}${fragmentos}` +
  `<script src="behaviors.js" defer></script></body></html>`;
// La hoja principal más los módulos de src/componentes/, en el mismo orden en
// que los junta el build.
const DIR_MODULOS = join(raiz, "src/componentes");
const modulos = (ext) => existsSync(DIR_MODULOS)
  ? readdirSync(DIR_MODULOS).filter((f) => f.endsWith(ext)).sort().map((f) => readFileSync(join(DIR_MODULOS, f), "utf8"))
  : [];
const css = [leer("src/styles.css"), ...modulos(".css")].join("\n");
const comportamiento = [leer("src/behaviors.js"), ...modulos(".js")].join("\n");
const markup = sitio.replace(/<script[\s\S]*?<\/script>/g, "");
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
for (const m of sitio.matchAll(/var\((--[\w-]+)/g)) usadasVar.add(m[1]);
const sinDeclarar = [...usadasVar].filter((v) => !declaradas.has(v)).sort();
check(sinDeclarar.length === 0, `las ${usadasVar.size} variables usadas están declaradas` +
  (sinDeclarar.length ? ` — faltan: ${sinDeclarar.join(", ")}` : ""));
const varSinPrefijo = [...declaradas].filter((v) => !v.startsWith("--dcc-")).sort();
check(varSinPrefijo.length === 0, "todas las variables llevan el prefijo --dcc-" +
  (varSinPrefijo.length ? ` — sueltas: ${varSinPrefijo.join(", ")}` : ""));

// La barra de aplicación tiene fondo oscuro. Si el color se declara sólo en
// .dcc-nav-app__user, cualquier componente que se cuelgue dentro —un menú, un
// botón— hereda el color del cuerpo y queda gris sobre azul. Tiene que estar en
// la barra misma para que se herede.
const navApp = cssSinComentarios.match(/\.dcc-nav-app\s*\{[^}]*\}/);
check(!!navApp && /(^|[;{])\s*color\s*:/.test(navApp[0]),
  ".dcc-nav-app declara color, para que sus hijos lo hereden");

// El tema oscuro se declara dos veces: fijo (`data-dcc-theme="dark"`) y
// automático (`"auto"` dentro de prefers-color-scheme). Si alguien cambia un
// color en un bloque y no en el otro, los dos modos se separan en silencio.
const bloqueTema = (re) => {
  const m = cssSinComentarios.match(re);
  return m ? m[1].split(";").map((d) => d.trim()).filter(Boolean).join(";") : null;
};
const temaFijo = bloqueTema(/\[data-dcc-theme="dark"\]\s*\{([^}]*)\}/);
const temaAuto = bloqueTema(/@media \(prefers-color-scheme: dark\)\s*\{\s*\[data-dcc-theme="auto"\]\s*\{([^}]*)\}/);
check(!!temaFijo && temaFijo === temaAuto,
  "el tema oscuro fijo y el automático declaran los mismos valores");
const rolesClaros = new Set([...(cssSinComentarios.match(/:root\s*\{[^}]*--dcc-bg:[^}]*\}/) || [""])[0]
  .matchAll(/(--dcc-[\w-]+)\s*:/g)].map((m) => m[1]));
const rolesOscuros = new Set([...(temaFijo || "").matchAll(/(--dcc-[\w-]+)\s*:/g)].map((m) => m[1]));
const sinOscuro = [...rolesClaros].filter((v) =>
  /^--dcc-(bg|surface|fg|border|accent|on-accent|focus|danger|success|info|warning)/.test(v) && !rolesOscuros.has(v));
check(sinOscuro.length === 0, "cada color por rol tiene su valor oscuro" +
  (sinOscuro.length ? ` — faltan: ${sinOscuro.join(", ")}` : ""));

/* ---------- 3. íconos ---------- */
console.log("\nÍconos");
const ids = new Set([...iconos.matchAll(/<g id="(i-[^"]+)"/g)].map((m) => m[1]));
const refs = new Set([...sitio.matchAll(/<use href="#([^"]+)"/g)].map((m) => m[1]));
const rotos = [...refs].filter((r) => !ids.has(r)).sort();
check(rotos.length === 0, `los ${refs.size} <use> resuelven` + (rotos.length ? ` — rotos: ${rotos.join(", ")}` : ""));
const sobran = [...ids].filter((i) => !refs.has(i)).sort();
check(sobran.length === 0, `los ${ids.size} íconos del sprite se usan` +
  (sobran.length ? ` — sin uso: ${sobran.join(", ")}` : ""));

/* ---------- 4. assets ---------- */
console.log("\nAssets");
const assets = [...new Set([...markup.matchAll(/src="\.\.\/src\/(assets\/[^"]+)"/g)].map((m) => m[1]))];
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

// Seleccionar casillaTodas: la casilla de la cabecera manda sobre las filas, y las
// filas le devuelven su estado (marcada, vacía o indeterminada).
const casillaTodas = doc.querySelector(".js-select-all");
const filasSel = () => [...casillaTodas.closest("table").querySelectorAll("tbody td.dcc-cell--check input")];
check(casillaTodas.indeterminate && !casillaTodas.checked, "seleccionar todas empieza indeterminada si hay filas marcadas");
click(casillaTodas);
check(filasSel().every((c) => c.checked) && casillaTodas.checked && !casillaTodas.indeterminate,
  "marcar la cabecera marca todas las filas");
click(casillaTodas);
check(filasSel().every((c) => !c.checked) && !casillaTodas.checked, "y desmarcarla las desmarca");
click(filasSel()[0]);
check(casillaTodas.indeterminate, "una fila marcada deja la cabecera indeterminada");
filasSel().slice(1).forEach((c) => click(c));
check(casillaTodas.checked && !casillaTodas.indeterminate, "con todas las filas marcadas, la cabecera queda marcada");

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

// Se apunta al ejemplo canónico por id y no al primer `.js-menu` de la página:
// desde la 2.5.0 el sidebar trae su propio menú y aparece antes en el documento.
const menu = doc.querySelector("#menu-acciones").closest(".js-menu");
const menuTrigger = menu.querySelector(".dcc-menu__trigger");
const menuLista = menu.querySelector(".dcc-menu__list");
click(menuTrigger);
check(menuLista.hidden === false && menuTrigger.getAttribute("aria-expanded") === "true",
  "el menú abre y lo anuncia con aria-expanded");

key(menuLista, "ArrowDown");
check(doc.activeElement && doc.activeElement.classList.contains("dcc-menu__item"),
  "las flechas mueven el foco entre las opciones");

// La opción deshabilitada no debe recibir foco al recorrer el menú: si lo
// recibiera, el teclado se quedaría atascado en una opción que no hace nada.
const todas = [...menu.querySelectorAll(".dcc-menu__item")];
const deshabilitadas = todas.filter((i) => i.getAttribute("aria-disabled") === "true");
check(deshabilitadas.length > 0, "el ejemplo incluye una opción deshabilitada");

const recorridos = new Set();
for (let i = 0; i < todas.length + 1; i++) {
  key(menuLista, "ArrowDown");
  if (doc.activeElement) recorridos.add(doc.activeElement);
}
check(![...recorridos].some((el) => el.getAttribute("aria-disabled") === "true"),
  "las flechas saltan la opción deshabilitada");

key(menuLista, "Escape");
check(menuLista.hidden === true && doc.activeElement === menuTrigger,
  "Escape cierra el menú y devuelve el foco al botón");

// Un clic fuera lo cierra: si no, quedaría abierto al navegar por la página.
click(menuTrigger);
click(doc.body);
check(menuLista.hidden === true, "un clic fuera cierra el menú");

// Activar una opción cierra el menú: son acciones, no un valor seleccionable.
click(menuTrigger);
click(menu.querySelector(".dcc-menu__item"));
check(menuLista.hidden === true, "elegir una opción cierra el menú");
check(doc.activeElement === menuTrigger, "y devuelve el foco al disparador");

// El desplegable va bajo el disparador por defecto: si lo tapara, se perdería
// de vista el avatar justo cuando el menú está abierto. El `^` ancla la regla
// base — sin él, cualquier selector descendiente que la afine (el del sidebar,
// por ejemplo) se come el match y el test deja de mirar lo que dice mirar.
const reglaMenu = cssSinComentarios.match(/^\.dcc-menu__list\s*\{[^}]*\}/m);
check(!!reglaMenu && /top:\s*calc\(100%/.test(reglaMenu[0]),
  "el menú se despliega bajo el disparador, sin taparlo");

// El botón del sidebar lleva las dos clases cuando además abre un menú, y
// `.dcc-menu__trigger` pesa lo mismo pero va después: le gana. Lo que el
// disparador pisa hay que devolverlo con el contenedor por delante, o el botón
// se queda sin fondo —blanco invisible sobre la barra oscura—, sin relleno y
// con el color heredado. Se comprueba el invariante y no un valor: toda
// propiedad que ambos declaren tiene que estar restablecida.
const cuerpo = (sel) => {
  const m = cssSinComentarios.match(new RegExp("(?:^|\\})\\s*" + sel.replace(/[.\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}"));
  return m ? m[1] : "";
};
const props = (sel) => new Map([...cuerpo(sel).matchAll(/([a-z-]+)\s*:\s*([^;]+)/g)]
  .map((m) => [m[1], m[2].trim()]));
// Sólo importan las que declaran las dos con valores distintos: donde coinciden,
// que gane el disparador da igual.
const propsTrigger = props(".dcc-menu__trigger");
const propsCta = props(".dcc-sidebar__cta");
const pisadas = [...propsTrigger.keys()]
  .filter((x) => propsCta.has(x) && propsCta.get(x) !== propsTrigger.get(x));
const restablecidas = props(".dcc-sidebar__action .dcc-sidebar__cta");
const sueltas = pisadas.filter((x) => !restablecidas.has(x));
check(pisadas.length > 0 && sueltas.length === 0,
  "el botón del sidebar recupera lo que .dcc-menu__trigger le pisa" +
  (sueltas.length ? ` — faltan: ${sueltas.join(", ")}` : ""));

// Y `dcc-menu--up` lo invierte, para el disparador que vive al pie de una barra
// lateral: hacia abajo se saldría de la pantalla.
const reglaArriba = cssSinComentarios.match(/\.dcc-menu--up\s+\.dcc-menu__list\s*\{[^}]*\}/);
check(!!reglaArriba && /bottom:\s*calc\(100%/.test(reglaArriba[0]) && /top:\s*auto/.test(reglaArriba[0]),
  "dcc-menu--up lo despliega hacia arriba");

/* ---------- 5b. componentes de src/componentes/ ---------- */
console.log("\nComponentes nuevos");
const ev = (el, tipo, extra = {}) => el.dispatchEvent(new window.Event(tipo, { bubbles: true, ...extra }));

// Diálogo: un disparador declarativo lo abre y [data-dcc-cerrar] lo cierra.
const abreDialogo = [...doc.querySelectorAll("[data-dcc-abrir]")]
  .find((b) => doc.getElementById(b.getAttribute("data-dcc-abrir"))?.matches("dialog.dcc-dialog"));
const dialogo = doc.getElementById(abreDialogo.getAttribute("data-dcc-abrir"));
click(abreDialogo);
check(dialogo.open, "el diálogo abre con data-dcc-abrir");
const cierraDialogo = dialogo.querySelector("[data-dcc-cerrar]");
click(cierraDialogo);
await new Promise((r) => setTimeout(r, 400));
check(!dialogo.open, "y se cierra con data-dcc-cerrar");

// Snackbar: la API crea el aviso con el mensaje como texto, nunca como HTML.
window.DCCUI.notificar({ mensaje: "<b>Guardado</b>", duracion: 0 });
await new Promise((r) => setTimeout(r, 50));
const aviso = [...doc.querySelectorAll(".dcc-snackbar")].find((n) => n.textContent.includes("<b>Guardado</b>"));
check(!!aviso && !aviso.querySelector("b"), "DCCUI.notificar muestra el mensaje como texto");

// Autocompletar: escribir filtra la lista sin distinguir tildes.
const auto = doc.querySelector(".js-autocomplete:not([data-multiple])");
const autoInput = auto.querySelector("input:not([type=hidden])");
const autoOpciones = () => [...auto.querySelectorAll("[role=option]")].filter((o) => !o.hidden && !o.closest("[hidden]"));
const totalOpciones = autoOpciones().length || auto.querySelectorAll("[role=option]").length;
const primera = auto.querySelector("[role=option]").textContent.trim();
autoInput.value = primera.slice(0, 3).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
ev(autoInput, "input");
const filtradas = autoOpciones();
check(filtradas.length > 0 && filtradas.length < auto.querySelectorAll("[role=option]").length,
  "el autocompletar filtra mientras se escribe (también sin tildes)");

// Botones alternables exclusivos: presionar uno suelta el otro.
const grupoEx = doc.querySelector(".js-toggle-group[data-exclusivo]");
const [t1, t2] = grupoEx.querySelectorAll(".dcc-toggle");
click(t1); click(t2);
check(t2.getAttribute("aria-pressed") === "true" && t1.getAttribute("aria-pressed") === "false",
  "el grupo exclusivo deja un solo botón presionado");

// Lista de transferencia: mover todo a la derecha deja la izquierda vacía.
const transfer = doc.querySelector(".js-transfer");
const listas = transfer.querySelectorAll(".dcc-transfer__list");
click(transfer.querySelector('[data-mover="todo-derecha"]'));
check(listas[0].children.length === 0 && listas[1].children.length > 0,
  "la lista de transferencia mueve todos los elementos");

// Chip eliminable: la cruz lo quita del documento.
const chipCruz = doc.querySelector(".js-chip-delete");
const chip = chipCruz.closest(".dcc-chip");
click(chipCruz);
check(!chip.isConnected, "el chip eliminable se quita con su cruz");

// Indicador: pasado el máximo muestra "99+".
const ind = doc.querySelector(".js-indicator");
window.DCCUI.indicador.fijar(ind, 100);
check(ind.querySelector(".dcc-indicator__badge").textContent.trim() === "99+", "el indicador topa en 99+");

// Popover: el botón abre y anuncia el estado; Escape lo cierra.
const pop = doc.querySelector(".js-popover");
click(pop);
check(pop.getAttribute("aria-expanded") === "true", "el popover abre y lo anuncia con aria-expanded");
key(doc.activeElement || pop, "Escape");
check(pop.getAttribute("aria-expanded") === "false", "y Escape lo cierra");

// Deslizador de rango: las flechas mueven la manilla.
const rango = [...doc.querySelectorAll(".js-slider")].find((s) => s.querySelectorAll("[role=slider]").length === 2);
const manilla = rango.querySelector("[role=slider]");
const antesValor = +manilla.getAttribute("aria-valuenow");
key(manilla, "ArrowRight");
check(+manilla.getAttribute("aria-valuenow") > antesValor, "las flechas mueven la manilla del rango");

// Speed dial: el botón principal lo abre.
const dial = doc.querySelector(".js-speed-dial");
const dialFab = dial.querySelector("[aria-expanded]");
click(dialFab);
check(dialFab.getAttribute("aria-expanded") === "true", "el speed dial abre");

// Tarjeta: "ver más" alterna el contenido expandible.
const expandir = doc.querySelector(".js-surface-card-expand");
const estadoExp = expandir.getAttribute("aria-expanded");
click(expandir);
check(expandir.getAttribute("aria-expanded") !== estadoExp, "la tarjeta expande su contenido");

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

/* ---------- 7. el artefacto publicado, sobre una página que no es la documentación ----------
   Las pruebas de arriba corren sobre src/. Esta corre sobre dist/, en una página
   como la que escribiría una app: sin markup de la documentación y con una sola
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
  <div class="js-toggle-group" data-exclusivo><button class="dcc-toggle" aria-pressed="false">A</button><button class="dcc-toggle" aria-pressed="false">B</button></div>
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
const [tA, tB] = docApp.querySelectorAll(".dcc-toggle");
tA.dispatchEvent(new domApp.window.MouseEvent("click", { bubbles: true }));
tB.dispatchEvent(new domApp.window.MouseEvent("click", { bubbles: true }));
check(tB.getAttribute("aria-pressed") === "true" && tA.getAttribute("aria-pressed") === "false",
  "los módulos de src/componentes/ viajan en el bundle y se enlazan solos");

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
