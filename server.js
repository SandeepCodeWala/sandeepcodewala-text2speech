const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = 'https://sandeepcodewala-text2speech.onrender.com' || `http://localhost:${PORT}`;

// --------------------------------------
// CORS Setup
// --------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  'https://sandeepcodewala-text2speech.onrender.com',
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const ELEVENLABS_API_KEY = 'sk_afea93c7ceb46d0ac4638def5b4f4eec210aefe570edcd73';

if (ELEVENLABS_API_KEY) {
  console.log("✅ ElevenLabs API Key loaded (first 5 chars):", ELEVENLABS_API_KEY.slice(0, 5) + "...");
} else {
  console.warn("⚠️ ELEVENLABS_API_KEY not found in .env. Premium TTS won't work.");
}

app.get("/", (req, res) => {
  res.send("Text-to-Speech API is running.");
});

// --------------------------------------
// Fetch ElevenLabs Voices
// --------------------------------------
app.get("/voices", async (req, res) => {
  if (!ELEVENLABS_API_KEY) {
    return res.status(503).json({ success: false, message: "API key missing" });
  }

  try {
    const { data } = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
    });
    res.json({ success: true, voices: data.voices });
  } catch (error) {
    console.error("❌ Error fetching voices:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch voices" });
  }
});

// --------------------------------------
// Generate Premium TTS
// --------------------------------------
app.post("/generate", async (req, res) => {
  const { text, voiceId } = req.body;

  if (!text || !voiceId) {
    return res.status(400).json({ success: false, message: "Missing text or voiceId" });
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    const filename = `premium_${uuidv4()}.mp3`;
    const outputPath = path.join(__dirname, "public", filename);
    fs.writeFileSync(outputPath, response.data);

    const fileUrl = `${BASE_URL}/${filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("❌ ElevenLabs TTS Error:", err.message);
    res.status(500).json({ success: false, message: "Premium TTS generation failed" });
  }
});

// --------------------------------------
// Generate Free TTS
// --------------------------------------
app.post("/generate-free", (req, res) => {
  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({ success: false, message: "Missing text or language" });
  }

  const filename = `free_${uuidv4()}.mp3`;
  const outputPath = path.join(__dirname, "public", filename);

  const pythonProcess = spawn("python3", [path.join(__dirname, "generate.py"), text, language, outputPath]);

  let errorOutput = "";

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (code === 0 && fs.existsSync(outputPath)) {
      const fileUrl = `${BASE_URL}/${filename}`;
      res.json({ success: true, url: fileUrl });
    } else {
      console.error("❌ Python Error:", errorOutput || "Unknown error");
      res.status(500).json({ success: false, message: errorOutput || "gTTS generation failed" });
    }
  });

  pythonProcess.on("error", (err) => {
    console.error("❌ Failed to start gTTS:", err.message);
    res.status(500).json({ success: false, message: "Server error starting gTTS" });
  });
});

// --------------------------------------
// Start the server
// --------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server is running at ${BASE_URL}`);
});
