// Chat Page Specific JavaScript

let chatHistory = [];
let isTyping = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeChatPage();
});

function initializeChatPage() {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceInputBtn = document.getElementById('voice-input-btn');
    
    // Form submission handler
    if (chatForm) {
        chatForm.addEventListener('submit', handleMessageSubmission);
    }
    
    // Voice input button handler
    if (voiceInputBtn) {
        voiceInputBtn.addEventListener('click', startVoiceInput);
    }
    
    // Auto-resize message input
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            autoResizeInput(this);
            updateSendButtonState();
        });
        
        // Handle Enter key
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.value.trim()) {
                    chatForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
    
    // Load chat history from localStorage
    loadChatHistory();
    
    console.log('Chat page initialized');
}

async function handleMessageSubmission(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    const chatLanguage = document.getElementById('chat-language');
    const message = messageInput.value.trim();
    const language = chatLanguage.value || 'en';
    
    if (!message) return;
    
    try {
        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input and show typing indicator
        messageInput.value = '';
        autoResizeInput(messageInput);
        updateSendButtonState();
        showTypingIndicator();
        
        // Submit to backend
        const response = await fetch('/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                language: language
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add AI response to chat
            setTimeout(() => {
                addMessageToChat('ai', result.response);
                
                // Speak the response
                window.MindBridge.speakText(result.response, language);
                
                // Check for crisis detection
                if (result.crisis_detected) {
                    setTimeout(() => {
                        window.MindBridge.showCrisisModal();
                    }, 2000);
                }
            }, 1000);
            
        } else {
            throw new Error(result.message || 'Failed to get AI response');
        }
        
    } catch (error) {
        console.error('Chat submission error:', error);
        hideTypingIndicator();
        addMessageToChat('ai', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.');
        showNotification('Connection error. Please try again.', 'error');
    }
}

function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageElement = createMessageElement(sender, message);
    chatMessages.appendChild(messageElement);
    
    // Update chat history
    chatHistory.push({ sender, message, timestamp: new Date().toISOString() });
    saveChatHistory();
    
    // Scroll to bottom
    scrollToBottom();
    
    // Animate message appearance
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
}

function createMessageElement(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.style.cssText = 'opacity: 0; transform: translateY(10px); transition: all 0.3s ease-out;';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    const avatarInner = document.createElement('div');
    avatarInner.className = sender === 'ai' ? 'ai-avatar' : 'user-avatar';
    avatarInner.textContent = sender === 'ai' ? '🧠' : '👤';
    avatar.appendChild(avatarInner);
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = message;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.innerHTML = `
        <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        ${sender === 'ai' ? '<button class="speak-message-btn" onclick="window.MindBridge.speakMessage(this)"><span class="speak-icon">🔊</span></button>' : ''}
    `;
    
    content.appendChild(bubble);
    content.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
}

function showTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.classList.remove('hidden');
        scrollToBottom();
        isTyping = true;
    }
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.classList.add('hidden');
        isTyping = false;
    }
}

function scrollToBottom() {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
    }
}

function autoResizeInput(input) {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

function updateSendButtonState() {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (sendBtn) {
        sendBtn.disabled = !messageInput.value.trim() || isTyping;
    }
}

function startVoiceInput() {
    const messageInput = document.getElementById('message-input');
    const voiceBtn = document.getElementById('voice-input-btn');
    
    if (!messageInput) return;
    
    // Focus on input first
    messageInput.focus();
    
    // Start voice recognition
    window.MindBridge.startVoiceRecognition();
    
    // Update button state
    voiceBtn.classList.add('listening');
    
    // Reset button after timeout
    setTimeout(() => {
        voiceBtn.classList.remove('listening');
    }, 5000);
}

function loadChatHistory() {
    const savedHistory = localStorage.getItem('mindbridge_chat_history');
    if (savedHistory) {
        try {
            chatHistory = JSON.parse(savedHistory);
            // Optionally restore last few messages to UI
            // restoreRecentMessages();
        } catch (error) {
            console.error('Error loading chat history:', error);
            chatHistory = [];
        }
    }
}

function saveChatHistory() {
    try {
        // Keep only last 50 messages to avoid storage issues
        const historyToSave = chatHistory.slice(-50);
        localStorage.setItem('mindbridge_chat_history', JSON.stringify(historyToSave));
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

function restoreRecentMessages() {
    const recentMessages = chatHistory.slice(-10); // Last 10 messages
    const chatMessages = document.getElementById('chat-messages');
    
    // Clear existing messages except welcome message
    const welcomeMessage = chatMessages.querySelector('.message.ai-message');
    chatMessages.innerHTML = '';
    if (welcomeMessage) {
        chatMessages.appendChild(welcomeMessage);
    }
    
    // Add recent messages
    recentMessages.forEach(msg => {
        const messageElement = createMessageElement(msg.sender, msg.message);
        chatMessages.appendChild(messageElement);
    });
    
    scrollToBottom();
}

// Crisis keyword detection for real-time warnings
function checkForCrisisKeywords(message) {
    const crisisKeywords = [
        'suicide', 'kill myself', 'end my life', 'hurt myself', 'self harm',
        'want to die', 'better off dead', 'no point living', 'cutting myself',
        'overdose', 'jump off', 'hang myself', 'can\'t go on', 'hopeless',
        'worthless', 'useless', 'hate myself', 'want to disappear'
    ];
    
    const messageLower = message.toLowerCase();
    return crisisKeywords.some(keyword => messageLower.includes(keyword));
}

// Real-time crisis monitoring
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        let crisisWarningTimeout;
        
        messageInput.addEventListener('input', function() {
            const message = this.value;
            
            if (checkForCrisisKeywords(message)) {
                clearTimeout(crisisWarningTimeout);
                crisisWarningTimeout = setTimeout(() => {
                    showCrisisPreventionMessage();
                }, 2000); // Wait 2 seconds of continued typing
            } else {
                clearTimeout(crisisWarningTimeout);
            }
        });
    }
});

function showCrisisPreventionMessage() {
    const preventionMessage = `I notice you might be going through a difficult time. Remember that you're not alone, and help is available. Would you like to talk about what's troubling you, or would you prefer some immediate support resources?`;
    
    addMessageToChat('ai', preventionMessage);
    window.MindBridge.speakText(preventionMessage);
    
    // Show crisis modal after a delay
    setTimeout(() => {
        window.MindBridge.showCrisisModal();
    }, 3000);
}

// Chat commands (Easter eggs)
function processChatCommands(message) {
    const commands = {
        '/help': 'Here are some things you can do:\n• Share your feelings and thoughts\n• Ask for coping strategies\n• Talk about your day\n• Request mindfulness exercises\n\nI\'m here to listen and support you.',
        '/mood': 'How are you feeling right now? You can describe your mood, or if you prefer, you can use our structured check-in feature.',
        '/breathe': 'Let\'s try a breathing exercise together:\n\n1. Breathe in slowly for 4 counts\n2. Hold for 4 counts\n3. Breathe out slowly for 6 counts\n4. Repeat 4 times\n\nFocus on the rhythm and let your thoughts settle.',
        '/resources': 'Here are some helpful resources:\n\n🆘 Crisis Support: 988\n💬 Crisis Text Line: Text HOME to 741741\n🌐 Mental Health Resources: https://www.mentalhealth.gov\n\nRemember, seeking help is a sign of strength.'
    };
    
    const command = message.toLowerCase().trim();
    return commands[command] || null;
}

// Enhance message handling to support commands
const originalHandleMessageSubmission = handleMessageSubmission;
handleMessageSubmission = async function(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    // Check for commands first
    const commandResponse = processChatCommands(message);
    if (commandResponse) {
        addMessageToChat('user', message);
        messageInput.value = '';
        autoResizeInput(messageInput);
        updateSendButtonState();
        
        setTimeout(() => {
            addMessageToChat('ai', commandResponse);
            window.MindBridge.speakText(commandResponse);
        }, 500);
        
        return;
    }
    
    // Otherwise, proceed with normal handling
    return originalHandleMessageSubmission.call(this, e);
};

// Export functions for testing
window.ChatPage = {
    addMessageToChat,
    showTypingIndicator,
    hideTypingIndicator,
    startVoiceInput,
    checkForCrisisKeywords,
    processChatCommands
};