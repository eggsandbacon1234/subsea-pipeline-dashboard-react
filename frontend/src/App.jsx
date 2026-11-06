import { useState, useEffect } from "react";

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [confidence, setConfidence] = useState(0.5);
  const [showPipe, setShowPipe] = useState(true);
  const [showCrack, setShowCrack] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [detections, setDetections] = useState([]);
 
  const visibleCracks = detections.filter(
    detection =>
      detection.type === "crack" &&
      detection.confidence >= confidence &&
      Math.abs(
        currentTime - detection.time
      ) <= 1
  );

  const visiblePipes = detections.filter(
    detection =>
      detection.type === "pipe" &&
      detection.confidence >= confidence &&
      Math.abs(
        currentTime - detection.time
      ) <= 1
  );
  
  const firstDetection = detections[0];


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

      <div style={{ marginTop: "20px" }}>
        <label>
          <input
            type="checkbox"
            checked={showPipe}
            onChange={() =>
              setShowPipe(!showPipe)
            }
          />
          Show Pipe Mask
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={showCrack}
            onChange={() =>
              setShowCrack(!showCrack)
            }
          />
          Show Crack Mask
        </label>

      </div>

      <p>
        Current Time: {currentTime.toFixed(1)} seconds
      </p>

      <p>
        Detections Loaded:
        {detections.length}
      </p>
            

      {videoUrl && (
        <div
          style={{
            position: "relative",
            width: "800px",
            marginTop: "20px"
          }}
        >
          <video
            controls
            width="800"
            height="450"
            src={videoUrl}
            onTimeUpdate={(e) =>
              setCurrentTime(
                e.target.currentTime
              )
            }
          />

          <svg
            width="800"
            height="450"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none"
            }}
          >
            
            {firstDetection && firstDetection.mask && (

              <polygon
                points={
                  firstDetection.mask
                    .map(
                      point =>
                        `${point[0] * (800 / 1920)},
                        ${point[1] * (450 / 1080)}`
                    )
                    .join(" ")
                }

                fill="rgba(0,0,255,0.3)"

                stroke="blue"

                strokeWidth="2"
              />

            )}

          </svg>

          {showCrack && visibleCracks.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100px",
                left: "250px",
                background: "red",
                color: "white",
                padding: "10px",
                borderRadius: "5px"
              }}
            >
              Crack Detected (0.7)
            </div>
          )}

          {showPipe && visiblePipes.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "200px",
                left: "150px",
                background: "blue",
                color: "white",
                padding: "10px",
                borderRadius: "5px"
              }}
            >
              Pipe Mask
            </div>
          )}

        </div>
      )}

      
    </div>
  );
}

export default App;