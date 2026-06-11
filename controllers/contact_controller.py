"""
Contact Controller - Handles contact list upload and retrieval.
"""
import os
import uuid
from flask import Blueprint, request, jsonify

from models.contact_model import allowed_file, parse_contacts, save_contacts, get_contacts, get_contacts_meta
from services.file_service import CONTACT_DIR, ensure_dirs
from werkzeug.utils import secure_filename

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/api/upload-contacts", methods=["POST"])
def upload_contacts():
    """Upload and parse a CSV/Excel contact list."""
    ensure_dirs()

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only CSV and Excel (.xlsx) files are allowed"}), 400

    try:
        original_name = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{original_name}"
        filepath = os.path.join(CONTACT_DIR, unique_name)
        file.save(filepath)

        contacts = parse_contacts(filepath)
        if not contacts:
            return jsonify({"error": "No valid contacts found in the file"}), 400

        save_contacts(filepath, original_name, contacts)

        return jsonify({
            "success": True,
            "filename": original_name,
            "count": len(contacts),
            "preview": contacts[:5],  # First 5 for UI preview
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to parse file: {str(e)}"}), 500


@contact_bp.route("/api/contacts", methods=["GET"])
def list_contacts():
    """Return the full list of contacts."""
    contacts = get_contacts()
    meta = get_contacts_meta()
    return jsonify({
        "meta": meta,
        "contacts": contacts,
    })
