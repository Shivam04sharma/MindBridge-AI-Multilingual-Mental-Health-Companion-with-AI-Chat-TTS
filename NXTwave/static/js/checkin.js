// Check-in Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckinPage();
});

function initializeCheckinPage() {
    const checkinForm = document.getElementById('checkin-form');
    const voiceNoteBtn = document.getElementById('voice-note-btn');
    const submitBtn = document.getElementById('submit-checkin');
    const speakResponseBtn = document.getElementById('speak-response');
    
    // Form submission handler
    if (checkinForm) {
        checkinForm.addEventListener('submit', handleCheckinSubmission);
    }
    
    // Voice note button handler
    if (voiceNoteBtn) {
        voiceNoteBtn.addEventListener('click', startVoiceNote);
    }
    
    // Speak response button handler
    if (speakResponseBtn) {
        speakResponseBtn.addEventListener('click', speakAIResponse);
    }
    
    // Mood selection animation
    setupMoodSelectionEffects();
    
    // Auto-resize note textarea
    const noteTextarea = document.getElementById('note');
    if (noteTextarea) {
        noteTextarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    console.log('Check-in page initialized');
}

async function handleCheckinSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('submit-checkin');
    const btnText = submitBtn.querySelector('.btn-text');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    
    // Get form values
    const mood = formData.get('mood');
    const note = formData.get('note') || '';
    const language = formData.get('language') || 'en';
    
    // Validation
    if (!mood) {
        showNotification('Please select your mood level', 'warning');
        return;
    }
    
    try {
        // Update button state
        submitBtn.disabled = true;
        btnText.textContent = 'Processing...';
        loadingSpinner.classList.remove('hidden');
        
        // Submit to backend
        const response = await fetch('/checkin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                mood: mood,
                note: note,
                language: language
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show AI response
            displayAIResponse(result.response, result.mood);
            
            // Check for crisis indicators in the note
            if (containsCrisisKeywords(note)) {
                setTimeout(() => {
                    window.MindBridge.showCrisisModal();
                }, 2000);
            }
            
            // Speak the response
            setTimeout(() => {
                window.MindBridge.speakText(result.response, language);
            }, 500);
            
            showNotification('Check-in completed successfully!', 'success');
        } else {
            throw new Error(result.message || 'Failed to process check-in');
        }
        
    } catch (error) {
        console.error('Check-in submission error:', error);
        showNotification('Failed to process check-in. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'Complete Check-In';
        loadingSpinner.classList.add('hidden');
    }
}

function displayAIResponse(responseText, mood) {
    const aiResponseSection = document.getElementById('ai-response');
    const responseTextElement = document.getElementById('response-text');
    
    if (aiResponseSection && responseTextElement) {
        responseTextElement.textContent = responseText;
        aiResponseSection.classList.remove('hidden');
        
        // Scroll to response
        aiResponseSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
        
        // Add typewriter effect
        typewriterEffect(responseTextElement, responseText);
    }
}

function typewriterEffect(element, text) {
    element.textContent = '';
    let i = 0;
    
    function typeChar() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, 30);
        }
    }
    
    typeChar();
}

function startVoiceNote() {
    const noteTextarea = document.getElementById('note');
    const voiceBtn = document.getElementById('voice-note-btn');
    
    if (!noteTextarea) return;
    
    // Focus on textarea first
    noteTextarea.focus();
    
    // Start voice recognition
    window.MindBridge.startVoiceRecognition();
    
    // Update button state
    voiceBtn.classList.add('listening');
    voiceBtn.innerHTML = '<span class="voice-icon">🎤</span> Listening...';
    
    // Reset button after timeout
    setTimeout(() => {
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<span class="voice-icon">🎤</span> Speak your note';
    }, 5000);
}

function speakAIResponse() {
    const responseText = document.getElementById('response-text');
    const speakBtn = document.getElementById('speak-response');
    const language = document.getElementById('language').value || 'en';
    
    if (responseText && responseText.textContent) {
        window.MindBridge.speakText(responseText.textContent, language);
        
        // Visual feedback
        speakBtn.style.background = 'var(--success-green)';
        speakBtn.innerHTML = '<span class="speak-icon">🔊</span> Speaking...';
        
        setTimeout(() => {
            speakBtn.style.background = '';
            speakBtn.innerHTML = '<span class="speak-icon">🔊</span> Listen';
        }, 3000);
    }
}

function setupMoodSelectionEffects() {
    const moodOptions = document.querySelectorAll('.mood-option');
    
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Add selection effect
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            // Add subtle haptic feedback simulation
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
        
        // Hover effects
        option.addEventListener('mouseenter', function() {
            if (!this.control.checked) {
                this.style.transform = 'scale(1.02)';
            }
        });
        
        option.addEventListener('mouseleave', function() {
            if (!this.control.checked) {
                this.style.transform = '';
            }
        });
    });
}

function containsCrisisKeywords(text) {
    const crisisKeywords = [
        'suicide', 'kill myself', 'end my life', 'hurt myself', 'self harm',
        'want to die', 'better off dead', 'no point living', 'cutting myself',
        'overdose', 'jump off', 'hang myself', 'can\'t go on', 'hopeless',
        'worthless', 'useless', 'hate myself'
    ];
    
    const textLower = text.toLowerCase();
    return crisisKeywords.some(keyword => textLower.includes(keyword));
}

// Mood tracking analytics (client-side)
function trackMoodSelection(mood) {
    // Store mood data locally for trends
    const moodHistory = JSON.parse(localStorage.getItem('mood_history') || '[]');
    moodHistory.push({
        mood: parseInt(mood),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 30 entries
    if (moodHistory.length > 30) {
        moodHistory.splice(0, moodHistory.length - 30);
    }
    
    localStorage.setItem('mood_history', JSON.stringify(moodHistory));
}

// Add mood tracking to form submission
document.addEventListener('DOMContentLoaded', function() {
    const moodInputs = document.querySelectorAll('input[name="mood"]');
    moodInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.checked) {
                trackMoodSelection(this.value);
            }
        });
    });
});

// Export functions for testing
window.CheckinPage = {
    handleCheckinSubmission,
    displayAIResponse,
    startVoiceNote,
    speakAIResponse,
    containsCrisisKeywords,
    trackMoodSelection
};