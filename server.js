const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid"); // Keep uuidv4 if you might revert or use it elsewhere
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + PORT;

// --------------------------------------
// CORS Setup
// --------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  `http://localhost:${PORT}`,
  BASE_URL,
  'https://jsquestion.in',
  'http://jsquestion.in',
  'https://texttovoicepro-cf1e6.web.app',
  'https://texttovoicepro-cf1e6.firebaseapp.com'
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`CORS blocked request from origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
// Serve static files from the 'public' directory
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
// Generate Premium TTS (MODIFIED FILENAME)
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

    // --- CHANGE HERE: Fixed filename ---
    const filename = `premium_latest.mp3`; // Always overwrite this file
    const outputPath = path.join(__dirname, "public", filename);
    fs.writeFileSync(outputPath, response.data);

    const fileUrl = `${BASE_URL}/${filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("❌ ElevenLabs TTS Error:", err.message);
    if (err.response) {
      console.error("ElevenLabs Response Data:", err.response.data.toString());
      console.error("ElevenLabs Status:", err.response.status);
    }
    res.status(500).json({ success: false, message: "Premium TTS generation failed" });
  }
});

// --------------------------------------
// Generate Free TTS (MODIFIED FILENAME)
// --------------------------------------
app.post("/generate-free", (req, res) => {
  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({ success: false, message: "Missing text or language" });
  }

  // --- CHANGE HERE: Fixed filename ---
  const filename = `free_latest.mp3`; // Always overwrite this file
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
      console.error("❌ Python Error (gTTS):", errorOutput || "Unknown error during gTTS generation");
      if (fs.existsSync(outputPath)) {
          fs.unlink(outputPath, (unlinkErr) => {
              if (unlinkErr) console.error('Error deleting temp gTTS audio file after failure:', unlinkErr);
          });
      }
      res.status(500).json({ success: false, message: errorOutput || "gTTS generation failed" });
    }
  });

  pythonProcess.on("error", (err) => {
    console.error("❌ Failed to start gTTS Python process:", err.message);
    res.status(500).json({ success: false, message: "Server error starting gTTS process" });
  });
});

// --------------------------------------
// Generate Azure TTS (MODIFIED FILENAME)
// --------------------------------------
app.post("/api/azure-tts", (req, res) => {
    const { text, voiceName } = req.body;

    if (!text || !voiceName) {
        return res.status(400).json({ success: false, message: "Text and voiceName are required." });
    }

    // --- CHANGE HERE: Fixed filename ---
    const filename = `azure_latest.mp3`; // Always overwrite this file
    const outputPath = path.join(__dirname, "public", filename);

    const pythonScriptPath = path.join(__dirname, "azure_tts_generator.py");

    const pythonProcess = spawn("python3", [
        pythonScriptPath,
        text,
        voiceName,
        outputPath // Pass the fixed output path to the Python script
    ]);

    let pythonOutput = "";
    let pythonError = "";

    pythonProcess.stdout.on("data", (data) => {
        pythonOutput += data.toString();
        console.log(`Azure Python stdout: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
        pythonError += data.toString();
        console.error(`Azure Python stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
            console.log("✅ Azure TTS Python script finished successfully.");
            const fileUrl = `${BASE_URL}/${filename}`;
            res.json({ success: true, url: fileUrl });
        } else {
            console.error(`❌ Azure TTS Python script exited with code ${code}.`);
            console.error(`Azure TTS Python error output: ${pythonError || "No specific error from Python."}`);
            if (fs.existsSync(outputPath)) {
                fs.unlink(outputPath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting temp Azure TTS audio file after failure:', unlinkErr);
                });
            }
            res.status(500).json({ 
                success: false, 
                message: pythonError.trim() || "Azure TTS generation failed." 
            });
        }
    });

    pythonProcess.on("error", (err) => {
        console.error("❌ Failed to start Azure TTS Python process:", err.message);
        res.status(500).json({ success: false, message: "Server error starting Azure TTS process." });
    });
});

// --------------------------------------
// Start the server
// --------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server is running at ${BASE_URL}`);
});