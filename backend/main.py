from fastapi import FastAPI
from moviepy import VideoFileClip
from ultralytics import YOLO
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
import os
import cv2

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