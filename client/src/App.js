// client/src/App.js
import React, { useState, useCallback, useRef } from 'react'; // Import useRef
import PremiumTTS from './components/PremiumTTS';
import FreeTTS from './components/FreeTTS';
import './App.css';

function App() {
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const audioPlayerRef = useRef(null); // Create a ref for the audio element

  const handleAudioGenerated = useCallback((url) => {
    setAudioUrl(url);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.load(); // Load the new source
      audioPlayerRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  const handleLoadingChange = useCallback((loading) => {
    setIsLoading(loading);
    if (!loading && (message.text.includes('Generating') || message.text.includes('Loading voices'))) {
        setMessage({ text: '', type: '' });
    }
  }, [message.text]);

  const handleMessageChange = useCallback((text, type) => {
    setMessage({ text, type });
  }, []);

  return (
    <>
      <header>
        <h1>Convert Text to Voice Instantly</h1>
        <p>Natural AI voices in multiple languages. Create compelling audio from your text with ease.</p>
        <a href="#try-tts" className="btn">Get Started Now</a>
      </header>

      <section className="section" id="try-tts">
        <h2>Experience Our Text-to-Speech</h2>
        <div className="tts-controls-container">

          <PremiumTTS
            onAudioGenerated={handleAudioGenerated}
            onLoadingChange={handleLoadingChange}
            onMessageChange={handleMessageChange}
          />

          <FreeTTS
            onAudioGenerated={handleAudioGenerated}
            onLoadingChange={handleLoadingChange}
            onMessageChange={handleMessageChange}
          />

          {isLoading && (
            <div id="loadingIndicator">Generating audio... Please wait.</div>
          )}

          {/* Attach the ref to the audio element */}
          <audio
            ref={audioPlayerRef} // Use the ref here instead of id
            controls
            src={audioUrl}
            style={{ display: audioUrl ? 'block' : 'none' }}
          ></audio>

          {audioUrl && (
            <a
              id="downloadLink"
              className="btn"
              href={audioUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '30px' }}
            >
              Download Generated Audio
            </a>
          )}

          {message.text && (
            <div id="messageArea" className={message.type} style={{ display: 'block' }}>
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