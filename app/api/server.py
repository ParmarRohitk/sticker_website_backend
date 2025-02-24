from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from PIL import Image
import io

app = FastAPI()

# Allow all origins or specify the allowed origins for security purposes
origins = [
    "http://localhost:3000",  # if your frontend is running on port 3000 (Next.js default)
    "http://127.0.0.1:3000",  # another potential frontend URL
    # Add other domains you need to allow here
]

# Add CORSMiddleware to the app to handle cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Load the Hugging Face model
classifier = pipeline("image-classification", model="google/vit-base-patch16-224")

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
