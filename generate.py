# generate.py or gtts.py
import sys
from gtts import gTTS

text = sys.argv[1]
language = sys.argv[2]

tts = gTTS(text=text, lang=language)
tts.save("public/output_free.mp3")
