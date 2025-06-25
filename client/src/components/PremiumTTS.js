// client/src/components/PremiumTTS.js
import React, { useState } from "react";
import { generatePremiumAudio } from "../api";

const PremiumTTS = ({ onAudioGenerated, onLoadingChange, onMessageChange }) => {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");

//   useEffect(() => {
//     loadVoices();
//   }, []);

//   const loadVoices = async () => {
//     onLoadingChange(true);
//     onMessageChange("Loading premium voices...", "");
//     try {
//       const data = await fetchElevenLabsVoices();
//       if (data.success && data.voices.length > 0) {
//         setVoices(data.voices);
//         setSelectedVoiceId(data.voices[0].voice_id); // Select first voice by default
//         onMessageChange("Voices loaded successfully!", "success");
//       } else {
//         onMessageChange(
//           "No ElevenLabs voices available or API key issue.",
//           "error"
//         );
//         setVoices([]);
//       }
//     } catch (error) {
//       console.error("Error loading ElevenLabs voices:", error);
//       onMessageChange(`Error loading voices: ${error.message}`, "error");
//       setVoices([]);
//     } finally {
//       onLoadingChange(false);
//     }
//   };

  const handleGenerate = async () => {
    if (!text.trim()) {
      onMessageChange("Please enter text for premium speech.", "error");
      return;
    }
    if (!selectedVoiceId) {
      onMessageChange("Please select a premium voice.", "error");
      return;
    }

    onLoadingChange(true);
    onMessageChange("Generating premium audio...", "");
    try {
      const data = await generatePremiumAudio(text, selectedVoiceId);
      if (data.success) {
        onAudioGenerated(data.url);
        onMessageChange("Premium audio generated successfully!", "success");
      } else {
        onMessageChange(
          "Error: " + (data.message || "Something went wrong"),
          "error"
        );
      }
    } catch (error) {
      console.error("Error generating premium audio:", error);
      onMessageChange(
        "Error generating premium audio: " + error.message,
        "error"
      );
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="tts-control-group">
      <h3>Premium Text-to-Speech Generation</h3>
      <div className="tts-input-area">
        <textarea
          id="ttsTextPremium"
          maxLength="2000"
          placeholder="Enter your text here for premium speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div className="select-group">
          <label htmlFor="premiumVoiceId">Voice:</label>
          <select
            id="premiumVoiceId"
            value={selectedVoiceId}
            onChange={(e) => setSelectedVoiceId(e.target.value)}
            disabled={voices.length === 0}
          >
            {voices.length === 0 ? (
              <option value="">No voices available</option>
            ) : (
              voices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name} ({voice.labels?.gender || "N/A"},{" "}
                  {voice.labels?.accent || "N/A"})
                </option>
              ))
            )}
          </select>
          <button className="btn" onClick={handleGenerate}>
            Generate Premium Audio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumTTS;
