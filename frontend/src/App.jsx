import { useState, useRef } from "react";

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [confidence, setConfidence] = useState(0.5);
  const [showPipe, setShowPipe] = useState(true);
  const [showCrack, setShowCrack] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const detections = [
    {
      time: 5,
      type: "crack",
      confidence: 0.7
    },
    {
      time: 10,
      type: "pipe",
      confidence: 0.95
    }
  ];


  
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
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
            src={videoUrl}
            onTimeUpdate={(e) =>
              setCurrentTime(
                e.target.currentTime
              )
            }
          />

          {showCrack && confidence <= 0.7 && (
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

          {showPipe && (
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