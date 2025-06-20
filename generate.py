# generate.py

import sys
from gtts import gTTS
import os

# Ensure correct arguments
if len(sys.argv) < 3:
    print("Usage: python generate.py 'text' 'language'")
    sys.exit(1)

# Get input text and language from arguments
text = sys.argv[1]
language = sys.argv[2]

# Use gTTS to convert text to speech
tts = gTTS(text=text, lang=language)

# Save the output to the public folder
output_path = os.path.join("public", "output_free.mp3")
tts.save(output_path)

print("✅ Audio generated successfully.")
