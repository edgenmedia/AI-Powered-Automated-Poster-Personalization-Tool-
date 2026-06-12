import os
import zipfile


def create_posters_zip():
    posters_dir = "outputs/posters"
    zip_path = "outputs/posters.zip"

    with zipfile.ZipFile(
        zip_path,
        "w",
        zipfile.ZIP_DEFLATED
    ) as zipf:

        for filename in os.listdir(posters_dir):
            file_path = os.path.join(
                posters_dir,
                filename
            )

            zipf.write(
                file_path,
                arcname=filename
            )

    return zip_path