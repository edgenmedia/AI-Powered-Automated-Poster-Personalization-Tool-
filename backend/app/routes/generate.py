from fastapi import APIRouter
from fastapi.responses import FileResponse
import os

from app.services.csv_service import load_contacts
from app.services.personalization_service import (
    load_template,
    generate_single_poster,
)
from app.services.zip_service import create_posters_zip

router = APIRouter(
    prefix="/generate",
    tags=["Generate"]
)


@router.post("/personalize")
def personalize():

    poster_path = None
    contacts_path = None

    # ==========================
    # Find uploaded poster
    # ==========================
    for ext in [".png", ".jpg", ".jpeg"]:

        path = os.path.join(
            "uploads",
            f"poster{ext}"
        )

        if os.path.isfile(path):
            poster_path = path
            break

    # ==========================
    # Find uploaded contacts
    # ==========================
    for ext in [".csv", ".xlsx"]:

        path = os.path.join(
            "uploads",
            f"contacts{ext}"
        )

        if os.path.isfile(path):
            contacts_path = path
            break

    print("Poster:", poster_path)
    print("Contacts:", contacts_path)

    # ==========================
    # Validation
    # ==========================
    if poster_path is None:
        return {
            "error": "Poster not uploaded"
        }

    if contacts_path is None:
        return {
            "error": "Contacts not uploaded"
        }

    if not os.path.exists(
        "templates/template.json"
    ):
        return {
            "error": "Template not saved"
        }

    # ==========================
    # Load Data
    # ==========================
    template = load_template()

    contacts = load_contacts(
        contacts_path
    )

    os.makedirs(
        "outputs/posters",
        exist_ok=True
    )

    generated = []

    # ==========================
    # Clear old posters
    # ==========================
    for old_file in os.listdir(
        "outputs/posters"
    ):

        old_path = os.path.join(
            "outputs/posters",
            old_file
        )

        if os.path.isfile(old_path):
            os.remove(old_path)

    # ==========================
    # Generate Posters
    # ==========================
    for contact in contacts:

        poster = generate_single_poster(
            poster_path,
            contact,
            template
        )

        name = str(
            contact.get(
                "Name",
                contact.get(
                    "name",
                    "Unknown"
                )
            )
        )

        filename = (
            f"{name}.png"
        )

        save_path = os.path.join(
            "outputs/posters",
            filename
        )

        poster.save(save_path)

        generated.append(
            filename
        )

    # ==========================
    # Create ZIP
    # ==========================
    zip_path = create_posters_zip()

    return {
        "message":
            "Posters generated successfully",

        "generated_count":
            len(generated),

        "generated_files":
            generated,

        "zip":
            zip_path
    }


@router.get("/download")
def download_zip():

    zip_path = (
        "outputs/posters.zip"
    )

    if not os.path.exists(
        zip_path
    ):
        return {
            "error":
                "ZIP file not found"
        }

    return FileResponse(
        path=zip_path,
        media_type="application/zip",
        filename="posters.zip"
    )


@router.get("/status")
def status():

    uploads = []

    if os.path.exists("uploads"):

        uploads = [
            f
            for f in os.listdir("uploads")
            if os.path.isfile(
                os.path.join(
                    "uploads",
                    f
                )
            )
        ]

    generated = []

    if os.path.exists(
        "outputs/posters"
    ):

        generated = [
            f
            for f in os.listdir(
                "outputs/posters"
            )
            if os.path.isfile(
                os.path.join(
                    "outputs/posters",
                    f
                )
            )
        ]

    return {
        "uploads":
            uploads,

        "template_exists":
            os.path.exists(
                "templates/template.json"
            ),

        "generated":
            generated
    }