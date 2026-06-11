"""
Template Controller - Handles poster template upload and retrieval.
"""
import os
import uuid
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename

from models.template_model import save_template, get_template
from services.file_service import UPLOAD_DIR, ensure_dirs

template_bp = Blueprint("template", __name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}


def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@template_bp.route("/api/upload-template", methods=["POST"])
def upload_template():
    """Upload and save the master poster template."""
    ensure_dirs()

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not _allowed(file.filename):
        return jsonify({"error": "Only JPG and PNG files are allowed"}), 400

    try:
        original_name = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{original_name}"
        filepath = os.path.join(UPLOAD_DIR, unique_name)
        file.save(filepath)

        meta = save_template(original_name, filepath)
        return jsonify({
            "success": True,
            "filename": original_name,
            "width": meta["width"],
            "height": meta["height"],
            "preview_url": f"/api/template-preview",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@template_bp.route("/api/template-info", methods=["GET"])
def template_info():
    """Return current template metadata."""
    meta = get_template()
    if not meta:
        return jsonify({"error": "No template uploaded"}), 404
    return jsonify({
        "filename": meta["filename"],
        "width": meta["width"],
        "height": meta["height"],
        "preview_url": "/api/template-preview",
    })


@template_bp.route("/api/template-preview", methods=["GET"])
def template_preview():
    """Serve the uploaded template image."""
    meta = get_template()
    if not meta or not os.path.exists(meta["filepath"]):
        return jsonify({"error": "Template not found"}), 404
    return send_file(meta["filepath"], mimetype="image/jpeg")
