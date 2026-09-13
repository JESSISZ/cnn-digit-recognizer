import os
import keras
import huggingface_hub
import fastapi
import numpy as np
from app.features import PredictRequest
from fastapi.staticfiles import StaticFiles

from app.preprocessor import preprocessImage


REPO_ID = "JESSISZ/CNN_numbers"

app = fastapi.FastAPI()
model_name = "cnn_numbers.keras"

if not os.path.exists(model_name):
    try:
        print(f"Getting keras model from https://huggingface.co/JESSISZ/CNN_numbers...")
        model_name = huggingface_hub.hf_hub_download(REPO_ID, model_name)
    except Exception as e:
        print(f"Error ocurred:     {e}")
        exit()

model = keras.models.load_model(model_name)

@app.get("/")
def health():
    return {"status" : "ok"}

@app.post("/predict")
def prediction(image : PredictRequest) -> dict:

    arr = preprocessImage(image.image_base64)
    pred = model.predict(arr)

    return {
        "number" : int(pred.argmax()),
        "confidence" : float(pred.max()),
    }

