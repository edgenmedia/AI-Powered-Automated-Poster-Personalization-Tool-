"""
Image Service - Core Pillow-based image processing.
Renders personalised text onto poster templates.
"""
import os
from PIL import Image, ImageDraw, ImageFont

# Ordered list of font paths to try (bold and regular variants)
_FONT_CANDIDATES = {
    "regular": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ],
    "bold": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ],
}


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Load a TrueType font at the given size, falling back gracefully."""
    candidates = _FONT_CANDIDATES["bold"] if bold else _FONT_CANDIDATES["regular"]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    # Ultimate fallback – Pillow built-in bitmap font (ignores size)
    return ImageFont.load_default()


def _hex_to_rgba(hex_color: str, alpha: int = 255) -> tuple:
    """Convert '#RRGGBB' to (R, G, B, A)."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    return (r, g, b, alpha)


def _draw_text_with_shadow(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    text: str,
    font: ImageFont.FreeTypeFont,
    color: tuple,
    shadow: bool = True,
    align: str = "left",
) -> None:
    """Draw text with optional drop shadow for legibility."""
    # Compute anchor offset for alignment
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
    except AttributeError:
        text_width = draw.textlength(text, font=font)

    if align == "center":
        x -= text_width // 2
    elif align == "right":
        x -= text_width

    if shadow:
        shadow_color = (0, 0, 0, int(color[3] * 0.6) if len(color) > 3 else 153)
        draw.text((x + 2, y + 2), text, font=font, fill=shadow_color)

    draw.text((x, y), text, font=font, fill=color)


def generate_poster(
    template_path: str,
    output_path: str,
    name: str,
    phone: str,
    name_field: dict,
    phone_field: dict,
) -> str:
    """
    Generate a personalised poster with crisp supersampled text.

    Renders at 2× resolution then downscales with LANCZOS for pixel-perfect
    text anti-aliasing regardless of the source image resolution.
    """
    SCALE = 2  # supersampling factor

    src = Image.open(template_path).convert("RGBA")
    w, h = src.size

    # Work at 2× to get crisp edges, then downscale
    big = src.resize((w * SCALE, h * SCALE), Image.LANCZOS)
    txt_layer = Image.new("RGBA", big.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(txt_layer)

    for text, field in [(name, name_field), (phone, phone_field)]:
        px = int(field["x"] * w * SCALE)
        py = int(field["y"] * h * SCALE)
        fs = int(field.get("font_size", 40)) * SCALE
        font = _load_font(fs, bool(field.get("bold", False)))
        color = _hex_to_rgba(field.get("color", "#FFFFFF"))
        align = field.get("align", "left")
        shadow = field.get("shadow", True)
        _draw_text_with_shadow(draw, px, py, text, font, color, shadow=shadow, align=align)

    composite = Image.alpha_composite(big, txt_layer)

    # Downscale back to original size with LANCZOS (crisp result)
    final = composite.resize((w, h), Image.LANCZOS)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save as PNG if output_path ends in .png, else high-quality JPEG
    ext = os.path.splitext(output_path)[1].lower()
    if ext == ".png":
        final.convert("RGBA").save(output_path, "PNG")
    else:
        final.convert("RGB").save(output_path, "JPEG", quality=97, subsampling=0)

    return output_path



def batch_generate(
    template_path: str,
    output_dir: str,
    contacts: list[dict],
    name_field: dict,
    phone_field: dict,
    progress_callback=None,
) -> list[str]:
    """
    Generate personalised posters for a list of contacts.

    Args:
        template_path:     Path to the poster template.
        output_dir:        Directory where generated posters will be saved.
        contacts:          List of {'name': str, 'phone': str}.
        name_field:        Field config for the name.
        phone_field:       Field config for the phone.
        progress_callback: Optional callable(current, total) for progress updates.

    Returns:
        List of generated file paths.
    """
    os.makedirs(output_dir, exist_ok=True)
    generated = []

    for i, contact in enumerate(contacts, start=1):
        safe_name = "".join(c if c.isalnum() or c in " _-" else "_" for c in contact["name"])
        safe_name = safe_name.strip().replace(" ", "_")
        output_path = os.path.join(output_dir, f"{safe_name}.jpg")

        generate_poster(
            template_path=template_path,
            output_path=output_path,
            name=contact["name"],
            phone=contact["phone"],
            name_field=name_field,
            phone_field=phone_field,
        )
        generated.append(output_path)

        if progress_callback:
            progress_callback(i, len(contacts))

    return generated
