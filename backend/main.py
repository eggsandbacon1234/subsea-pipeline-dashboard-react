from fastapi import FastAPI
from moviepy import VideoFileClip
from ultralytics import YOLO
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
import os
import cv2
import google.generativeai as genai

os.makedirs("uploads", exist_ok=True)

app = FastAPI()
app.mount(
    "/outputs",
    StaticFiles(directory="outputs"),
    name="outputs"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("model/best.pt")
genai.configure(
    api_key="AQ.Ab8RN6K8FIAiiEQZHq8OjQ4EC4oyEO1Z7OnM9NITlmyXgznbAw"
)


print("CALLING GEMINI")
gemini_model = genai.GenerativeModel(
        "models/gemini-3.5-flash-lite"
    )
print("GEMINI RESPONSE RECEIVED")

@app.get("/")
def root():
    return {
        "status": "working",
        "model_loaded": True
    }

@app.post("/analyze")
async def analyze_video(
    file: UploadFile = File(...),
    confidence: float = Form(...)
):

    video_path = os.path.join(
        "uploads",
        file.filename
    )

    with open(video_path, "wb") as f:
        f.write(await file.read())

    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS)

    cap.release()
    print(
        f"Running analysis with confidence={confidence}"
    )

    print(type(model))
    print(model)
    
    results = model.predict(
        source=video_path,
        conf=confidence,
        save=True,
        vid_stride=3,
        project=os.path.abspath("outputs"),
        name="processed",
        exist_ok=True
    )

    processed_video = str(results[0].save_dir)
    print(processed_video)

    original_name = os.path.splitext(
        file.filename
    )[0]

    avi_file = os.path.join(
        processed_video,
        f"{original_name}.avi"
    )

    mp4_file = os.path.join(
        processed_video,
        f"{original_name}.mp4"
    )

    print("AVI FILE:", avi_file)
    print("MP4 FILE:", mp4_file)
    print("AVI EXISTS:", os.path.exists(avi_file))
    clip = VideoFileClip(avi_file)

    clip.write_videofile(
        mp4_file,
        codec="libx264",
        audio=False
    )
    clip.close()

    detections = []

    for frame_index, result in enumerate(results):

        timestamp = (frame_index * 3) / fps

        for box in result.boxes:

            class_id = int(box.cls[0])

            mask_points = []

            if result.masks is not None:
                mask_points = (
                    result.masks.xy[0]
                    .tolist()
                )

            detections.append(
                {
                    "time": round(timestamp, 2),
                    "type": result.names[class_id],
                    "confidence": float(box.conf[0]),
                    "mask": mask_points
                }
            )


    return {
        "detections": detections,
        "processed_video": f"/outputs/processed/{original_name}.mp4"
    }

@app.post("/generate-report")
async def generate_report(
    data: dict
):

    print("REPORT REQUEST RECEIVED")

    prompt = f"""
    You are a subsea pipeline inspection engineer.

    Inspection Results:

    Total Detections:
    {data['totalDetections']}

    Crack Detections:
    {data['cracks']}

    Pipe Detections:
    {data['pipes']}

    Highest Confidence:
    {data['highestConfidence']}

    Average Confidence:
    {data['averageConfidence']}

    Generate a professional inspection report
    using the following sections:

    1. Executive Summary

    2. Risk Assessment

    3. Key Findings

    4. Maintenance Recommendations

    Keep the report concise and professional.
    """

    print("PROMPT CREATED")

    try:

        response = gemini_model.generate_content(
            prompt
        )

        print("GEMINI RESPONSE RECEIVED")

        return {
            "report": response.text
        }

    except Exception as e:

        print("GEMINI ERROR:", str(e))

        return {
            "report":
                f"Gemini Error: {str(e)}"
        }