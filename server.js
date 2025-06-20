const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.warn("⚠️ ELEVENLABS_API_KEY not found. Premium voice generation may not work.");
}

/**
 * GET /voices
 * Fetches available voices from ElevenLabs API dynamically
 */
app.get("/voices", async (req, res) => {
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "ELEVENLABS_API_KEY is missing.",
    });
  }

  try {
    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    const allVoices = response.data.voices || [];

    // You can optionally filter Indian-sounding voices here:
    // const indianVoices = allVoices.filter(voice => {
    //   const lang = voice.labels?.language?.toLowerCase() || '';
    //   const accent = voice.labels?.accent?.toLowerCase() || '';
    //   return lang.includes("hindi") || accent.includes("indian");
    // });

    res.json({ success: true, voices: allVoices });
  } catch (error) {
    console.error("❌ Error fetching ElevenLabs voices:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch voices from ElevenLabs.",
    });
  }
});


/**
 * POST /generate
 * Premium voice generation using ElevenLabs
 * Expects: text, voiceId (direct from ElevenLabs)
 */
app.post("/generate", async (req, res) => {
  const { text, voiceId } = req.body;

  if (!text || !voiceId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: text or voiceId.",
    });
  }

  if (!ELEVENLABS_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "ELEVENLABS_API_KEY not configured.",
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
        },
        responseType: "arraybuffer",
      }
    );

    const outputPath = path.join(__dirname, "public", "output_premium.mp3");
    fs.writeFileSync(outputPath, response.data);

    res.json({ success: true, url: "/output_premium.mp3" });
  } catch (err) {
    const errorDetails = err?.response?.data
      ? Buffer.from(err.response.data).toString("utf8")
      : err.message;
    console.error("❌ ElevenLabs Error:", errorDetails);
    res.status(500).json({
      success: false,
      message: `ElevenLabs API Error: ${errorDetails}`,
    });
  }
});

/**
 * POST /generate-free
 * Free voice generation using gTTS via Python script
 * Expects: text, language
 */
app.post("/generate-free", (req, res) => {
  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: text or language.",
    });
  }

  const outputPath = path.join(__dirname, "public", "output_free.mp3");
  const pythonProcess = spawn("python3", [path.join(__dirname, "generate.py"), text, language]);

  let errorOutput = "";

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      res.json({ success: true, url: "/output_free.mp3" });
    } else {
      console.error(`❌ gTTS exited with code ${code}. Error: ${errorOutput}`);
      res.status(500).json({
        success: false,
        message: `gTTS script error: ${errorOutput || "Unknown error"}`,
      });
    }
  });

  pythonProcess.on("error", (err) => {
    console.error("Failed to start gTTS script:", err.message);
    res.status(500).json({
      success: false,
      message: `Server error: ${err.message}`,
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
  if (!ELEVENLABS_API_KEY) {
    console.warn("⚠️ ElevenLabs API Key is missing. Premium voice generation will not work.");
  }
});
