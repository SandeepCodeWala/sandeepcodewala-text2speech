import React, { useState } from 'react';
// Assuming ReactGA is set up in your App.js or a higher level if you want GA events here too
import ReactGA from "react-ga4"; // Uncomment if you want to add GA events to AzureTTS

const AzureTTS = ({ onAudioGenerated, onLoadingChange, onMessageChange }) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('en-IN-NeerjaNeural'); // Default Indian English Female

  // List of Azure Indian voices for convenience
 const azureVoices = [
    // --- Indian English Voices ---
    { name: 'Indian English (Female - NeerjaNeural)', value: 'en-IN-NeerjaNeural' },
    { name: 'Indian English (Male - PrabhatNeural)', value: 'en-IN-PrabhatNeural' },

    // --- Hindi Voices ---
    { name: 'Hindi (Female - SwaraNeural)', value: 'hi-IN-SwaraNeural' },
    { name: 'Hindi (Male - MadhurNeural)', value: 'hi-IN-MadhurNeural' },

    // --- Other Indian Languages (Realistic Neural Voices) ---
    { name: 'Bengali (India, Female - TanishaaNeural)', value: 'bn-IN-TanishaaNeural' },
    { name: 'Bengali (India, Male - BashkarNeural)', value: 'bn-IN-BashkarNeural' },
    { name: 'Gujarati (India, Female - DhwaniNeural)', value: 'gu-IN-DhwaniNeural' },
    { name: 'Gujarati (India, Male - ChetanNeural)', value: 'gu-IN-ChetanNeural' },
    { name: 'Kannada (India, Female - SapnaNeural)', value: 'kn-IN-SapnaNeural' },
    { name: 'Kannada (India, Male - MohanNeural)', value: 'kn-IN-MohanNeural' },
    { name: 'Malayalam (India, Female - SobhanaNeural)', value: 'ml-IN-SobhanaNeural' },
    { name: 'Malayalam (India, Male - MidhunNeural)', value: 'ml-IN-MidhunNeural' },
    { name: 'Marathi (India, Female - AarohiNeural)', value: 'mr-IN-AarohiNeural' },
    { name: 'Marathi (India, Male - ManoharNeural)', value: 'mr-IN-ManoharNeural' },
    { name: 'Odia (India, Female - NayanaNeural)', value: 'or-IN-NayanaNeural' },
    { name: 'Odia (India, Male - AbhisekNeural)', value: 'or-IN-AbhisekNeural' },
    { name: 'Punjabi (India, Female - AmritNeural)', value: 'pa-IN-AmritNeural' },
    { name: 'Punjabi (India, Male - BikramNeural)', value: 'pa-IN-BikramNeural' },
    { name: 'Tamil (India, Female - PallaviNeural)', value: 'ta-IN-PallaviNeural' },
    { name: 'Tamil (India, Male - ValluvarNeural)', value: 'ta-IN-ValluvarNeural' },
    { name: 'Telugu (India, Female - ShrutiNeural)', value: 'te-IN-ShrutiNeural' },
    { name: 'Telugu (India, Male - MohanNeural)', value: 'te-IN-MohanNeural' },

    // --- US English Voices (Popular & Realistic) ---
    { name: 'English (US, Female - JennyNeural)', value: 'en-US-JennyNeural' },
    { name: 'English (US, Male - GuyNeural)', value: 'en-US-GuyNeural' },
    { name: 'English (US, Female - AriaNeural - Newscaster)', value: 'en-US-AriaNeural' },
    { name: 'English (US, Male - DavisNeural)', value: 'en-US-DavisNeural' },
    { name: 'English (US, Female - ElizabethNeural)', value: 'en-US-ElizabethNeural' },

    // --- UK English Voices ---
    { name: 'English (UK, Female - LibbyNeural)', value: 'en-GB-LibbyNeural' },
    { name: 'English (UK, Male - RyanNeural)', value: 'en-GB-RyanNeural' },

    // --- Australian English Voices ---
    { name: 'English (Australia, Female - NatashaNeural)', value: 'en-AU-NatashaNeural' },
    { name: 'English (Australia, Male - WillNeural)', value: 'en-AU-WillNeural' },
    
    // --- Other Popular Languages ---
    { name: 'Arabic (Saudi Arabia, Female - ZariyahNeural)', value: 'ar-SA-ZariyahNeural' },
    { name: 'Chinese (Mandarin, Female - XiaoxiaoNeural)', value: 'zh-CN-XiaoxiaoNeural' },
    { name: 'French (France, Female - DeniseNeural)', value: 'fr-FR-DeniseNeural' },
    { name: 'German (Germany, Female - KatjaNeural)', value: 'de-DE-KatjaNeural' },
    { name: 'Japanese (Japan, Female - NanamiNeural)', value: 'ja-JP-NanamiNeural' },
    { name: 'Spanish (Spain, Female - ElviraNeural)', value: 'es-ES-ElviraNeural' },

    // For a comprehensive list of all supported Azure voices, refer to:
    // https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=text-to-speech
  ];

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);
  };

  const handleGenerate = async () => {
    if (!text.trim()) { // Use .trim() to check for empty or just whitespace
      onMessageChange("Please enter some text for Azure AI speech.", "error");
      return;
    }
    onLoadingChange(true);
    onMessageChange("Generating Azure AI voice...", "info");

    try {
      const response = await fetch('https://sandeepcodewala-text2speech.onrender.com/api/azure-tts', { // Adjust URL if your backend is elsewhere
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceName: selectedVoice }),
      });
      console.log("Azure TTS request called with text:", text, "voice:", selectedVoice, "Response:", response);

      // Check for non-OK responses first (e.g., 4xx, 5xx)
      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = { message: await response.text() || `Server error: ${response.status} ${response.statusText}` };
        }
        // // Optional: Add GA event for failed generation
        ReactGA.event({
          category: "Speech Generation",
          action: "Azure Speech Generation Failed",
          label: `Error:`,
          value: text.length,
        });
        throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.url) {
        // Cache-busting logic (as previously implemented)
        const originalFileUrl = data.url;
        const timestamp = new Date().getTime();
        const cacheBustedUrl = `${originalFileUrl}?_t=${timestamp}`;
        
        console.log("Generated Azure audio URL with cache-buster:", cacheBustedUrl);
        
        onAudioGenerated(cacheBustedUrl);
        onMessageChange("Azure AI voice generated successfully!", "success");

        // // Optional: Add GA event for successful generation
        ReactGA.event({
          category: "Speech Generation",
          action: "Azure Speech Generated",
          value: text.length,
        });
        // console.log("GA4 event sent: Azure Speech Generated");

      } else {
        // Handle cases where data.success is false or data.url is missing
        onMessageChange(`Error generating Azure AI voice: ${data.message || 'Unknown error or missing URL'}`, "error");
        console.error("Azure TTS Error Response (data.success is false or url missing):", data);
        // // Optional: Add GA event for generation failure due to backend logic
        ReactGA.event({
          category: "Speech Generation",
          action: "Azure Speech Generation Failed",
          label: `Backend Logic Error`,
          value: text.length,
        });
      }
    } catch (error) {
      onMessageChange(`Network or server error: ${error.message}`, "error");
      console.error("Azure TTS Fetch Error:", error);
      // // Optional: Add GA event for network/fetch errors
      ReactGA.event({
        category: "Speech Generation",
        action: "Azure Speech Generation Failed",
        label: `Network Error`,
        value: text.length,
      });
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="tts-control-group"> {/* Matches FreeTTS */}
      <h3>Free Realistic Voices Text-to-Speech</h3>
      <div className="tts-input-area"> {/* Matches FreeTTS */}
        <textarea
          id="ttsTextAzure" // Unique ID for Azure
          maxLength="2000" // Added maxLength for consistency
          placeholder="Enter your text here for Azure AI voice..."
          value={text}
          onChange={handleTextChange}
        ></textarea>
        <div className="select-group"> {/* Matches FreeTTS */}
          <label htmlFor="azureVoiceSelect">Voice:</label> {/* Added label */}
          <select
            id="azureVoiceSelect" // Unique ID for Azure
            value={selectedVoice}
            onChange={handleVoiceChange}
          >
            {azureVoices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={handleGenerate}> {/* Use "btn" class */}
            Generate Free Voice
          </button>
        </div>
      </div>
    </div>
  );
};

export default AzureTTS;