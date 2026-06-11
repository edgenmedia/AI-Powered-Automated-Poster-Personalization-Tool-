"""
app.py - Flask application factory and entry point.
AI-Powered Automated Poster Personalization Tool
"""
import os
from flask import Flask, render_template
from flask_cors import CORS

from controllers.template_controller import template_bp
from controllers.contact_controller import contact_bp
from controllers.poster_controller import poster_bp
from services.file_service import ensure_dirs


def create_app() -> Flask:
    """Application factory."""
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.secret_key = os.environ.get("SECRET_KEY", "poster-gen-secret-key-2024")
    app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB upload limit

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Allow requests from any origin to all /api/* routes.
    # Set CORS_ORIGINS env var to restrict to specific origins in production,
    # e.g.  CORS_ORIGINS=https://yourdomain.com
    allowed_origins = os.environ.get("CORS_ORIGINS", "*")
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=(allowed_origins != "*"),
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        max_age=600,  # pre-flight cache in seconds
    )
    # ─────────────────────────────────────────────────────────────────────────

    # Ensure db directory structure exists
    ensure_dirs()

    # Register blueprints
    app.register_blueprint(template_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(poster_bp)

    @app.route("/")
    def index():
        return render_template("index.html")

    return app


if __name__ == "__main__":
    app = create_app()
    print("\n🚀  Poster Personalization Tool running at http://127.0.0.1:5000\n")
    app.run(debug=True, port=5000)
