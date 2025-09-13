

# app.py (updated /api/speak)
from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from datetime import datetime
from utils.ai import get_ai_response, detect_crisis, get_crisis_response
from dotenv import load_dotenv
import secrets
import azure.cognitiveservices.speech as speechsdk
import uuid  # For unique audio file names

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')
DATABASE = 'mindbridge.db'

AZURE_KEY = os.getenv('AZURE_TTS_KEY')
AZURE_REGION = os.getenv('AZURE_TTS_REGION')

# ----------------- TTS Route -----------------
@app.route('/api/speak', methods=['POST'])
def speak():
    """Text-to-speech using Azure Cognitive Services with dynamic voice selection"""
    data = request.get_json()
    text = data.get('text', '')
    language = data.get('language', 'hi-IN')  # default Hindi

    VOICE_MAP = {
        'hi-IN': 'hi-IN-SwaraNeural',
        'en-US': 'en-US-AriaNeural',
        'en-GB': 'en-GB-LibbyNeural',
        'es-ES': 'es-ES-ElviraNeural',
        'fr-FR': 'fr-FR-DeniseNeural'
    }
    voice = VOICE_MAP.get(language, 'hi-IN-SwaraNeural')

    if not AZURE_KEY or not AZURE_REGION:
        return jsonify({'success': False, 'message': 'Azure TTS credentials missing'})

    try:
        audio_file = f"output_{uuid.uuid4().hex}.mp3"
        speech_config = speechsdk.SpeechConfig(subscription=AZURE_KEY, region=AZURE_REGION)
        speech_config.speech_synthesis_voice_name = voice
        audio_config = speechsdk.audio.AudioOutputConfig(filename=audio_file)

        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
        synthesizer.speak_text_async(text).get()

        return jsonify({'success': True, 'message': f'Text spoken in {voice}', 'audio_file': audio_file})
    except Exception as e:
        return jsonify({'success': False, 'message': f'TTS Error: {e}'})

# ----------------- Database -----------------
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        with open('db/schema.sql', 'r') as f:
            conn.executescript(f.read())

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# ----------------- Routes -----------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/checkin', methods=['GET', 'POST'])
def checkin():
    if request.method == 'POST':
        mood = request.form.get('mood')
        note = request.form.get('note', '')
        language = request.form.get('language', 'en')

        with get_db() as conn:
            conn.execute(
                'INSERT INTO checkins (user_id, mood, note, language, timestamp) VALUES (?, ?, ?, ?, ?)',
                (1, mood, note, language, datetime.now().isoformat())
            )

        ai_response = get_ai_response(f"User mood: {mood}/5, Note: {note}", language)
        return jsonify({'success': True, 'response': ai_response, 'mood': mood, 'note': note})

    return render_template('checkin.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/session', methods=['POST'])
def session():
    data = request.get_json()
    message = data.get('message', '')
    language = data.get('language', 'en')

    is_crisis = detect_crisis(message)
    ai_response = get_crisis_response(language) if is_crisis else get_ai_response(message, language)
    crisis_detected = is_crisis

    with get_db() as conn:
        conn.execute(
            'INSERT INTO sessions (user_id, message, response, language, timestamp, crisis_detected) VALUES (?, ?, ?, ?, ?, ?)',
            (1, message, ai_response, language, datetime.now().isoformat(), crisis_detected)
        )

    return jsonify({'success': True, 'response': ai_response, 'crisis_detected': crisis_detected})

@app.route('/history')
def history():
    with get_db() as conn:
        checkins = conn.execute('SELECT * FROM checkins WHERE user_id=? ORDER BY timestamp DESC LIMIT 5', (1,)).fetchall()
        sessions = conn.execute('SELECT * FROM sessions WHERE user_id=? ORDER BY timestamp DESC LIMIT 5', (1,)).fetchall()

    formatted_checkins = [{**dict(c), 'timestamp': datetime.fromisoformat(c['timestamp'])} for c in checkins]
    formatted_sessions = [{**dict(s), 'timestamp': datetime.fromisoformat(s['timestamp'])} for s in sessions]

    return render_template('history.html', checkins=formatted_checkins, sessions=formatted_sessions)

# ----------------- Run App -----------------
if __name__ == '__main__':
    init_db()
    app.run(debug=True)

