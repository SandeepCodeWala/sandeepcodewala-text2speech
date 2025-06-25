// client/src/components/FreeTTS.js
import React, { useState } from "react";
import { generateFreeAudio } from "../api";
import ReactGA from "react-ga4";

const FreeTTS = ({ onAudioGenerated, onLoadingChange, onMessageChange }) => {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");

  const handleGenerate = async () => {
    if (!text.trim()) {
      onMessageChange("Please enter text for free speech.", "error");
      return;
    }

    onLoadingChange(true);
    onMessageChange("Generating free audio...", "");
    try {
      const data = await generateFreeAudio(text, language);
      if (data.success) {
        ReactGA.event({
          category: "Speech Generation", // Broad category for the event
          action: "Speech Generated", // Specific action taken
      
          value: text.length, // Optional: Numeric value, e.g., length of text
          // You can add more custom parameters here:
          // custom_dimension_1: 'some_value',
          // custom_metric_1: 123,
        });
        console.log("GA4 event sent: Speech Generated");
        onAudioGenerated(data.url);
        onMessageChange("Free audio generated successfully!", "success");
      } else {
        ReactGA.event({
          category: "Speech Generation",
          action: "Speech Generation Failed",
          label: `Error`, // Detailed error message
          value: text.length,
        });
        console.error("GA4 event sent: Speech Generation Failed");
        onMessageChange(
          "Error: " + (data.message || "Something went wrong"),
          "error"
        );
      }
    } catch (error) {
      console.error("Error generating free audio:", error);
        ReactGA.event({
        category: 'Speech Generation',
        action: 'Speech Generation Failed',
        label: `Error`, // Detailed error message
        value: text.length,
      });
      console.error('GA4 event sent: Speech Generation Failed');
      onMessageChange("Error generating free audio: " + error.message, "error");
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="tts-control-group">
      <h3>Free Text-to-Speech Generation</h3>
      <div className="tts-input-area">
        <textarea
          id="ttsTextFree"
          maxLength="2000"
          placeholder="Enter your text here for free speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div className="select-group">
          <label htmlFor="freeLangCode">Language:</label>
          <select
            id="freeLangCode"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
          <button className="btn" onClick={handleGenerate}>
            Generate Free Audio
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeTTS;
