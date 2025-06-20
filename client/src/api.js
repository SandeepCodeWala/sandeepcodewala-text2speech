// client/src/api.js

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';


export const fetchElevenLabsVoices = async () => {
  const res = await fetch(`https://api.elevenlabs.io/v1/voices`);
  if (!res.ok) {
    const errorText = await res.text(); // Get raw text for better debugging
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `API Error: ${res.status}`);
    } catch (e) {
      throw new Error(`Non-JSON error response from server: ${errorText} (Status: ${res.status})`);
    }
  }
  return res.json();
};

export const generatePremiumAudio = async (text, voiceId) => {
  const res = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text, voiceId})
  });
  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `API Error: ${res.status}`);
    } catch (e) {
      throw new Error(`Non-JSON error response from server: ${errorText} (Status: ${res.status})`);
    }
  }
  return res.json();
};

export const generateFreeAudio = async (text, language) => {
  const res = await fetch(`${API_BASE_URL}/generate-free`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text, language})
  });
  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `API Error: ${res.status}`);
    } catch (e) {
      throw new Error(`Non-JSON error response from server: ${errorText} (Status: ${res.status})`);
    }
  }
  return res.json();
};