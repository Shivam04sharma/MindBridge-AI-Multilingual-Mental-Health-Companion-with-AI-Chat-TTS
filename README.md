# MindBridge AI - Mental Health Companion

A compassionate, multilingual AI-powered mental health companion built with Flask, designed to provide supportive conversations, mood tracking, and crisis intervention resources.

## 🌟 Features

### Core Functionality
- **Daily Check-ins**: Mood tracking with 1-5 emoji scale and optional notes
- **AI Chat Sessions**: Real-time conversations with empathetic AI responses
- **Crisis Detection**: Automated safety layer with emergency resource provision
- **Session History**: Track wellness journey with visual mood trends
- **Multilingual Support**: English, Spanish, French, German, Portuguese

### Advanced Features
- **Voice Input**: Speech-to-text using OpenAI Whisper API or browser STT
- **Voice Output**: Text-to-speech with natural-sounding responses
- **Crisis Intervention**: Real-time keyword detection with immediate support
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Data Privacy**: Local SQLite database with secure data handling

## 🏗️ Tech Stack

### Backend
- **Python 3.8+** - Core runtime
- **Flask** - Web framework
- **SQLite** - Database
- **OpenAI API** - GPT-4 for responses, Whisper for STT
- **gTTS** - Alternative text-to-speech

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - Interactive functionality
- **Web Speech API** - Browser-based voice features

## 📋 Prerequisites

- Python 3.8 or higher
- OpenAI API key (required)
- Modern web browser with JavaScript enabled
- Internet connection for AI API calls

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mindbridge-ai.git
cd mindbridge-ai
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
```bash
cp .env.example .env
# Edit .env file with your API keys and configuration
```

### 5. Initialize Database
```bash
python -c "from app import init_db; init_db()"
```

### 6. Run Development Server
```bash
python app.py
```

Visit `http://localhost:5000` to access MindBridge AI.

## ⚙️ Configuration

### Required Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_secret_key_here
```

### Optional Configuration
```bash
PERPLEXITY_API_KEY=your_perplexity_api_key  # Alternative AI provider
TTS_PROVIDER=openai  # or 'gtts' or 'browser'
DEFAULT_LANGUAGE=en  # Default language
CRISIS_DETECTION_ENABLED=True  # Enable crisis monitoring
```

## 📁 Project Structure

```
mindbridge-ai/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── README.md             # This file
│
├── db/
│   └── schema.sql        # Database schema
│
├── templates/            # Jinja2 templates
│   ├── base.html        # Base template
│   ├── index.html       # Homepage
│   ├── checkin.html     # Daily check-in
│   ├── chat.html        # Chat interface
│   └── history.html     # Session history
│
├── static/              # Static assets
│   ├── css/
│   │   └── styles.css   # Main stylesheet
│   └── js/
│       ├── main.js      # Core JavaScript
│       ├── checkin.js   # Check-in functionality
│       ├── chat.js      # Chat functionality
│       └── history.js   # History page
│
├── utils/
│   └── ai.py           # AI integration utilities
│
└── logs/               # Application logs
    └── mindbridge.log
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Homepage |
| GET/POST | `/checkin` | Daily mood check-in |
| GET | `/chat` | Chat interface |
| POST | `/session` | Process chat messages |
| GET | `/history` | Session history |
| POST | `/api/speak` | Text-to-speech endpoint |

## 🛡️ Crisis Safety Features

### Automatic Detection
- Real-time keyword monitoring
- Pattern-based risk assessment
- Immediate intervention protocols

### Crisis Resources
- National Suicide Prevention Lifeline (988)
- Crisis Text Line (741741)
- International crisis helplines
- Emergency services (911)

## 🌍 Internationalization

### Supported Languages
- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇵🇹 Portuguese (pt)

### Adding New Languages
1. Add language code to `SUPPORTED_LANGUAGES` in `.env`
2. Update translation dictionaries in `static/js/main.js`
3. Add language option to HTML select elements

## 🧪 Testing

### Run Unit Tests
```bash
pytest tests/ -v
```

### Run Integration Tests
```bash
pytest tests/integration/ -v
```

### Manual Testing
1. Test mood check-in flow
2. Verify AI responses
3. Test crisis detection
4. Check voice features
5. Validate multilingual support

## 🚀 Deployment

### Production Configuration
```bash
# Set production environment variables
export FLASK_ENV=production
export FLASK_DEBUG=False
```

### Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

## 🔒 Security Considerations

- API keys stored in environment variables
- Input sanitization for all user inputs
- Rate limiting on API endpoints
- HTTPS recommended for production
- Regular security updates

## 📊 Monitoring and Analytics

### Built-in Logging
- Request/response logging
- Error tracking
- Performance monitoring
- Crisis intervention logs

### Optional Integrations
- Sentry for error tracking
- Google Analytics for usage stats
- Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use semantic HTML and accessible design
- Write tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

MindBridge AI is a supportive tool and not a replacement for professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.

### Crisis Resources
- **US**: National Suicide Prevention Lifeline - 988
- **International**: https://www.iasp.info/resources/Crisis_Centres/
- **Emergency**: 911 (US) or your local emergency number

## 📞 Support

- 📧 Email: support@mindbridge.ai
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/mindbridge-ai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/mindbridge-ai/discussions)

## 🙏 Acknowledgments

- OpenAI for providing GPT-4 and Whisper APIs
- Mental health professionals who guided the design
- Open source community for inspiration and tools
- Beta testers who provided valuable feedback

---

**Made with ❤️ for mental health awareness and support**
