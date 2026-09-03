"""
Gera os ícones do app (favicon, apple-touch-icon, PWA icons) a partir da
identidade visual já usada no App.jsx: fundo escuro (#0B0F14) + raio (Zap)
na cor accent (#3DD6C7), a mesma combinação do ícone no cabeçalho.

Uso: python scripts/generate-icons.py
Requer: Pillow (pip install pillow)
"""
from PIL import Image, ImageDraw

BG = (11, 15, 20, 255)       # #0B0F14 (DARK_T.bg)
BOLT = (61, 214, 199, 255)   # #3DD6C7 (DARK_T.accent)

# Pontos do raio do Lucide "Zap", path original 24x24:
# M13 2 3 14h9l-1 8 10-12h-9l1-8z
BOLT_POINTS_24 = [
    (13, 2), (3, 14), (12, 14), (11, 22), (21, 10), (12, 10),
]

def make_icon(size, margin_ratio=0.22, filename=None):
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    margin = size * margin_ratio
    usable = size - 2 * margin
    scale = usable / 24

    points = [(margin + x * scale, margin + y * scale) for x, y in BOLT_POINTS_24]
    draw.polygon(points, fill=BOLT)

    if filename:
        img.save(filename)
    return img

if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "..", "public")
    os.makedirs(out, exist_ok=True)

    make_icon(180, filename=os.path.join(out, "apple-touch-icon.png"))
    make_icon(192, filename=os.path.join(out, "icon-192.png"))
    make_icon(512, filename=os.path.join(out, "icon-512.png"))

    # favicon.ico multi-resolução (16/32/48)
    icon_48 = make_icon(48)
    icon_48.save(
        os.path.join(out, "favicon.ico"),
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    print("Ícones gerados em /public")
