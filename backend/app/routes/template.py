from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter(
    prefix="/template",
    tags=["Template"]
)


# ==========================
# MODELS
# ==========================

class Region(BaseModel):
    x: float
    y: float
    w: float
    h: float


class Style(BaseModel):
    font: str
    size: int
    color: str
    weight: str


class TemplateRequest(BaseModel):
    name_region: Region
    phone_region: Region

    name_style: Style
    phone_style: Style


# ==========================
# SAVE TEMPLATE
# ==========================

@router.post("/save")
def save_template(
    data: TemplateRequest
):

    os.makedirs(
        "templates",
        exist_ok=True
    )

    template = {

        "name_region": {
            "x": int(data.name_region.x),
            "y": int(data.name_region.y),
            "w": int(data.name_region.w),
            "h": int(data.name_region.h),
        },

        "phone_region": {
            "x": int(data.phone_region.x),
            "y": int(data.phone_region.y),
            "w": int(data.phone_region.w),
            "h": int(data.phone_region.h),
        },

        "name_style": {
            "font": data.name_style.font,
            "size": data.name_style.size,
            "color": data.name_style.color,
            "weight": data.name_style.weight,
        },

        "phone_style": {
            "font": data.phone_style.font,
            "size": data.phone_style.size,
            "color": data.phone_style.color,
            "weight": data.phone_style.weight,
        }
    }

    template_path = (
        "templates/template.json"
    )

    with open(
        template_path,
        "w"
    ) as f:

        json.dump(
            template,
            f,
            indent=4
        )

    return {
        "message":
            "Template saved successfully",

        "template":
            template,

        "path":
            template_path
    }


# ==========================
# LOAD TEMPLATE
# ==========================

@router.get("/load")
def load_template():

    template_path = (
        "templates/template.json"
    )

    if not os.path.exists(
        template_path
    ):
        return {
            "error":
                "No template saved"
        }

    with open(
        template_path,
        "r"
    ) as f:

        template = json.load(f)

    return template


# ==========================
# CLEAR TEMPLATE
# ==========================

@router.delete("/clear")
def clear_template():

    template_path = (
        "templates/template.json"
    )

    if os.path.exists(
        template_path
    ):

        os.remove(
            template_path
        )

        return {
            "message":
                "Template deleted successfully"
        }

    return {
        "message":
            "No template found"
        }