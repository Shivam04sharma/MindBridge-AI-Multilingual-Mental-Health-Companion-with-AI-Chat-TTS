// MindBridge AI - Main JavaScript Functions

// Global variables
let currentLanguage = 'en';
let recognition = null;
let isListening = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupSpeechRecognition();
});

// Initialize application
function initializeApp() {
    // Set current time for welcome message if exists
    const welcomeTime = document.getElementById('welcome-time');
    if (welcomeTime) {
        welcomeTime.textContent = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('mindbridge_language');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        updateLanguageSelectors();
    }
    
    console.log('MindBridge AI initialized successfully');
}

// Setup global event listeners
function setupEventListeners() {
    // Crisis modal handlers
    const crisisModal = document.getElementById('crisis-modal');
    const closeCrisisBtn = document.getElementById('close-crisis-modal');
    
    if (closeCrisisBtn) {
        closeCrisisBtn.addEventListener('click', () => {
            hideCrisisModal();
        });
    }
    
    // Close modal when clicking overlay
    if (crisisModal) {
        crisisModal.addEventListener('click', (e) => {
            if (e.target === crisisModal) {
                hideCrisisModal();
            }
        });
    }
    
    // Language selector handlers
    const languageSelectors = document.querySelectorAll('[id$="language-select"], [id$="language"]');
    languageSelectors.forEach(selector => {
        selector.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    });
}

// Setup speech recognition
function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = getLanguageCode(currentLanguage);
        
        recognition.onstart = function() {
            console.log('Speech recognition started');
            isListening = true;
            updateVoiceButtonState(true);
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            console.log('Speech recognized:', transcript);
            handleSpeechResult(transcript);
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            showNotification('Speech recognition error: ' + event.error, 'error');
            isListening = false;
            updateVoiceButtonState(false);
        };
        
        recognition.onend = function() {
            console.log('Speech recognition ended');
            isListening = false;
            updateVoiceButtonState(false);
        };
    } else {
        console.warn('Speech recognition not supported in this browser');
    }
}

// Handle speech recognition result
function handleSpeechResult(transcript) {
    // Find active input field and set the transcript
    const messageInput = document.getElementById('message-input');
    const noteTextarea = document.getElementById('note');
    
    if (messageInput && document.activeElement === messageInput) {
        messageInput.value = transcript;
        messageInput.focus();
    } else if (noteTextarea) {
        noteTextarea.value = transcript;
        noteTextarea.focus();
    }
    
    // Trigger input event for any listeners
    const activeInput = messageInput || noteTextarea;
    if (activeInput) {
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Start voice recognition
function startVoiceRecognition() {
    if (!recognition) {
        showNotification('Speech recognition not supported in your browser', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        return;
    }
    
    recognition.lang = getLanguageCode(currentLanguage);
    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        showNotification('Error starting speech recognition', 'error');
    }
}

// Update voice button state
function updateVoiceButtonState(listening) {
    const voiceButtons = document.querySelectorAll('[id$="voice-btn"], [id$="voice-input-btn"]');
    const voiceStatus = document.getElementById('voice-status');
    
    voiceButtons.forEach(button => {
        if (listening) {
            button.classList.add('listening');
            button.innerHTML = '<span class="voice-icon">🎤</span> Listening...';
        } else {
            button.classList.remove('listening');
            button.innerHTML = '<span class="voice-icon">🎤</span> Speak';
        }
    });
    
    if (voiceStatus) {
        if (listening) {
            voiceStatus.classList.remove('hidden');
        } else {
            voiceStatus.classList.add('hidden');
        }
    }
}

// Text-to-speech function
function speakText(text, language = currentLanguage) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getLanguageCode(language);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event.error);
            showNotification('Text-to-speech error: ' + event.error, 'error');
        };
        
        speechSynthesis.speak(utterance);
        console.log('Speaking:', text.substring(0, 50) + '...');
    } else {
        console.warn('Speech synthesis not supported in this browser');
        showNotification('Text-to-speech not supported in your browser', 'warning');
    }
}

// Speak message from button
function speakMessage(button) {
    const messageBubble = button.closest('.message-content').querySelector('.message-bubble');
    if (messageBubble) {
        const text = messageBubble.textContent;
        speakText(text);
        
        // Visual feedback
        button.style.color = 'var(--primary-blue)';
        setTimeout(() => {
            button.style.color = '';
        }, 2000);
    }
}

// Language functions
function setLanguage(language) {
    currentLanguage = language;
    localStorage.setItem('mindbridge_language', language);
    updateLanguageSelectors();
    
    // Update speech recognition language if active
    if (recognition) {
        recognition.lang = getLanguageCode(language);
    }
    
    console.log('Language set to:', language);
    showNotification(getTranslation('language_changed', language), 'success');
}

// Update all language selectors
function updateLanguageSelectors() {
    const selectors = document.querySelectorAll('select[id*="language"]');
    selectors.forEach(select => {
        select.value = currentLanguage;
    });
}

// Get language code for speech APIs
function getLanguageCode(language) {
    const languageCodes = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'pt': 'pt-PT'
    };
    return languageCodes[language] || 'en-US';
}

// Simple translation function
function getTranslation(key, language = currentLanguage) {
    const translations = {
        'language_changed': {
            'en': 'Language changed successfully',
            'es': 'Idioma cambiado exitosamente',
            'fr': 'Langue changée avec succès',
            'de': 'Sprache erfolgreich geändert',
            'pt': 'Idioma alterado com sucesso'
        },
        'error_occurred': {
            'en': 'An error occurred. Please try again.',
            'es': 'Ocurrió un error. Por favor intenta de nuevo.',
            'fr': 'Une erreur s\'est produite. Veuillez réessayer.',
            'de': 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
            'pt': 'Ocorreu um erro. Tente novamente.'
        },
        'connection_error': {
            'en': 'Connection error. Please check your internet connection.',
            'es': 'Error de conexión. Por favor verifica tu conexión a internet.',
            'fr': 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
            'de': 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
            'pt': 'Erro de conexão. Verifique sua conexão com a internet.'
        }
    };
    
    return translations[key] && translations[key][language] 
        ? translations[key][language] 
        : translations[key]['en'] || key;
}

// Crisis detection and modal functions
function showCrisisModal() {
    const modal = document.getElementById('crisis-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
}

function hideCrisisModal() {
    const modal = document.getElementById('crisis-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Notification system
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1100;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function getNotificationColor(type) {
    const colors = {
        'success': 'var(--success-green)',
        'error': 'var(--error-red)',
        'warning': 'var(--warning-yellow)',
        'info': 'var(--primary-blue)'
    };
    return colors[type] || colors.info;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(getLanguageCode(currentLanguage), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Auto-resize textarea function
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Setup textarea auto-resize
document.addEventListener('DOMContentLoaded', function() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.MindBridge = {
    speakText,
    speakMessage,
    setLanguage,
    showCrisisModal,
    hideCrisisModal,
    showNotification,
    startVoiceRecognition,
    formatDate,
    formatTime
};