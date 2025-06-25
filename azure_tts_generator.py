import azure.cognitiveservices.speech as speechsdk
import sys
import os
import time # Import time for potential delay check

# Your Azure Speech Key and Region directly embedded
DEFAULT_SPEECH_KEY = "8Ywka8A7pQer4STegF2VxtATKh8zczhxylw9kOaY7eavKa0CUcFfJQQJ99BFACGhslBXJ3w3AAAYACOGYPKH"
DEFAULT_SERVICE_REGION = "centralindia"

def generate_azure_speech(text, voice_name, output_path='output_azure_tts.mp3',
                          speech_key=DEFAULT_SPEECH_KEY, service_region=DEFAULT_SERVICE_REGION):
    print(f"DEBUG: Attempting to generate speech for text: '{text[:50]}...' to {output_path}")
    print(f"DEBUG: Using voice: {voice_name}, Region: {service_region}")

    if not speech_key or not service_region:
        print("Error: Azure Speech key or region is missing. Please provide them or ensure they are correctly set in the script.", file=sys.stderr)
        sys.exit(1)

    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
    speech_config.speech_synthesis_voice_name = voice_name
    audio_config = speechsdk.audio.AudioOutputConfig(filename=output_path)
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

    print(f"Initiating speech synthesis for text: '{text}' using voice: {voice_name}...")

    try:
        result = speech_synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            print(f"Speech successfully generated and saved to {output_path}")
            # ADD THIS CHECK:
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"DEBUG: Generated file size: {file_size} bytes")
                if file_size == 0:
                    print("ERROR: Generated audio file is 0 bytes. This indicates a problem with the synthesis.", file=sys.stderr)
                    # You might want to exit here with an error code to signal failure to Node.js
                    sys.exit(1) # Force exit with an error code
            else:
                print(f"ERROR: File was supposed to be generated at {output_path} but does not exist.", file=sys.stderr)
                sys.exit(1)

        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = result.cancellation_details
            print(f"Speech synthesis canceled. Reason: {cancellation_details.reason}", file=sys.stderr)
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                if cancellation_details.error_details:
                    print(f"Error details: {cancellation_details.error_details}", file=sys.stderr)
                print("Please ensure your Azure Speech key and region are correct and valid.", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"An unexpected result reason occurred during speech synthesis: {result.reason}", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"FATAL PYTHON ERROR during speech synthesis: {e}", file=sys.stderr)
        sys.exit(1) # Ensure Python exits with an error if an exception occurs

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python azure_tts_generator.py <text_to_speak> <voice_name> [output_file_path]", file=sys.stderr)
        sys.exit(1)

    text_to_speak = sys.argv[1]
    voice_name = sys.argv[2]
    output_file_path = sys.argv[3] if len(sys.argv) > 3 else 'output_azure_tts.mp3'

    generate_azure_speech(text_to_speak, voice_name, output_file_path)