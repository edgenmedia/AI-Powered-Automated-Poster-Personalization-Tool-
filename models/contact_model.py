"""
Contact Model - Parses CSV/Excel contact lists and persists them.
"""
import os
import json
import pandas as pd
from models.template_model import _load_config, _save_config

ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_contacts(filepath: str) -> list[dict]:
    """
    Parse CSV or Excel file and return list of {'name': str, 'phone': str}.
    Accepts flexible column names (case-insensitive).
    """
    ext = filepath.rsplit(".", 1)[1].lower()

    if ext == "csv":
        df = pd.read_csv(filepath, dtype=str)
    else:
        df = pd.read_excel(filepath, dtype=str)

    df.columns = [c.strip().lower() for c in df.columns]

    # Flexible column name matching
    name_col = _find_column(df, ["name", "contact person", "contact name", "person", "representative"])
    phone_col = _find_column(df, ["phone", "mobile", "number", "contact number", "phone number", "mobile number"])

    if name_col is None or phone_col is None:
        raise ValueError(
            f"Could not find Name/Phone columns. Found columns: {list(df.columns)}. "
            "Please use headers like 'Name' and 'Phone'."
        )

    contacts = []
    for _, row in df.iterrows():
        name = str(row[name_col]).strip()
        phone = str(row[phone_col]).strip()
        if name and phone and name != "nan" and phone != "nan":
            contacts.append({"name": name, "phone": phone})

    return contacts


def _find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for col in df.columns:
        for candidate in candidates:
            if candidate in col:
                return col
    return None


def save_contacts(filepath: str, filename: str, contacts: list[dict]) -> None:
    """Persist contact list to config."""
    config = _load_config()
    config["contacts"] = {
        "filename": filename,
        "filepath": filepath,
        "count": len(contacts),
        "data": contacts,
    }
    _save_config(config)


def get_contacts() -> list[dict]:
    """Return parsed contacts list."""
    config = _load_config()
    return config.get("contacts", {}).get("data", [])


def get_contacts_meta() -> dict | None:
    """Return contact metadata (filename, count)."""
    config = _load_config()
    meta = config.get("contacts")
    if meta:
        return {"filename": meta["filename"], "count": meta["count"]}
    return None
