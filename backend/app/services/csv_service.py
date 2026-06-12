import pandas as pd


def load_contacts(path):

    path = path.lower()

    if path.endswith(".csv"):

        df = pd.read_csv(path)

    elif path.endswith(".xlsx"):

        df = pd.read_excel(path)

    else:

        raise Exception(
            f"Unsupported file format: {path}"
        )

    return df.to_dict(
        orient="records"
    )