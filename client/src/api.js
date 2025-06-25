// client/src/api.js

const API_BASE_URL = 'https://sandeepcodewala-text2speech.onrender.com'; // Your deployed Render backend URL

export const fetchElevenLabsVoices = async () => {
  // This now correctly calls your backend's /voices endpoint
  const res = await fetch(`${API_BASE_URL}/voices`);
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
