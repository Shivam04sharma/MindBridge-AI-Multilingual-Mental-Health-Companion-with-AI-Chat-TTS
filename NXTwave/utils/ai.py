# utils/ai.py
import os
import json
import requests
import traceback
from dotenv import load_dotenv
import re

load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = os.getenv(
    "GEMINI_URL",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
)

# Crisis keywords
CRISIS_KEYWORDS = [
    'suicide','kill myself','end my life','hurt myself','self harm',
    'want to die','better off dead','no point living','cutting myself',
    'overdose','jump off','hang myself',"can't go on"
]

# Fallback messages
FALLBACK_RESPONSE_EN = (
    "Thank you for sharing with me. I'm here to listen and support you. "
    "While I'm experiencing some technical difficulties with my AI responses right now, "
    "please know that your feelings are valid and important. If you're in crisis, "
    "please reach out to a mental health professional or crisis helpline immediately."
)
FALLBACK_RESPONSE_HI = (
    "Dhanyavaad apne feelings share karne ke liye. Main sunne aur support karne ke liye yahan hoon. "
    "Agar AI thoda down hai, phir bhi aapke feelings valid hain. Agar aap crisis me hain, turant professional help lein."
)

def get_ai_response(message, language='en', provider="gemini"):
    """Unified AI response function. Use 'gemini' or 'openai' as provider."""
    try:
        if provider.lower() == "gemini":
            return get_gemini_response(message)
        elif provider.lower() == "openai":
            return get_openai_response(message)
        else:
            print("[ai] Unknown provider, using fallback.")
            return FALLBACK_RESPONSE_EN if language=='en' else FALLBACK_RESPONSE_HI
    except Exception as e:
        print("[ai] Exception in get_ai_response:", e)
        traceback.print_exc()
        return FALLBACK_RESPONSE_EN if language=='en' else FALLBACK_RESPONSE_HI

def get_gemini_response(prompt):
    """Call Gemini API"""
    if not GEMINI_API_KEY:
        print("[ai] GEMINI_API_KEY missing, returning fallback.")
        return FALLBACK_RESPONSE_EN

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    response = requests.post(GEMINI_URL, headers=headers, json=payload, timeout=30)
    if response.status_code == 200:
        data = response.json()
        candidates = data.get("candidates", [])
        if candidates:
            return candidates[0].get("content", {}).get("parts", [])[0].get("text", "No text found").strip()
        else:
            return "No candidates returned by Gemini API"
    else:
        print(f"[ai] Gemini returned {response.status_code}: {response.text}")
        return FALLBACK_RESPONSE_EN

def get_openai_response(prompt):
    """Call OpenAI API using REST"""
    if not OPENAI_API_KEY:
        print("[ai] OPENAI_API_KEY missing, returning fallback.")
        return FALLBACK_RESPONSE_EN

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": "You are a compassionate mental health assistant."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 200,
        "temperature": 0.7
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data, timeout=30)
    if response.status_code == 200:
        data = response.json()
        try:
            return data["choices"][0]["message"]["content"].strip()
        except Exception:
            return FALLBACK_RESPONSE_EN
    else:
        print(f"[ai] OpenAI returned {response.status_code}: {response.text}")
        return FALLBACK_RESPONSE_EN

def detect_crisis(message):
    m = message.lower()
    for kw in CRISIS_KEYWORDS:
        if kw in m:
            return True
    patterns = [
        r"\b(?:want|going|gonna)\s+(?:to\s+)?(?:kill|hurt)\s+myself\b",
        r"\bno\s+(?:point|reason)\s+(?:to\s+)?(?:live|living)\b",
        r"\bcan't\s+(?:take\s+)?(?:it\s+)?(?:anymore|any\s+more)\b"
    ]
    for p in patterns:
        if re.search(p, m):
            return True
    return False

def get_crisis_response(language='en'):
    if language=='hi':
        return "Mujhe lagta hai ki aap crisis me ho sakte hain. Kripya turant local emergency services ya crisis helpline se contact karein."
    return "I sense you might be in crisis. Are you safe right now? If not, please contact your local emergency services or a crisis helpline immediately."

