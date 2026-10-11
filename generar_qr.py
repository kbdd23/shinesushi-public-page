#!/usr/bin/env python3
"""Genera el QR del menu de Shine Sushi con el simbolo de la marca al centro.

El QR usa correccion de errores H (tolera perder el 30% de sus datos), que es
lo que permite tapar el centro con el simbolo. Despues de guardar cada PNG el
script lo vuelve a leer desde el disco con OpenCV: si el QR ya no decodifica,
lo avisa y termina con error. Un QR que no escanea es peor que no tener QR.

El simbolo se saca de simbolo_Shine_rmbg.png (el unico con fondo transparente).
Ese archivo trae un defecto: los cortes entre los segmentos de la S quedaron
opacos en blanco en vez de transparentes. Aqui se tratan como huecos, asi que
el simbolo se ve igual sobre blanco pero no ensucia un fondo oscuro.

Cada variante tinta el simbolo con su propio color: el QR negro lleva la S
negra, para que el centro no rompa el monocromo.

TO-DO: un QR para cada ancla, tragos y menu sin ancla. 
Justuficacion: el qr de sushis lo pones el las sucursales, el qr de tragos en la barra, el de burgers junto con el de sushis en las mesas mediante solo hacer el de menu sin ancla
"""

import argparse
import sys
from pathlib import Path

import cv2
import numpy as np
import qrcode
from PIL import Image, ImageColor

RAIZ = Path(__file__).resolve().parent
SIMBOLO = RAIZ / "static/assets/marca/simbolo_Shine_rmbg.png"
CARPETA_SALIDA = RAIZ / "static/assets/marca"

URL_POR_DEFECTO = "https://shinesushidemo.vercel.app/menu#sushi" #importante: para que lleve al menu

# modulos = color del patron.  simbolo = tinte de la S, o None para dejarla
# con su propio naranja original.
VARIANTES = {
    "negro": {"modulos": "#0d0d0d", "simbolo": "#0d0d0d"},
    "naranja": {"modulos": "#f66100", "simbolo": None},
}

BLANCO = "#ffffff"

CORRECCION = qrcode.constants.ERROR_CORRECT_H
BORDE_MODULOS = 4
COBERTURA_SIMBOLO = 0.25
RELLENO_LADOS = 0.5
RELLENO_VERTICAL = 1.0
PX_POR_MODULO = 25
PUNTOS_POR_PULGADA = 300
UMBRAL_BLANCO = 225


def preparar_simbolo(ruta, color):
    """Recorta el simbolo y convierte en huecos los cortes entre segmentos.

    Un pixel es hueco si es transparente, o si es blanco casi puro y opaco
    (los cortes que el quita-fondos dejo sin borrar). Si se pide un color, los
    trazos se tinen con el; si no, conservan su naranja original.
    """
    imagen = Image.open(ruta).convert("RGBA")
    imagen = imagen.crop(imagen.getchannel("A").getbbox())
    arreglo = np.array(imagen)

    alfa = arreglo[:, :, 3]
    minimo = arreglo[:, :, :3].min(axis=2)
    hueco = (alfa == 0) | ((alfa > 200) & (minimo > UMBRAL_BLANCO))

    arreglo[hueco] = (0, 0, 0, 0)
    if color is not None:
        rojo, verde, azul = color
        arreglo[~hueco, 0] = rojo
        arreglo[~hueco, 1] = verde
        arreglo[~hueco, 2] = azul

    return Image.fromarray(arreglo, "RGBA")


def construir_qr(url, color, px_por_modulo):
    codificador = qrcode.QRCode(
        error_correction=CORRECCION,
        box_size=px_por_modulo,
        border=BORDE_MODULOS,
    )
    codificador.add_data(url)
    codificador.make(fit=True)

    imagen = codificador.make_image(fill_color=color, back_color=BLANCO)
    return imagen.convert("RGB"), codificador


def pegar_simbolo(imagen, simbolo, cobertura, px_por_modulo, relleno_lados, relleno_vertical):
    """Centra el simbolo sobre un halo blanco, para que no toque los modulos.

    El relleno va en modulos y se mide por separado: el de los lados y el de
    arriba y abajo. El halo crece con el relleno, asi que menos relleno lateral
    tambien significa menos modulos tapados.
    """
    lado = imagen.size[0]
    ancho = int(round(lado * cobertura))
    alto = int(round(ancho * simbolo.size[1] / simbolo.size[0]))
    pieza = simbolo.resize((ancho, alto), Image.LANCZOS)

    relleno_horizontal = int(round(relleno_lados * px_por_modulo))
    relleno_vertical_px = int(round(relleno_vertical * px_por_modulo))

    halo = Image.new(
        "RGB",
        (ancho + 2 * relleno_horizontal, alto + 2 * relleno_vertical_px),
        BLANCO,
    )
    halo.paste(pieza, (relleno_horizontal, relleno_vertical_px), pieza)

    imagen.paste(halo, ((lado - halo.size[0]) // 2, (lado - halo.size[1]) // 2))
    return imagen


def decodificar(ruta):
    """Lee el PNG desde el disco y devuelve su contenido, o cadena vacia."""
    leido = cv2.QRCodeDetector().detectAndDecode(cv2.imread(str(ruta)))
    return leido[0] if leido else ""


def generar(nombre, argumentos, base):
    ajustes = VARIANTES[nombre]
    tinte = ajustes["simbolo"]
    color_simbolo = ImageColor.getcolor(tinte, "RGB") if tinte else None
    simbolo = preparar_simbolo(base, color_simbolo)

    imagen, codificador = construir_qr(
        argumentos.url, ajustes["modulos"], argumentos.px_por_modulo
    )
    pegar_simbolo(
        imagen,
        simbolo,
        argumentos.cobertura,
        argumentos.px_por_modulo,
        argumentos.relleno_lados,
        argumentos.relleno_vertical,
    )

    ruta = argumentos.salida / "qr-menu-{}.png".format(nombre)
    imagen.save(ruta)

    ancho_px = imagen.size[0]
    centimetros = ancho_px / PUNTOS_POR_PULGADA * 2.54
    correcto = decodificar(ruta) == argumentos.url

    print(
        "{:22s} {:>5d} px  version {:>2d} ({}x{} modulos)  "
        "simbolo {} al {:.0f}%  relleno {}/{} modulos  {:.1f} cm  {}".format(
            ruta.name,
            ancho_px,
            codificador.version,
            codificador.modules_count,
            codificador.modules_count,
            tinte or "naranja propio",
            argumentos.cobertura * 100,
            argumentos.relleno_lados,
            argumentos.relleno_vertical,
            centimetros,
            "decodifica OK" if correcto else "NO DECODIFICA",
        )
    )

    return correcto


def main():
    analizador = argparse.ArgumentParser(description=__doc__)
    analizador.add_argument("--url", default=URL_POR_DEFECTO)
    analizador.add_argument(
        "--color",
        choices=sorted(VARIANTES),
        default=None,
        help="por defecto genera las dos variantes",
    )
    analizador.add_argument(
        "--cobertura",
        type=float,
        default=COBERTURA_SIMBOLO,
        help="ancho del simbolo como fraccion del ancho del QR",
    )
    analizador.add_argument(
        "--relleno-lados",
        type=float,
        default=RELLENO_LADOS,
        help="halo blanco a cada lado, en modulos",
    )
    analizador.add_argument(
        "--relleno-vertical",
        type=float,
        default=RELLENO_VERTICAL,
        help="halo blanco arriba y abajo, en modulos",
    )
    analizador.add_argument("--px-por-modulo", type=int, default=PX_POR_MODULO)
    analizador.add_argument("--salida", type=Path, default=CARPETA_SALIDA)
    argumentos = analizador.parse_args()

    if not SIMBOLO.is_file():
        raise SystemExit("no existe el simbolo: {}".format(SIMBOLO))

    argumentos.salida.mkdir(parents=True, exist_ok=True)

    nombres = [argumentos.color] if argumentos.color else sorted(VARIANTES)
    fallas = [
        nombre for nombre in nombres if not generar(nombre, argumentos, SIMBOLO)
    ]

    if fallas:
        print("fallaron: {}".format(", ".join(fallas)))
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
