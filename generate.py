# generate.py
from gtts import gTTS
import sys

def generate_speech(text, lang='en', output_path='output.mp3'):
    try:
        tts = gTTS(text=text, lang=lang)
        tts.save(output_path)
        print(f"Speech generated successfully to {output_path}")
    except Exception as e:
        print(f"Error generating speech: {e}", file=sys.stderr)
        sys.exit(1) # Exit with an error code

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate.py <text> <language> [output_path]", file=sys.stderr)
        sys.exit(1)

    text_to_speak = sys.argv[1]
    language_code = sys.argv[2]
    
    # If output_path is provided as the 4th argument, use it. Otherwise, default.
    # Note: sys.argv[0] is script name, sys.argv[1] is text, sys.argv[2] is language
    output_file_path = sys.argv[3] if len(sys.argv) > 3 else 'output_free.mp3' 
    
    generate_speech(text_to_speak, language_code, output_file_path)