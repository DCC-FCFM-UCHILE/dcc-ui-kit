// Regenera firmas/ejemplo.html desde plantilla.js: `node firmas/generar-ejemplo.mjs`.
// plantilla.js es un script de navegador; se ejecuta en un contexto aislado
// para tomar sus funciones sin convertirlo en módulo.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const aqui = dirname(fileURLToPath(import.meta.url));
const contexto = {};
vm.runInNewContext(readFileSync(join(aqui, "plantilla.js"), "utf8"), contexto);

const html = contexto.documentoFirma({
  nombre: "Tavata Salazar Vallejos",
  cargo: "Encargada de Estudios",
  telefono: "+56 229784891",
  web: "www.dcc.uchile.cl",
  direccion1: "Beauchef #851, Edificio Poniente,",
  direccion2: "Piso 2 Of. 205",
}, { base: "img/" });

writeFileSync(join(aqui, "ejemplo.html"), html);
console.log("firmas/ejemplo.html escrito");
