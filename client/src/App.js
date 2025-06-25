import React, { useState, useCallback, useRef, useEffect } from "react";
// import PremiumTTS from "./components/PremiumTTS";
import FreeTTS from "./components/FreeTTS";
import AzureTTS from "./components/AzureTTS";
import "./App.css";
import logo from "./logo.png";

function App() {
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const audioPlayerRef = useRef(null);

  // 1. Define handleMessageChange FIRST, as others depend on it
  const handleMessageChange = useCallback((text, type) => {
    setMessage({ text, type });
  }, []);

  // 2. Define handleLoadingChange (independent or depends on message.text which is state)
  const handleLoadingChange = useCallback(
    (loading) => {
      setIsLoading(loading);
      if (
        !loading &&
        (message.text.includes("Generating") ||
          message.text.includes("Loading voices"))
      ) {
        setMessage({ text: "", type: "" });
      }
    },
    [message.text]
  );

  // 3. Define handleAudioGenerated NEXT, as it depends on handleMessageChange
  // This function now expects the CACHE-BUSTED URL from AzureTTS
  const handleAudioGenerated = useCallback((url) => {
    // Revoke previous blob URL to free memory if it was a blob.
    // Ensure this is done if you switch between blob (streaming) and file (direct URL).
    // Given your server.js, for Azure TTS, you're now always getting a string URL to a static file.
    // The previous blob check was for a different Azure TTS implementation, likely not needed now.
    // However, it does no harm, so we can keep it for robustness.
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    // Set the audio URL state (this will be the cache-busted URL)
    setAudioUrl(url); 
    // The useEffect below will handle playing and loading based on this state change
  }, [audioUrl]); // dependency `audioUrl` added for `URL.revokeObjectURL` cleanup


  // 4. Define useEffect LAST, as it depends on audioUrl and handleMessageChange
  useEffect(() => {
    if (audioUrl && audioPlayerRef.current) {
      // --- CRITICAL FIX FOR CACHING: Reload the audio element ---
      audioPlayerRef.current.load(); // Forces the browser to load the new src
      // --- END CRITICAL FIX ---

      audioPlayerRef.current.play().catch((e) => {
        if (e.name === "NotAllowedError") {
          console.warn("Autoplay was prevented. User interaction needed to play audio.");
          handleMessageChange("ऑटोप्ले रोका गया। कृपया ऑडियो प्लेयर पर प्ले पर क्लिक करें।", "info");
        } else if (e.name === "AbortError") {
          console.warn("Audio play aborted (likely by new load/fast subsequent play attempts).");
        } else {
          console.error("Audio play failed:", e);
        }
      });
    }

    // Cleanup function for blob URLs
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, handleMessageChange]);

  return (
    <>
      <header>
        <img src={logo} alt="TextToVoicePro Logo" style={{ height: "60px" }} />
        <h3>|| Free Text to Speech || No Login || Unlimited Text to Voice ||</h3>

        <h1>Convert Text to Voice Instantly</h1>
        <p>
          Natural AI voices in multiple languages. Create compelling audio from
          your text with ease. TextToVoicePro is the fastest online
          text-to-speech converter—generate natural-sounding AI voiceovers,
          download MP3 audio instantly, and power podcasts, videos, e-learning,
          and more with free and premium voices.
        </p>

        <a href="#try-tts" className="btn">
          Get Started Now
        </a>
      </header>

      <section className="section" id="try-tts">
        <h2>Experience Our Text-to-Speech</h2>
        <div className="tts-controls-container">
          {/* Uncomment PremiumTTS if you want to use ElevenLabs */}
          {/* <PremiumTTS
            onAudioGenerated={handleAudioGenerated}
            onLoadingChange={handleLoadingChange}
            onMessageChange={handleMessageChange}
          /> */}

          {/* Free TTS (gTTS) */}
          <FreeTTS
            onAudioGenerated={handleAudioGenerated}
            onLoadingChange={handleLoadingChange}
            onMessageChange={handleMessageChange}
          />

          {/* Azure TTS component */}
          <AzureTTS
            onAudioGenerated={handleAudioGenerated}
            onLoadingChange={handleLoadingChange}
            onMessageChange={handleMessageChange}
          />

          {isLoading && (
            <div id="loadingIndicator">Generating audio... Please wait.</div>
          )}

          <audio
            ref={audioPlayerRef}
            controls
            src={audioUrl} // This will be the cache-busted URL from state
            style={{ display: audioUrl ? "block" : "none", width: '100%', maxWidth: '600px', marginTop: '20px' }}
          ></audio>

          {audioUrl && (
            <a
              id="downloadLink"
              className="btn"
              href={audioUrl} // This will also use the cache-busted URL
              download="generated_audio.mp3"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: "30px" }}
            >
              Download Generated Audio
            </a>
          )}

          {message.text && (
            <div
              id="messageArea"
              className={message.type}
              style={{ display: "block", marginTop: '20px', padding: '10px', borderRadius: '5px', backgroundColor: message.type === 'error' ? '#fdd' : '#dfd', color: message.type === 'error' ? '#a00' : '#0a0' }}
            >
              {message.text}
            </div>
          )}
        </div>
      </section>

      <footer>
        <p>&copy; 2025 Text to Speech Project. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;