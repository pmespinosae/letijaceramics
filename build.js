#!/usr/bin/env node
/* ===================================================
   Letija Ceramics · build.js
   Regenera index.html a partir de productos.json.

   Uso:  node build.js
   Ejecutar SIEMPRE después de editar productos.json,
   antes de hacer git add / commit / push.
   =================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'productos.json');
const HTML_FILE = path.join(ROOT, 'index.html');
const WA_PHONE = '525513530493';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function encodeFile(name) {
  return encodeURIComponent(name);
}

function formatPrecioVisible(n) {
  return Number(n).toLocaleString('en-US');
}

function mensajeWhatsAppFinal(producto) {
  const texto = producto.mensajeWhatsApp.replace('$_precio', '$' + producto.precio);
  return encodeURIComponent(texto);
}

function waHref(producto) {
  return 'https://wa.me/' + WA_PHONE + '?text=' + mensajeWhatsAppFinal(producto);
}

/* ---------- Renderizar una tarjeta de categoría ---------- */
function renderCatCard(cat) {
  return (
    '          <a class="cat-card" href="#' + cat.id + '" aria-label="Ver ' + escapeHtml(cat.nombre) + '">\n' +
    '            <span class="cat-card-media"><img src="' + encodeFile(cat.imagen) + '" alt="' + escapeHtml(cat.nombre) + '" loading="lazy" /></span>\n' +
    '            <span class="cat-card-name">' + escapeHtml(cat.nombre) + ' <span class="arrow" aria-hidden="true">→</span></span>\n' +
    '          </a>'
  );
}

/* ---------- Renderizar una tarjeta de producto ---------- */
function renderProductCard(p, indent) {
  const pad = ' '.repeat(indent);
  const numFotos = p.fotos.length;
  const esPlural = numFotos > 1;
  const mediaClass = p.imagenCompleta ? ' media-contain' : '';
  const badge = esPlural
    ? pad + '    <span class="media-badge" aria-hidden="true">🔍 ' + numFotos + ' fotos</span>\n'
    : '';
  return (
    pad + '<article class="product-card" data-title="' + escapeHtml(p.titulo) + '" data-images="' + p.fotos.map(encodeFile).join('|') + '">\n' +
    pad + '  <button type="button" class="product-media' + mediaClass + '" aria-label="Ver ' + (esPlural ? 'imágenes' : 'imagen') + ' de ' + escapeHtml(p.titulo) + '">\n' +
    pad + '    <img src="' + encodeFile(p.fotos[0]) + '" alt="' + escapeHtml(p.alt) + '" loading="lazy" />\n' +
    badge +
    pad + '  </button>\n' +
    pad + '  <div class="product-body">\n' +
    pad + '    <h4 class="product-name">' + escapeHtml(p.titulo) + '</h4>\n' +
    pad + '    <p class="product-desc">' + escapeHtml(p.descripcion) + '</p>\n' +
    pad + '    <p class="product-dims">Medidas: ' + escapeHtml(p.medidas) + '</p>\n' +
    pad + '    <div class="product-footer">\n' +
    pad + '      <span class="product-price">$' + formatPrecioVisible(p.precio) + ' <span>MX</span></span>\n' +
    pad + '      <a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="' + waHref(p) + '">Me interesa</a>\n' +
    pad + '    </div>\n' +
    pad + '  </div>\n' +
    pad + '</article>'
  );
}

/* ---------- Reemplazar el contenido entre dos marcadores ---------- */
function replaceBetween(html, startMarker, endMarker, content) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No se encontraron los marcadores: ' + startMarker + ' / ' + endMarker);
  }
  return (
    html.slice(0, start + startMarker.length) + '\n' +
    content + '\n' +
    html.slice(end)
  );
}

/* ---------- Programa principal ---------- */
function main() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  let html = fs.readFileSync(HTML_FILE, 'utf8');

  const categorias = data.categorias;
  const productos = data.productos;
  const catById = {};
  categorias.forEach(function (c) { catById[c.id] = c; });

  /* 1) Galería de categorías */
  const catCardsHtml = categorias.map(renderCatCard).join('\n');
  html = replaceBetween(html, '<!-- AUTO:CATEGORIAS:START -->', '<!-- AUTO:CATEGORIAS:END -->', catCardsHtml);

  /* 2) Productos de Obras Disponibles, agrupados por categoría */
  categorias.forEach(function (cat) {
    const productosCategoria = productos.filter(function (p) {
      return p.seccion === 'obras' && p.categoria === cat.id;
    });
    const html2 = productosCategoria.map(function (p) { return renderProductCard(p, 12); }).join('\n\n');
    html = replaceBetween(
      html,
      '<!-- AUTO:PRODUCTOS:' + cat.id + ':START -->',
      '<!-- AUTO:PRODUCTOS:' + cat.id + ':END -->',
      html2
    );
  });

  /* 3) Sobre Pedido */
  const productosSobrePedido = productos.filter(function (p) { return p.seccion === 'sobre-pedido'; });
  const sobrePedidoHtml = productosSobrePedido.map(function (p) { return renderProductCard(p, 10); }).join('\n\n');
  html = replaceBetween(
    html,
    '<!-- AUTO:PRODUCTOS:sobre-pedido:START -->',
    '<!-- AUTO:PRODUCTOS:sobre-pedido:END -->',
    sobrePedidoHtml
  );

  /* 4) JSON-LD: ItemList de productos (solo Obras Disponibles) */
  const productosObras = productos.filter(function (p) { return p.seccion === 'obras'; });
  const itemListElement = productosObras.map(function (p, i) {
    return {
      '@type': 'Product',
      position: i + 1,
      name: p.titulo,
      category: catById[p.categoria].nombre,
      image: 'https://letijaceramics.com.mx/' + encodeFile(p.fotos[0]),
      description: p.descripcion + ' Medidas: ' + p.medidas + '.',
      brand: 'Letija Ceramics',
      offers: {
        '@type': 'Offer',
        price: String(p.precio),
        priceCurrency: 'MXN',
        availability: 'https://schema.org/InStock'
      }
    };
  });
  const jsonLdProductos = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catálogo de cerámica artesanal Letija Ceramics',
    itemListElement: itemListElement
  };
  html = html.replace(
    /(<script type="application\/ld\+json" id="jsonld-productos">\n)[\s\S]*?(\n\s*<\/script>)/,
    function (_m, open, close) {
      return open + '  ' + JSON.stringify(jsonLdProductos) + close;
    }
  );

  /* 5) JSON-LD: priceRange en LocalBusiness, calculado de todos los productos */
  const todosPrecios = productos.map(function (p) { return p.precio; });
  const min = Math.min.apply(null, todosPrecios);
  const max = Math.max.apply(null, todosPrecios);
  const priceRange = '$' + min + ' - $' + max + ' MXN';
  html = html.replace(
    /(<script type="application\/ld\+json" id="jsonld-business">[\s\S]*?"priceRange":\s*")[^"]*(")/,
    function (_m, before, after) { return before + priceRange + after; }
  );

  /* 6) meta description / og / twitter: precio "desde" más bajo */
  html = html.replace(/Desde \$\d+(?:,\d+)? MX/g, 'Desde $' + formatPrecioVisible(min) + ' MX');

  fs.writeFileSync(HTML_FILE, html, 'utf8');
  console.log('index.html regenerado a partir de productos.json (' + productos.length + ' piezas).');
}

main();
