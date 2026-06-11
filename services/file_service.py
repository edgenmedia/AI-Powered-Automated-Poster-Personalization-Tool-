"""
File Service - ZIP creation and file management utilities.
"""
import os
import zipfile
from datetime import datetime


OUTPUT_DIR = os.path.join("db", "output")
UPLOAD_DIR = os.path.join("db", "uploads")
CONTACT_DIR = os.path.join("db", "contacts")


def ensure_dirs() -> None:
    """Create all required database directories."""
    for path in (OUTPUT_DIR, UPLOAD_DIR, CONTACT_DIR):
        os.makedirs(path, exist_ok=True)


def create_zip(file_paths: list[str], label: str = "posters") -> str:
    """
    Bundle a list of file paths into a ZIP archive.

    Returns the path to the created ZIP file.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_name = f"{label}_{timestamp}.zip"
    zip_path = os.path.join(OUTPUT_DIR, zip_name)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fp in file_paths:
            if os.path.exists(fp):
                zf.write(fp, arcname=os.path.basename(fp))

    return zip_path


def list_output_files() -> list[dict]:
    """List all generated poster JPGs in the output directory."""
    if not os.path.exists(OUTPUT_DIR):
        return []
    files = []
    for fname in sorted(os.listdir(OUTPUT_DIR)):
        if fname.lower().endswith((".jpg", ".jpeg", ".png")):
            full = os.path.join(OUTPUT_DIR, fname)
            files.append({
                "filename": fname,
                "path": full,
                "size_kb": round(os.path.getsize(full) / 1024, 1),
            })
    return files


def clear_output() -> int:
    """Delete all files in output directory. Returns count deleted."""
    count = 0
    if os.path.exists(OUTPUT_DIR):
        for fname in os.listdir(OUTPUT_DIR):
            fp = os.path.join(OUTPUT_DIR, fname)
            if os.path.isfile(fp):
                os.remove(fp)
                count += 1
    return count
