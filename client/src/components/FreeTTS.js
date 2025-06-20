// client/src/components/FreeTTS.js
import React, { useState } from 'react';
import { generateFreeAudio } from '../api';

const FreeTTS = ({ onAudioGenerated, onLoadingChange, onMessageChange }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');

  const handleGenerate = async () => {
    if (!text.trim()) {
      onMessageChange("Please enter text for free speech.", "error");
      return;
    }

    onLoadingChange(true);
    onMessageChange('Generating free audio...', '');
    try {
      const data = await generateFreeAudio(text, language);
      if (data.success) {
        onAudioGenerated(data.url);
        onMessageChange("Free audio generated successfully!", "success");
      } else {
        onMessageChange("Error: " + (data.message || "Something went wrong"), "error");
      }
    } catch (error) {
      console.error("Error generating free audio:", error);
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