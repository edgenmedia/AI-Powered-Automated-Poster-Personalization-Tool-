import os
import json
import cv2
from PIL import Image, ImageDraw, ImageFont

# ==========================
# FONT MAPPING
# ==========================

FONT_MAP = {
    "Arial": [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ],

    "Roboto": [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ],

    "Poppins": [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ],

    "Montserrat": [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ],

    "Open Sans": [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ],

    "Georgia": [
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
    ],

    "Verdana": [
        "/Library/Fonts/Verdana.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ],
}


# ==========================
# LOAD FONT
# ==========================

def get_font(
    font_name="Arial",
    size=30
):
    paths = FONT_MAP.get(
        font_name,
        FONT_MAP["Arial"]
    )

    for path in paths:

        if os.path.exists(path):

            try:
                return ImageFont.truetype(
                    path,
                    size
                )

            except Exception:
                pass

    return ImageFont.load_default()


# ==========================
# HEX TO RGB
# ==========================

def hex_to_rgb(hex_color):

    hex_color = (
        hex_color
        .replace("#", "")
    )

    if len(hex_color) != 6:
        return (0, 0, 0)

    return tuple(
        int(
            hex_color[i:i + 2],
            16
        )
        for i in (0, 2, 4)
    )


# ==========================
# LOAD TEMPLATE
# ==========================

def load_template():

    with open(
        "templates/template.json",
        "r"
    ) as f:

        return json.load(f)


# ==========================
# DRAW TEXT
# ==========================

def draw_text(
    pil_image,
    text,
    region,
    style
):

    draw = ImageDraw.Draw(
        pil_image
    )

    font_name = style.get(
        "font",
        "Arial"
    )

    font_size = int(
        style.get(
            "size",
            30
        )
    )

    color = hex_to_rgb(
        style.get(
            "color",
            "#000000"
        )
    )

    font = get_font(
        font_name,
        font_size
    )

    x = int(region["x"])
    y = int(region["y"])
    w = int(region["w"])
    h = int(region["h"])

    bbox = draw.textbbox(
        (0, 0),
        text,
        font=font
    )

    text_width = (
        bbox[2] - bbox[0]
    )

    text_height = (
        bbox[3] - bbox[1]
    )

    tx = x + (
        (w - text_width) // 2
    )

    ty = y + (
        (h - text_height) // 2
    )

    draw.text(
        (tx, ty),
        text,
        fill=color,
        font=font
    )

    return pil_image


# ==========================
# GENERATE SINGLE POSTER
# ==========================

def generate_single_poster(
    poster_path,
    contact,
    template
):

    image = cv2.imread(
        poster_path
    )

    if image is None:

        raise Exception(
            f"Unable to open poster: "
            f"{poster_path}"
        )

    image_rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    pil_image = Image.fromarray(
        image_rgb
    )

    name = (
        contact.get("Name")
        or contact.get("name")
        or contact.get("NAME")
        or ""
    )

    phone = (
        contact.get("Phone")
        or contact.get("phone")
        or contact.get("PHONE")
        or ""
    )

    pil_image = draw_text(
        pil_image,
        str(name),
        template["name_region"],
        template.get(
            "name_style",
            {
                "font": "Arial",
                "size": 30,
                "color": "#000000",
            }
        )
    )

    pil_image = draw_text(
        pil_image,
        str(phone),
        template["phone_region"],
        template.get(
            "phone_style",
            {
                "font": "Arial",
                "size": 30,
                "color": "#000000",
            }
        )
    )

    return pil_image