import { useState, useRef } from "react";

function App() {
  const [report,
  setReport]
  = useState("");
  const [reportLoading,
  setReportLoading]
  = useState(false);
  const originalVideoRef = useRef(null);
  const processedVideoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [confidence, setConfidence] = useState(0.5);
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

    formData.append(
      "confidence",
      confidence
    );

    setLoading(true);
    const response = await fetch(
      "http://127.0.0.1:8000/analyze",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    setLoading(false);

    setDetections(
      data.detections
    );

    setProcessedVideo(
      `http://127.0.0.1:8000${data.processed_video}`
    );
  };

  const uniqueTimeline = [];

detections.forEach(
  detection => {

    const alreadyExists =
      uniqueTimeline.some(
        item =>
          item.type === detection.type &&
          Math.abs(
            item.time -
            detection.time
          ) < 2
      );

    if (!alreadyExists) {
      uniqueTimeline.push(
        detection
      );
    }
  }
);

const generateReport = async () => {

  setReportLoading(true);

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/generate-report",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          totalDetections:
            detections.length,

          cracks:
            detections.filter(
              d => d.type === "crack"
            ).length,

          pipes:
            detections.filter(
              d => d.type === "pipe"
            ).length,

          highestConfidence:
            Math.max(
              ...detections.map(
                d => d.confidence
              )
            ).toFixed(2),

          averageConfidence:
            (
              detections.reduce(
                (sum, d) =>
                  sum + d.confidence,
                0
              ) /
              detections.length
            ).toFixed(2)

        })

      }
    );

    const data =
      await response.json();

    setReport(data.report);

  }

  finally {

    setReportLoading(false);

  }

};

const crackCount =
  detections.filter(
    d => d.type === "crack"
  ).length;

const crackDetections =
  detections.filter(
    d => d.type === "crack"
  );

const highestCrackConfidence =
  crackDetections.length > 0
    ? Math.max(
        ...crackDetections.map(
          d => d.confidence
        )
      ).toFixed(2)
    : 0;

const averageCrackConfidence =
  crackDetections.length > 0
    ? (
        crackDetections.reduce(
          (sum, d) =>
            sum + d.confidence,
          0
        ) /
        crackDetections.length
      ).toFixed(2)
    : 0;

const crackTimeline =
  uniqueTimeline.filter(
    detection =>
      detection.type === "crack"
  );

  return (
    <div
      style={{
        background: "#0F172A",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <h1>
        Subsea Pipeline Inspection Dashboard
      </h1>

      <div
        style={{
          background: "#1E293B",
          padding: "20px",
          borderRadius: "12px",
          width: "90%",
          marginTop: "20px"
        }}
      >

        <h3>
          Inspection Controls
        </h3>

        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
        />

        <div
          style={{
            marginTop: "20px"
          }}
        >

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
            style={{
              width: "300px"
            }}
          />

        </div>

        <p>
          Detections Loaded:
          {detections.length}
        </p>

      </div>


      {loading && (
        <h2>
          Processing Video...
        </h2>
      )}
                  
      <div
        style={{
          background: "#1E293B",
          padding: "20px",
          borderRadius: "12px",
          width: "90%",
          marginTop: "20px"
        }}
      >

        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "12px",
            width: "90%",
            marginTop: "20px"
          }}
        >

          <h2>
            Video Comparison
          </h2>

          <div
            style={{
              display: "flex",
              gap: "20px"
            }}
          >

            <div
              style={{
                flex: 1
              }}
            >

              <h2>
                Original Video
              </h2>

              {videoUrl ? (

                <video
                  ref={originalVideoRef}
                  controls
                  width="100%"
                  src={videoUrl}

                  onPlay={() => {
                    processedVideoRef.current?.play();
                  }}

                  onPause={() => {
                    processedVideoRef.current?.pause();
                  }}

                  onSeeked={(e) => {

                    if (
                      processedVideoRef.current
                    ) {
                      processedVideoRef.current.currentTime =
                        e.target.currentTime;
                    }

                  }}
                />

              ) : (

                <div
                  style={{
                    height: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #475569",
                    borderRadius: "12px"
                  }}
                >

                  No Original Video Uploaded

                </div>

              )}

            </div>

            <div
              style={{
                flex: 1
              }}
            >

              <h2>
                Processed Video
              </h2>

              {processedVideo ? (

                <video
                  ref={processedVideoRef}
                  controls
                  width="100%"
                  src={processedVideo}
                />

              ) : (

                <div
                  style={{
                    height: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #475569",
                    borderRadius: "12px"
                  }}
                >

                  No Processed Video Available

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "30px"
          }}
        >

          <div
            style={{
              background: "#1E293B",
              padding: "20px",
              borderRadius: "12px",
              minWidth: "180px",
              textAlign: "center"
            }}
          >
            <h3>
              Crack Events
            </h3>

            <h1>
              {crackCount}
            </h1>
        
          </div>

          <div
            style={{
              background: "#1E293B",
              padding: "20px",
              borderRadius: "12px",
              minWidth: "180px",
              textAlign: "center"
            }}
          >
            <h3>
              Peak Confidence
            </h3>

            <h1>
              {highestCrackConfidence}
            </h1>

          </div>

          <div
            style={{
              background: "#1E293B",
              padding: "20px",
              borderRadius: "12px",
              minWidth: "180px",
              textAlign: "center"
            }}
          >
            <h3>
              Average Confidence
            </h3>

            <h1>
              {averageCrackConfidence}
            </h1>

          </div>

        </div>


      
      {detections.length > 0 && (

  <div
    style={{
      display: "flex",
      gap: "20px",
      width: "90%",
      marginTop: "30px",
      alignItems: "flex-start"
    }}
  >

    {/* Timeline */}

    <div
      style={{
        flex: 1
      }}
    >

      <h2>
        Crack Timeline
      </h2>

      {crackTimeline.map(
        (detection, index) => (

          <div
            key={index}
            style={{
              cursor: "pointer",
              padding: "10px",
              marginBottom: "8px",
              border: "1px solid white",
              borderRadius: "8px"
            }}

            onClick={() => {

              if (
                originalVideoRef.current
              ) {
                originalVideoRef.current.currentTime =
                  detection.time;
              }

              if (
                processedVideoRef.current
              ) {
                processedVideoRef.current.currentTime =
                  detection.time;
              }

            }}

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

    {/* Report */}

    <div
      style={{
        flex: 1
      }}
    >

      <button
        onClick={generateReport}
      >
        Generate AI Report
      </button>

      {reportLoading && (

        <p>
          Generating Report...
        </p>

      )}

      {report && (

        <div
          style={{
            marginTop: "20px",
            textAlign: "left",
            whiteSpace: "pre-wrap",
            border: "1px solid white",
            padding: "20px",
            borderRadius: "10px"
          }}
        >

          <h2>
            AI Inspection Report
          </h2>

          {report}

        </div>

      )}

    </div>

  </div>

)}
      

      
    </div>
  );
}

export default App;