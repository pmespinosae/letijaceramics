#!/usr/bin/env python3
"""
Letija Ceramics · convert_images_to_webp.py

Genera una version .webp de cada imagen PNG/JPEG del proyecto que
todavia no la tenga. No modifica ni elimina los originales.

Se corre automaticamente en el GitHub Action (regenerar-catalogo.yml)
antes de build.js, pero tambien se puede correr a mano:

    python convert_images_to_webp.py
"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Falta la libreria Pillow. Instala con: pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent
EXTENSIONES = {".png", ".jpg", ".jpeg"}
CALIDAD_WEBP = 82


def main():
    convertidas = 0
    saltadas = 0
    errores = 0

    # Orden: si un mismo nombre existe como .png y .jpeg, el .png tiene prioridad
    # (así el .webp se genera de la versión de mejor calidad, no del .jpeg).
    def prioridad(p):
        return (p.stem.lower(), 0 if p.suffix.lower() == ".png" else 1)

    archivos = sorted(
        [p for p in ROOT.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONES],
        key=prioridad,
    )

    for archivo in archivos:
        destino = archivo.with_suffix(".webp")
        if destino.exists():
            saltadas += 1
            continue

        try:
            with Image.open(archivo) as img:
                img = img.convert("RGBA") if img.mode in ("RGBA", "P", "LA") else img.convert("RGB")
                img.save(destino, "WEBP", quality=CALIDAD_WEBP, method=6)

            tam_original = archivo.stat().st_size
            tam_nuevo = destino.stat().st_size
            reduccion = 100 * (1 - tam_nuevo / tam_original) if tam_original else 0
            print(f"OK    {archivo.name} -> {destino.name}  ({reduccion:.0f}% mas ligero)")
            convertidas += 1
        except Exception as e:
            print(f"ERROR {archivo.name}: {e}", file=sys.stderr)
            errores += 1

    print(f"\nListo: {convertidas} nuevas, {saltadas} ya existian, {errores} con error.")
    if errores:
        sys.exit(1)


if __name__ == "__main__":
    main()
