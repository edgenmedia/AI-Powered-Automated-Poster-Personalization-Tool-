"""
Poster Controller - Handles field configuration, poster generation, and downloads.
"""
import os
import base64
from flask import Blueprint, request, jsonify, send_file

from models.template_model import get_template, get_full_config, save_field_config
from models.contact_model import get_contacts
from services.image_service import batch_generate
from services.file_service import create_zip, list_output_files, clear_output, OUTPUT_DIR

poster_bp = Blueprint("poster", __name__)

# In-memory progress tracker (simple; suitable for single-user tool)
_progress = {"current": 0, "total": 0, "running": False, "done": False, "error": None}


@poster_bp.route("/api/save-config", methods=["POST"])
def save_config():
    """Save text field placement configuration from the canvas."""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name_field = data.get("name_field")
    phone_field = data.get("phone_field")

    if not name_field or not phone_field:
        return jsonify({"error": "Both name_field and phone_field are required"}), 400

    required_keys = {"x", "y", "font_size", "color"}
    for key in required_keys:
        if key not in name_field or key not in phone_field:
            return jsonify({"error": f"Missing key '{key}' in field config"}), 400

    save_field_config(name_field, phone_field)
    return jsonify({"success": True})


@poster_bp.route("/api/generate", methods=["POST"])
def generate():
    """Batch-generate all personalised posters."""
    global _progress

    if _progress["running"]:
        return jsonify({"error": "Generation already in progress"}), 409

    config = get_full_config()
    template = config.get("template")
    name_field = config.get("name_field")
    phone_field = config.get("phone_field")
    contacts = get_contacts()

    # Validate prerequisites
    if not template:
        return jsonify({"error": "No template uploaded. Please upload a poster template first."}), 400
    if not name_field or not phone_field:
        return jsonify({"error": "Field positions not configured. Please set name and phone positions on the template."}), 400
    if not contacts:
        return jsonify({"error": "No contacts uploaded. Please upload a contact list first."}), 400
    if not os.path.exists(template["filepath"]):
        return jsonify({"error": "Template file not found. Please re-upload the template."}), 400

    # Clear previous output
    clear_output()

    _progress = {"current": 0, "total": len(contacts), "running": True, "done": False, "error": None}

    def on_progress(current, total):
        _progress["current"] = current
        _progress["total"] = total

    try:
        batch_generate(
            template_path=template["filepath"],
            output_dir=OUTPUT_DIR,
            contacts=contacts,
            name_field=name_field,
            phone_field=phone_field,
            progress_callback=on_progress,
        )
        _progress["running"] = False
        _progress["done"] = True
        return jsonify({"success": True, "generated": len(contacts)})
    except Exception as e:
        _progress["running"] = False
        _progress["error"] = str(e)
        return jsonify({"error": str(e)}), 500


@poster_bp.route("/api/progress", methods=["GET"])
def progress():
    """Return current generation progress."""
    return jsonify(_progress)


@poster_bp.route("/api/output-list", methods=["GET"])
def output_list():
    """List all generated poster files."""
    files = list_output_files()
    return jsonify({"files": files, "count": len(files)})


@poster_bp.route("/api/download/<filename>", methods=["GET"])
def download_file(filename):
    """Download a single generated poster."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    return send_file(filepath, as_attachment=True, download_name=filename)


@poster_bp.route("/api/preview/<filename>", methods=["GET"])
def preview_file(filename):
    """Preview a single generated poster (inline)."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    return send_file(filepath, mimetype="image/jpeg")


@poster_bp.route("/api/download-all", methods=["GET"])
def download_all():
    """Bundle all generated posters into a ZIP and download."""
    files = list_output_files()
    if not files:
        return jsonify({"error": "No posters generated yet"}), 404

    paths = [f["path"] for f in files]
    zip_path = create_zip(paths, label="personalized_posters")
    return send_file(zip_path, as_attachment=True, download_name=os.path.basename(zip_path))


@poster_bp.route("/api/clear-output", methods=["DELETE"])
def delete_output():
    """Clear all generated posters."""
    count = clear_output()
    return jsonify({"success": True, "deleted": count})


@poster_bp.route("/api/save-generated", methods=["POST"])
def save_generated():
    """
    Receive client-rendered poster images (base64 data URLs) and save to db/output/.
    Body: { "images": [{ "name": "Amit_Sharma.jpg", "data_url": "data:image/jpeg;base64,..." }] }
    """
    data = request.json
    if not data or "images" not in data:
        return jsonify({"error": "No images provided"}), 400

    clear_output()
    saved = []

    for item in data["images"]:
        filename = item.get("name", "poster.jpg")
        data_url  = item.get("data_url", "")
        if "," not in data_url:
            continue

        _, b64 = data_url.split(",", 1)
        img_bytes = base64.b64decode(b64)

        safe = "".join(c if c.isalnum() or c in "_-." else "_" for c in filename)
        filepath = os.path.join(OUTPUT_DIR, safe)
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(img_bytes)
        saved.append(safe)

    return jsonify({"success": True, "count": len(saved), "files": saved})
