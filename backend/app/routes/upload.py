from fastapi import APIRouter, UploadFile, File
import os
import shutil

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


def delete_existing(file_type: str):
    """
    Delete old uploaded files of the same type.
    """

    allowed_extensions = {
        "poster": [".png", ".jpg", ".jpeg"],
        "contacts": [".csv", ".xlsx"],
    }

    for filename in os.listdir(UPLOAD_DIR):

        path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        # Skip folders
        if os.path.isdir(path):
            continue

        ext = os.path.splitext(filename)[1].lower()

        if ext in allowed_extensions[file_type]:
            os.remove(path)


@router.post("/poster")
async def upload_poster(
    file: UploadFile = File(...)
):

    ext = os.path.splitext(
        file.filename
    )[1].lower()

    if ext not in [".png", ".jpg", ".jpeg"]:
        return {
            "error":
                "Only PNG/JPG/JPEG files allowed"
        }

    delete_existing("poster")

    save_path = os.path.join(
        UPLOAD_DIR,
        f"poster{ext}"
    )

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "message":
            "Poster uploaded successfully",

        "filename":
            os.path.basename(save_path),

        "path":
            save_path
    }


@router.post("/contacts")
async def upload_contacts(
    file: UploadFile = File(...)
):

    ext = os.path.splitext(
        file.filename
    )[1].lower()

    if ext not in [".csv", ".xlsx"]:
        return {
            "error":
                "Only CSV/XLSX files allowed"
        }

    delete_existing("contacts")

    save_path = os.path.join(
        UPLOAD_DIR,
        f"contacts{ext}"
    )

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "message":
            "Contacts uploaded successfully",

        "filename":
            os.path.basename(save_path),

        "path":
            save_path
    }


@router.get("/status")
def upload_status():

    files = []

    for filename in os.listdir(UPLOAD_DIR):

        path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        if os.path.isfile(path):
            files.append(filename)

    return {
        "uploaded_files": files
    }