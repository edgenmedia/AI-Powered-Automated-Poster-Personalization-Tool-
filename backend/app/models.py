from pydantic import BaseModel
from typing import Optional

class FieldMapping(BaseModel):
    column: str
    x: float
    y: float
    width: Optional[float] = 0.0
    fontSize: int = 31
    fontColor: str = "#000000"
    fontFamily: str = "Inter"
    fontWeight: str = "normal"
    align: str = "left"

