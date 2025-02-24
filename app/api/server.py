# uvicorn server:app --host 0.0.0.0 --port 8000


from fastapi import FastAPI, File, UploadFile
from transformers import pipeline
from PIL import Image
import io

app = FastAPI()

# Load the Hugging Face model
# classifier = pipeline("image-classification", model="google/vit-base-patch16-224")
classifier = pipeline("image-classification", model="google/mobilenet_v2_1.0_224")

@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    try:
        # Read the image
        image = Image.open(io.BytesIO(await file.read()))

        # Classify using the AI model
        result = classifier(image)[0]["label"]

        return {"status": "success", "label": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Run the API with: uvicorn server:app --host 0.0.0.0 --port 8000


