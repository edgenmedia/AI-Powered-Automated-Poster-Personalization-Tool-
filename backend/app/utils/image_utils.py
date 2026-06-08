import os
import requests
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple, Dict, Optional

# Local directory to save downloaded fonts
FONTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "fonts")
os.makedirs(FONTS_DIR, exist_ok=True)

# Curated pre-defined popular fonts to start with
POPULAR_FONTS = {
    "Inter": "Inter",
    "Montserrat": "Montserrat",
    "Playfair Display": "PlayfairDisplay",
    "Open Sans": "OpenSans",
    "Roboto": "Roboto",
    "Lato": "Lato",
    "Oswald": "Oswald",
    "Poppins": "Poppins",
    "Lora": "Lora",
    "Raleway": "Raleway",
    "Merriweather": "Merriweather",
}

def resolve_and_download_google_font(family: str, weight: str) -> Optional[str]:
    """
    Attempts to locate and download a TTF font from Google Fonts github OFL/Apache/UFL database.
    """
    family_clean = family.lower().replace(" ", "")
    family_camel = family.replace(" ", "")
    weight_clean = "Bold" if weight.lower() == "bold" else "Regular"
    
    filename = f"{family_camel}-{weight_clean}.ttf"
    local_path = os.path.join(FONTS_DIR, filename)
    
    if os.path.exists(local_path):
        return local_path

    # Try standard paths in Google Fonts Github
    # Path formats can vary:
    # 1. /ofl/family/Family-Weight.ttf
    # 2. /ofl/family/static/Family-Weight.ttf
    # 3. /apache/family/Family-Weight.ttf
    # 4. /ufl/family/Family-Weight.ttf
    possible_urls = [
        f"https://github.com/google/fonts/raw/main/ofl/{family_clean}/{family_camel}-{weight_clean}.ttf",
        f"https://github.com/google/fonts/raw/main/ofl/{family_clean}/static/{family_camel}-{weight_clean}.ttf",
        f"https://github.com/google/fonts/raw/main/apache/{family_clean}/{family_camel}-{weight_clean}.ttf",
        f"https://github.com/google/fonts/raw/main/ufl/{family_clean}/{family_camel}-{weight_clean}.ttf",
    ]
    
    for url in possible_urls:
        try:
            r = requests.get(url, timeout=5, stream=True)
            if r.status_code == 200:
                print(f"Font download success: {url}")
                with open(local_path, "wb") as f:
                    f.write(r.content)
                return local_path
        except Exception as e:
            print(f"Failed to check/download from {url}: {e}")
            
    return None

def get_font_path(family: str, weight: str) -> str:
    """
    Retrieves the local path of the requested font, downloading it from Google Fonts if needed.
    """
    weight_norm = "bold" if weight.lower() == "bold" else "regular"
    
    # Try downloading
    local_path = resolve_and_download_google_font(family, weight_norm)
    if local_path:
        return local_path
        
    # If the exact download failed, check if we have any version of this font locally (e.g. regular instead of bold)
    family_camel = family.replace(" ", "")
    for filename in os.listdir(FONTS_DIR):
        if filename.lower().startswith(family_camel.lower()) and filename.endswith(".ttf"):
            return os.path.join(FONTS_DIR, filename)
            
    # Fallback to Windows system fonts (since user is on Windows)
    win_fonts_dir = "C:\\Windows\\Fonts"
    if os.path.exists(win_fonts_dir):
        is_bold = weight.lower() == "bold"
        req_family = family.lower()
        
        if "playfair" in req_family or "serif" in req_family or "georgia" in req_family:
            font_file = "georgiab.ttf" if is_bold else "georgia.ttf"
        elif "times" in req_family:
            font_file = "timesbd.ttf" if is_bold else "times.ttf"
        elif "courier" in req_family or "mono" in req_family:
            font_file = "courbd.ttf" if is_bold else "cour.ttf"
        else: # Sans-serif fallback
            font_file = "arialbd.ttf" if is_bold else "arial.ttf"
            
        system_path = os.path.join(win_fonts_dir, font_file)
        if os.path.exists(system_path):
            return system_path
            
    # Fallback to standard Inter-Regular or Montserrat-Regular if we have them
    for filename in ["Inter-Regular.ttf", "Montserrat-Regular.ttf"]:
        fallback_path = os.path.join(FONTS_DIR, filename)
        if os.path.exists(fallback_path):
            return fallback_path
            
    # Fallback to ANY font in the fonts folder
    for filename in os.listdir(FONTS_DIR):
        if filename.endswith(".ttf"):
            return os.path.join(FONTS_DIR, filename)
            
    return ""

def get_text_size(text: str, font: ImageFont.FreeTypeFont) -> Tuple[int, int]:
    """
    Computes (width, height) of text using Pillow 10+ compatible bounding box API.
    """
    bbox = font.getbbox(text)  # returns (left, top, right, bottom)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    return w, h

def fit_text_to_width(
    text: str,
    font_family: str,
    font_weight: str,
    base_font_size: int,
    max_width: float
) -> Tuple[str, int]:
    """
    Shrinks font size and/or trims text from the end if it exceeds max_width.
    """
    if not max_width or max_width <= 0:
        return text, base_font_size
        
    min_font_size = max(10, int(base_font_size * 0.6))
    
    # Try shrinking font size
    for fs in range(base_font_size, min_font_size - 1, -1):
        font_path = get_font_path(font_family, font_weight)
        if font_path:
            font = ImageFont.truetype(font_path, fs)
        else:
            font = ImageFont.load_default()
        w, h = get_text_size(text, font)
        if w <= max_width:
            return text, fs
            
    # Word trimming at minimum font size
    words = text.split()
    while len(words) > 1:
        words.pop()
        trimmed_text = " ".join(words) + "..."
        font_path = get_font_path(font_family, font_weight)
        if font_path:
            font = ImageFont.truetype(font_path, min_font_size)
        else:
            font = ImageFont.load_default()
        w, h = get_text_size(trimmed_text, font)
        if w <= max_width:
            return trimmed_text, min_font_size
            
    # Character trimming at minimum font size
    chars = text
    while len(chars) > 3:
        chars = chars[:-1]
        trimmed_text = chars + "..."
        font_path = get_font_path(font_family, font_weight)
        if font_path:
            font = ImageFont.truetype(font_path, min_font_size)
        else:
            font = ImageFont.load_default()
        w, h = get_text_size(trimmed_text, font)
        if w <= max_width:
            return trimmed_text, min_font_size
            
    return text[:5] + "...", min_font_size

from typing import List

def wrap_text_to_width(text: str, font: ImageFont.FreeTypeFont, max_width: float) -> List[str]:
    if not max_width or max_width <= 0:
        return [text]
    words = text.split()
    if not words:
        return []
    lines = []
    current_line = []
    
    for word in words:
        test_line = " ".join(current_line + [word]) if current_line else word
        bbox = font.getbbox(test_line)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
                current_line = [word]
            else:
                lines.append(word)
                current_line = []
                
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def draw_personalized_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: float,
    y: float,
    font_family: str,
    font_size: int,
    font_color: str,
    font_weight: str,
    align: str,
    box_width: Optional[float] = None
) -> None:
    """
    Draws text onto the image with specified styles exactly at (x, y) supporting alignment, bounding box width, and word wrapping.
    """
    font_path = get_font_path(font_family, font_weight)
    
    # Setup initial font at the selected size
    if font_path:
        font = ImageFont.truetype(font_path, font_size)
    else:
        font = ImageFont.load_default()
        
    # Wrap text to width if a box width is provided
    lines = wrap_text_to_width(text, font, box_width)
    
    # Calculate constant line height for consistent spacing
    if hasattr(font, "getmetrics"):
        ascent, descent = font.getmetrics()
        line_h = ascent + descent
    else:
        _, line_h = get_text_size("Ay", font)
        
    y_offset = y
    for line in lines:
        line_w, _ = get_text_size(line, font)
        x_draw = x
        
        # Apply text alignment calculations per line
        if box_width and box_width > 0:
            if align == "center":
                x_draw = x + (box_width - line_w) / 2
            elif align == "right":
                x_draw = x + box_width - line_w
                
        # Draw the line of text using top-left anchor to match Konva's rendering behavior
        draw.text((x_draw, y_offset), line, font=font, fill=font_color, anchor="lt")
        y_offset += line_h * 1.15  # Apply 1.15 line height spacing to match browser canvas
