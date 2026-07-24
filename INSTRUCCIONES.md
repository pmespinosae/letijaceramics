# Optimización de imágenes — Letija Ceramics

## Qué se hizo

Las imágenes del sitio ahora se sirven en formato **WebP** (más ligero que PNG/JPEG)
cuando el navegador del visitante lo soporta, y en su formato original si no —
sin JavaScript, sin riesgo de "salto" de contenido al cargar, y **totalmente
automático**: no hay que acordarse de correr nada cada vez que se agrega una
pieza nueva al catálogo.

## Cómo funciona

1. **`convert_images_to_webp.py`** revisa todas las imágenes `.png` / `.jpg` /
   `.jpeg` del proyecto y genera un `.webp` de cada una que todavía no lo
   tenga (no toca ni borra los originales, y no vuelve a procesar las que ya
   tienen su versión WebP).
2. **`build.js`** (el que ya generaba `index.html` a partir de
   `productos.json`) ahora revisa si cada foto tiene su `.webp` junto a ella;
   si existe, la sirve envuelta en una etiqueta `<picture>`, que deja al
   navegador elegir la versión más ligera que soporte.
3. **GitHub Actions** (`.github/workflows/regenerar-catalogo.yml`) corre
   ambos pasos automáticamente cada vez que:
   - Se edita `productos.json` (agregar/cambiar una pieza), o
   - Se sube una foto nueva (`.png`, `.jpg`, `.jpeg`) a la raíz del proyecto.

## Lo que esto significa para el uso diario

**No cambia nada en tu flujo de trabajo.** Sigue siendo:

```
editar productos.json (o subir fotos nuevas) → git add . → git commit → git push
```

GitHub Actions se encarga solo de generar el `.webp` de cualquier foto nueva y
de actualizar `index.html` — igual que ya hace hoy con los precios y
descripciones.

## Qué esperar en velocidad

- Las imágenes WebP suelen pesar entre 25% y 35% menos que el PNG/JPEG
  original, con la misma calidad visual.
- Los navegadores modernos (Chrome, Safari, Edge, Firefox — prácticamente
  todos los que usa la gente hoy) cargan automáticamente la versión WebP más
  ligera; los muy pocos que no la soportan reciben el archivo original sin
  ningún problema.
- El beneficio se nota más en conexiones lentas (datos móviles) y en el
  tiempo que tarda en aparecer el catálogo completo.

## Si corres esto manualmente alguna vez

Si por alguna razón quieres generar los `.webp` en tu computadora antes de
subir (no es necesario, pero es válido):

```
python convert_images_to_webp.py
node build.js
```

Y luego el `git add . && git commit && git push` de siempre.

## Alcance de este cambio

- Se optimizaron: las miniaturas de cada producto, la portada de categorías,
  el logotipo (header/hero/pie de página) y la foto de la artista.
- **No** se optimizó: las fotos grandes que se ven al hacer clic para
  ampliar una pieza (el "lightbox") — esas se cargan solo cuando alguien
  hace clic, así que no afectan la velocidad de carga inicial de la página.
