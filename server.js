const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
require("dotenv").config();
const { v4: uuidv4 } = require('uuid'); // Import uuid
const cors = require('cors'); // ✨ IMPORT CORS HERE ✨

const app = express();
const PORT = process.env.PORT || 3001;

// ----------------------------------------------------
// Middleware: Place these at the top, after app initialization
// ----------------------------------------------------
// ✨ USE CORS MIDDLEWARE HERE BEFORE OTHER MIDDLEWARES ✨
const allowedOrigins = [
  'http://localhost:3000', // For local React development
  process.env.FRONTEND_URL, // For your deployed Render frontend URL
  // Add any other specific origins if needed, e.g., if you have another domain
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true, // If you were sending cookies/auth headers
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions)); // Apply CORS middleware

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Keep this for serving files

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.warn("⚠️ ELEVENLABS_API_KEY not found in .env file. Premium voice generation may not work.");
} else {
  console.log("✅ ElevenLabs API Key loaded (first 5 chars):", ELEVENLABS_API_KEY.substring(0, 5) + "...");
}

app.get("/", (req, res) => {
  res.send("API Server for Text-to-Speech is running. Please access the application via the React frontend (e.g., http://localhost:3000 in development).");
});

app.get("/voices", async (req, res) => {
  console.log("Fetching ElevenLabs voices...");
  if (!ELEVENLABS_API_KEY) {
    console.error("❌ /voices: ELEVENLABS_API_KEY is missing. Cannot fetch voices.");
    return res.status(503).json({
      success: false,
      message: "ElevenLabs API key is not configured on the server.",
    });
  }

  try {
    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
      },
    });

    const allVoices = response.data.voices || [];
    console.log(`✅ Successfully fetched ${allVoices.length} voices from ElevenLabs.`);
    res.json({ success: true, voices: allVoices });
  } catch (error) {
    const errorDetails = error?.response?.data
      ? Buffer.from(error.response.data).toString("utf8")
      : error.message;
    console.error("❌ Error fetching ElevenLabs voices from API:", errorDetails);
    res.status(error.response?.status || 500).json({
      success: false,
      message: `Failed to fetch voices from ElevenLabs: ${errorDetails}`,
    });
  }
});

app.post("/generate", async (req, res) => {
  const { text, voiceId } = req.body;
  console.log(`Generating premium audio for voiceId: ${voiceId} with text: "${text.substring(0, 50)}..."`);

  if (!text || !voiceId) {
    console.error("❌ /generate: Missing required fields (text or voiceId).");
    return res.status(400).json({
      success: false,
      message: "Missing required fields: text or voiceId.",
    });
  }

  if (!ELEVENLABS_API_KEY) {
    console.error("❌ /generate: ELEVENLABS_API_KEY is not configured.");
    return res.status(503).json({
      success: false,
      message: "ElevenLabs API key not configured on the server.",
    });
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        responseType: "arraybuffer",
      }
    );

    const filename = `premium_${uuidv4()}.mp3`; // Unique filename
    const outputPath = path.join(__dirname, "public", filename);
    fs.writeFileSync(outputPath, response.data);
    console.log(`✅ Premium audio saved to: ${outputPath}`);

    res.json({ success: true, url: `/${filename}` }); // Return the unique URL

  } catch (err) {
    const errorDetails = err?.response?.data
      ? Buffer.from(err.response.data).toString("utf8")
      : err.message;
    console.error("❌ ElevenLabs API Error during generation:", errorDetails);
    res.status(err.response?.status || 500).json({
      success: false,
      message: `ElevenLabs API Error: ${errorDetails}`,
    });
  }
});

app.post("/generate-free", (req, res) => {
  const { text, language } = req.body;
  console.log(`Generating free audio for language: ${language} with text: "${text.substring(0, 50)}..."`);

  if (!text || !language) {
    console.error("❌ /generate-free: Missing required fields (text or language).");
    return res.status(400).json({
      success: false,
      message: "Missing required fields: text or language.",
    });
  }

  const filename = `free_${uuidv4()}.mp3`; // Unique filename
  const outputPath = path.join(__dirname, "public", filename);

  const pythonProcess = spawn("python3", [path.join(__dirname, "generate.py"), text, language, outputPath]); // Pass outputPath to Python

  let errorOutput = "";

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error(`Python script stderr: ${data.toString().trim()}`);
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      console.log(`✅ gTTS script successfully generated audio to: ${outputPath}`);
      res.json({ success: true, url: `/${filename}` }); // Return the unique URL
    } else {
      console.error(`❌ gTTS script exited with code ${code}. Error: ${errorOutput}`);
      res.status(500).json({
        success: false,
        message: `gTTS script error: ${errorOutput.trim() || "Unknown error occurred."}`,
      });
    }
  });

  pythonProcess.on("error", (err) => {
    console.error("❌ Failed to start gTTS script process:", err.message);
    res.status(500).json({
      success: false,
      message: `Server error starting gTTS process: ${err.message}`,
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
  console.log(`Note: Frontend (React) typically runs on http://localhost:3000 in development.`);
});