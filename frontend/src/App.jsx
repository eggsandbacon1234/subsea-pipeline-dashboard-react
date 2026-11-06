import { useState } from "react";

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [confidence, setConfidence] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [detections, setDetections] = useState([]);
  const [processedVideo,
       setProcessedVideo]
       = useState(null);
 
       
  const handleVideoUpload = async (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setVideoUrl(url);

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    const response = await fetch(
      "http://127.0.0.1:8000/analyze",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    setDetections(
      data.detections
    );

    setProcessedVideo(
      `http://127.0.0.1:8000${data.processed_video}`
    );
  };


  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <h1>Subsea Pipeline Inspection System</h1>

      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
      />

      <div style={{ marginTop: "20px" }}>
        <label>
          Confidence Threshold: {confidence}
        </label>

        <br />

        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={confidence}
          onChange={(e) =>
            setConfidence(
              parseFloat(e.target.value)
            )
          }
          style={{ width: "300px" }}
        />
      </div>

      <p>
        Detections Loaded:
        {detections.length}
      </p>
            

      {videoUrl && processedVideo && (

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px"
          }}
        >

          <div>

            <h2>
              Original Video
            </h2>

            <video
              controls
              width="500"
              src={videoUrl}
            />

          </div>

          <div>

            <h2>
              Processed Video
            </h2>

            <video
              controls
              width="500"
              src={processedVideo}
            />

          </div>

        </div>

      )}

      {detections.length > 0 && (

        <div
          style={{
            marginTop: "30px"
          }}
        >

          <h2>
            Detection Summary
          </h2>

          <p>
            Total Detections:
            {detections.length}
          </p>

          <p>
            Cracks:
            {
              detections.filter(
                d => d.type === "crack"
              ).length
            }
          </p>

          <p>
            Pipes:
            {
              detections.filter(
                d => d.type === "pipe"
              ).length
            }
          </p>

        </div>

      )}

      {detections.length > 0 && (

        <div
          style={{
            marginTop: "30px",
            width: "80%"
          }}
        >

          <h2>
            Detection Timeline
          </h2>

          {detections.map(
            (detection, index) => (

              <div
                key={index}
              >

                {detection.time}s

                {" - "}

                {detection.type}

                {" ("}

                {detection.confidence.toFixed(2)}

                {")"}

              </div>

            )
          )}

        </div>

      )}

      
    </div>
  );
}

export default App;