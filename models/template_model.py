"""
Template Model - Manages poster template metadata and text field configuration.
Stores state in db/config.json for persistence across requests.
"""
import json
import os
from PIL import Image

CONFIG_PATH = os.path.join("db", "config.json")


def _load_config() -> dict:
    """Load config from JSON file."""
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {}


def _save_config(config: dict) -> None:
    """Persist config to JSON file."""
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=2)


# ── Template ──────────────────────────────────────────────────────────────────

def save_template(filename: str, filepath: str) -> dict:
    """Save template metadata and return image dimensions."""
    try:
        with Image.open(filepath) as img:
            width, height = img.size
            mode = img.mode
    except Exception as e:
        raise ValueError(f"Cannot open image: {e}")

    config = _load_config()
    config["template"] = {
        "filename": filename,
        "filepath": filepath,
        "width": width,
        "height": height,
        "mode": mode,
    }
    # Reset field positions when new template is uploaded
    config.pop("name_field", None)
    config.pop("phone_field", None)
    _save_config(config)
    return config["template"]


def get_template() -> dict | None:
    """Return current template metadata or None."""
    return _load_config().get("template")


# ── Field Configuration ───────────────────────────────────────────────────────

def save_field_config(name_field: dict, phone_field: dict) -> None:
    """
    Save text field placement configuration.

    Each field dict contains:
        x, y      – relative position (0.0–1.0 of image dimensions)
        font_size – integer pixel size
        color     – hex string e.g. '#FFFFFF'
        bold      – bool
        align     – 'left' | 'center' | 'right'
    """
    config = _load_config()
    config["name_field"] = name_field
    config["phone_field"] = phone_field
    _save_config(config)


def get_field_config() -> tuple[dict | None, dict | None]:
    """Return (name_field, phone_field) or (None, None) if not configured."""
    config = _load_config()
    return config.get("name_field"), config.get("phone_field")


def get_full_config() -> dict:
    """Return entire config object."""
    return _load_config()
