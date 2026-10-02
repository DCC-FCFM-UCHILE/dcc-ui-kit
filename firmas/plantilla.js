/**
 * Firma de correo del DCC.
 *
 * Un correo no es una página web. Lo que sigue está escrito para lo que
 * aguantan Gmail, Outlook (incluido el de escritorio, que dibuja con el motor
 * de Word) y Apple Mail:
 *
 *   - Tablas para el layout y todos los estilos en línea. Gmail y Outlook
 *     borran el <style> de una firma al pegarla, así que no puede haber clases.
 *   - Imágenes PNG, nunca SVG: Gmail y Outlook no muestran SVG. Van al doble o
 *     triple de su tamaño para que se vean nítidas en pantallas retina, con
 *     `width` y `height` explícitos para que Outlook no las agrande.
 *   - Responsiva sin media queries ("fluid hybrid"): las dos columnas son
 *     bloques en línea con `max-width`, así que en una pantalla angosta caen una
 *     bajo la otra solas. Outlook de escritorio ignora `max-width`; para él hay
 *     una tabla fantasma dentro de comentarios condicionales `[if mso]`, que el
 *     resto de los clientes no ve.
 *   - Fondo blanco explícito, para que los clientes en modo oscuro no dejen el
 *     logo gris sobre un fondo negro.
 *
 * Funciona en el navegador (window.firmaDCC) y en Node (module.exports).
 */
(function (raiz) {
  "use strict";

  var ROJO = "#d23118";      // Red/Default del kit
  var OSCURO = "#2e3541";    // el gris del logotipo
  var SECUNDARIO = "#5b6573";
  // El bloque de marca —logotipo de 125px, 18px de aire y la fila de redes de
  // 20px— mide 163px, y la línea roja se fija a esa misma altura para que
  // empiecen y terminen juntos. AIRE va arriba de las dos columnas: en
  // escritorio no se nota, y en el teléfono separa las redes de la línea.
  var ALTO_MARCA = 163;
  var AIRE = 16;
  var LETRA = "Arial, Helvetica, sans-serif";
  var TITULO = "'Poppins', Arial, Helvetica, sans-serif";

  var REDES = [
    { img: "red-tiktok.png", alt: "TikTok", url: "https://www.tiktok.com/@dccuchile" },
    { img: "red-facebook.png", alt: "Facebook", url: "https://www.facebook.com/dccuchile" },
    { img: "red-instagram.png", alt: "Instagram", url: "https://www.instagram.com/dccuchile/" },
    { img: "red-linkedin.png", alt: "LinkedIn", url: "https://www.linkedin.com/school/dccuchile/" }
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /** Una fila de contacto: ícono rojo a la izquierda, texto a la derecha. */
  function filaContacto(base, icono, alt, html) {
    return (
      '<tr>' +
        '<td width="30" valign="top" style="width:30px;padding:0 0 10px 0;vertical-align:top;">' +
          '<img src="' + base + icono + '" width="20" height="20" alt="' + alt + '" ' +
            'style="display:block;width:20px;height:20px;border:0;">' +
        '</td>' +
        '<td valign="top" style="padding:0 0 10px 0;vertical-align:top;font-family:' + LETRA + ';' +
          'font-size:15px;line-height:21px;color:' + OSCURO + ';">' + html + '</td>' +
      '</tr>'
    );
  }

  function enlace(href, texto) {
    return '<a href="' + href + '" style="color:' + OSCURO + ';text-decoration:none;">' + texto + '</a>';
  }

  /**
   * datos: { nombre, cargo, telefono, direccion1, direccion2 }
   * opciones.base: URL (terminada en /) donde están las imágenes.
   */
  function firmaDCC(datos, opciones) {
    var d = datos || {};
    var base = (opciones && opciones.base) || "img/";
    if (base.slice(-1) !== "/") base += "/";

    var tel = String(d.telefono || "").replace(/[^\d+]/g, "");
    var direccion = [d.direccion1, d.direccion2].filter(Boolean).map(esc).join("<br>");
    var mapa = "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent([d.direccion1, d.direccion2, "Santiago, Chile"].filter(Boolean).join(", "));

    var contacto = "";
    if (d.telefono) contacto += filaContacto(base, "icono-telefono-rojo.png", "Teléfono",
      enlace("tel:" + tel, esc(d.telefono)));
    if (direccion) contacto += filaContacto(base, "icono-ubicacion-rojo.png", "Dirección",
      enlace(mapa, direccion));

    var redes = REDES.map(function (r) {
      return '<td style="padding:0 9px 0 0;">' +
        '<a href="' + r.url + '" style="text-decoration:none;">' +
          '<img src="' + base + r.img + '" width="20" height="20" alt="' + r.alt + '" ' +
            'style="display:block;width:20px;height:20px;border:0;">' +
        '</a></td>';
    }).join("");

    return (
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" ' +
        'style="width:100%;max-width:640px;border-collapse:collapse;background-color:#ffffff;' +
        'mso-table-lspace:0pt;mso-table-rspace:0pt;">' +
        '<tr>' +
          '<td style="padding:0 0 14px 0;font-size:0;line-height:0;background-color:#ffffff;">' +
            '<!--[if mso]><table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0"><tr><td width="276" valign="top"><![endif]-->' +

            // Columna izquierda: logotipo y redes
            '<div style="display:inline-block;width:100%;max-width:276px;vertical-align:top;">' +
              '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">' +
                '<tr><td style="padding:' + AIRE + 'px 16px 0 2px;">' +
                  '<img src="' + base + 'logo-dcc-gris.png" width="252" height="125" ' +
                    'alt="DCC — Ciencias de la Computación, Universidad de Chile" ' +
                    'style="display:block;width:252px;max-width:100%;height:auto;border:0;">' +
                '</td></tr>' +
                '<tr><td style="padding:18px 0 0 4px;">' +
                  '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
                    redes +
                    '<td style="font-family:' + LETRA + ';font-size:15px;line-height:20px;font-weight:bold;color:' + OSCURO + ';">' +
                      '<span style="color:' + ROJO + ';">/</span>&nbsp;' +
                      '<a href="https://www.instagram.com/dccuchile/" style="color:' + OSCURO + ';text-decoration:none;">dccuchile</a>' +
                    '</td>' +
                  '</tr></table>' +
                '</td></tr>' +
              '</table>' +
            '</div>' +

            '<!--[if mso]></td><td width="364" valign="top"><![endif]-->' +

            // Columna derecha: nombre, cargo y contacto. La línea roja la
            // separa de las redes y mide lo mismo que el bloque del logo y las
            // redes (ALTO_MARCA): el `height` de una celda funciona como mínimo,
            // así que sólo crece si el nombre ocupa dos líneas. Al apilarse en el
            // teléfono la línea queda a la izquierda del nombre.
            '<div style="display:inline-block;width:100%;max-width:364px;vertical-align:top;">' +
              '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">' +
                '<tr><td style="padding:' + AIRE + 'px 0 0 0;">' +
                '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">' +
                '<tr><td height="' + ALTO_MARCA + '" valign="top" style="height:' + ALTO_MARCA + 'px;vertical-align:top;' +
                  'border-left:3px solid ' + ROJO + ';padding:0 8px 0 22px;">' +
                  '<p style="margin:0;font-family:' + TITULO + ';font-size:22px;line-height:27px;' +
                    'font-weight:bold;color:' + OSCURO + ';">' + esc(d.nombre) + '</p>' +
                  (d.cargo ? '<p style="margin:2px 0 16px 0;font-family:' + LETRA + ';font-size:15px;' +
                    'line-height:21px;font-style:italic;color:' + SECUNDARIO + ';">' + esc(d.cargo) + '</p>' : "") +
                  (contacto ? '<table role="presentation" cellpadding="0" cellspacing="0" border="0">' + contacto + '</table>' : "") +
                '</td></tr>' +
                '</table>' +
                '</td></tr>' +
              '</table>' +
            '</div>' +

            '<!--[if mso]></td></tr></table><![endif]-->' +
          '</td>' +
        '</tr>' +
      '</table>'
    );
  }

  /** La firma como documento HTML completo, para descargar o abrir. */
  function documentoFirma(datos, opciones) {
    return '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>Firma — ' + esc(datos.nombre) + '</title>\n</head>\n' +
      '<body style="margin:0;padding:16px;background-color:#ffffff;">\n' +
      firmaDCC(datos, opciones) + '\n</body>\n</html>\n';
  }

  var api = { firmaDCC: firmaDCC, documentoFirma: documentoFirma };
  if (typeof module === "object" && module.exports) module.exports = api;
  else { raiz.firmaDCC = firmaDCC; raiz.documentoFirma = documentoFirma; }
})(this);
