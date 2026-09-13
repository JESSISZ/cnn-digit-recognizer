from pydantic import BaseModel
from typing import Optional

class PredictRequest(BaseModel):
    image_base64  : str

