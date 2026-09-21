"""
Gera os ícones do app (favicon, apple-touch-icon, PWA icons): um híbrido
pilha+carro (corpo de bateria deitado, rodinhas e raio vazado no meio),
nas cores da marca D&B — navy #0B1F33 (fundo) e dourado #C89B3C (glifo).

Uso: python scripts/generate-icons.py
Requer: Pillow (pip install pillow)
"""
from PIL import Image, ImageDraw

NAVY = (11, 31, 51, 255)   # #0B1F33
GOLD = (200, 155, 60, 255)  # #C89B3C


def _pt_fn(size, margin_ratio):
    m = size * margin_ratio
    s = (size - 2 * m) / 24.0
    return lambda x, y: (m + x * s, m + y * s), s


def _draw_glyph(draw, pt, s, wheel_style="ring"):
    # corpo (pilha deitada = carro) + terminal saindo pro lado (capo/parachoque)
    draw.rounded_rectangle([pt(0.5, 4), pt(19, 15.5)], radius=1.6 * s, fill=GOLD)
    draw.rounded_rectangle([pt(19, 7.5), pt(22, 12)], radius=0.7 * s, fill=GOLD)

    # rodinhas
    r = 2.4 * s
    for cx in (5.5, 15.5):
        c = pt(cx, 15.5)
        draw.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=NAVY)
        if wheel_style == "ring":
            rr = r * 0.5
            draw.ellipse([c[0] - rr, c[1] - rr, c[0] + rr, c[1] + rr], fill=GOLD)

    # raio vazado (navy) no meio do corpo — sinaliza "elétrico"
    cx, cy, scale = 9.7, 9.7, 1.15
    bolt = [
        (cx + 1.6, cy - 4.3), (cx - 2.9, cy + 0.3), (cx - 0.2, cy + 0.3),
        (cx - 1.2, cy + 4.3), (cx + 3.4, cy - 0.7), (cx + 0.8, cy - 0.7),
    ]
    bolt = [(cx + (x - cx) * scale, cy + (y - cy) * scale) for x, y in bolt]
    draw.polygon([pt(x, y) for x, y in bolt], fill=NAVY)


def make_icon(size, margin_ratio=0.18, rounded_bg=True, bg_radius_ratio=0.24, filename=None):
    if rounded_bg:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=size * bg_radius_ratio, fill=NAVY)
    else:
        # fundo cheio, sem cantos arredondados: usado no apple-touch-icon pois o
        # iOS aplica seu próprio recorte (squircle) por cima — arredondar aqui
        # geraria um contorno duplo/desalinhado no ícone da tela de início.
        img = Image.new("RGBA", (size, size), NAVY)
        draw = ImageDraw.Draw(img)

    pt, s = _pt_fn(size, margin_ratio)
    _draw_glyph(draw, pt, s)

    if filename:
        img.save(filename)
    return img


if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "..", "public")
    os.makedirs(out, exist_ok=True)

    make_icon(180, rounded_bg=False, filename=os.path.join(out, "apple-touch-icon.png"))
    make_icon(192, filename=os.path.join(out, "icon-192.png"))
    make_icon(512, filename=os.path.join(out, "icon-512.png"))

    # favicon.ico multi-resolução (16/32/48)
    icon_48 = make_icon(48)
    icon_48.save(
        os.path.join(out, "favicon.ico"),
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    print("Ícones gerados em /public")
