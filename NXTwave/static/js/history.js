// History Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeHistoryPage();
});

function initializeHistoryPage() {
    // Setup speak buttons for historical responses
    setupSpeakButtons();
    
    // Setup mood trend visualization
    setupMoodTrend();
    
    // Setup session filtering
    setupSessionFiltering();
    
    console.log('History page initialized');
}

function setupSpeakButtons() {
    const speakButtons = document.querySelectorAll('.speak-btn');
    
    speakButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textContent = this.getAttribute('data-text') || 
                              this.parentElement.querySelector('p').textContent;
            
            if (textContent) {
                window.MindBridge.speakText(textContent);
                
                // Visual feedback
                this.style.background = 'var(--success-green)';
                this.innerHTML = '<span class="speak-icon">🔊</span> Speaking...';
                
                setTimeout(() => {
                    this.style.background = '';
                    this.innerHTML = '<span class="speak-icon">🔊</span>';
                }, 3000);
            }
        });
    });
}

function setupMoodTrend() {
    const trendChart = document.querySelector('.trend-chart');
    if (!trendChart) return;
    
    // Animate trend bars on load
    const trendBars = trendChart.querySelectorAll('.trend-bar');
    trendBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.transition = 'height 0.8s ease-out';
            const targetHeight = bar.style.height;
            bar.style.height = '0%';
            
            setTimeout(() => {
                bar.style.height = targetHeight;
            }, 100);
        }, index * 200);
    });
    
    // Add hover effects for trend points
    const trendPoints = trendChart.querySelectorAll('.trend-point');
    trendPoints.forEach(point => {
        const bar = point.querySelector('.trend-bar');
        const date = point.querySelector('.trend-date');
        
        point.addEventListener('mouseenter', function() {
            bar.style.transform = 'scaleY(1.1)';
            date.style.fontWeight = 'bold';
            date.style.color = 'var(--primary-blue)';
            
            // Show mood value tooltip
            showMoodTooltip(this, bar.style.height);
        });
        
        point.addEventListener('mouseleave', function() {
            bar.style.transform = '';
            date.style.fontWeight = '';
            date.style.color = '';
            hideMoodTooltip();
        });
    });
}

function showMoodTooltip(element, height) {
    hideMoodTooltip(); // Remove existing tooltip
    
    const heightValue = parseInt(height);
    const moodValue = Math.round(heightValue / 20); // Convert back to 1-5 scale
    
    const tooltip = document.createElement('div');
    tooltip.className = 'mood-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: var(--gray-900);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        transform: translateX(-50%) translateY(-100%);
        margin-top: -8px;
    `;
    tooltip.textContent = `Mood: ${moodValue}/5`;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = rect.top + 'px';
    
    document.body.appendChild(tooltip);
}

function hideMoodTooltip() {
    const existingTooltip = document.querySelector('.mood-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

function setupSessionFiltering() {
    // Add filter controls
    createFilterControls();
    
    // Setup filter event listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            applySessionFilter(filter);
            
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function createFilterControls() {
    const historyMain = document.querySelector('.history-main .container');
    if (!historyMain) return;
    
    const filterControls = document.createElement('div');
    filterControls.className = 'filter-controls';
    filterControls.style.cssText = `
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        justify-content: center;
    `;
    
    const filters = [
        { key: 'all', label: 'All Sessions', icon: '📊' },
        { key: 'recent', label: 'Recent (7 days)', icon: '🕒' },
        { key: 'crisis', label: 'Crisis Support', icon: '🆘' },
        { key: 'positive', label: 'Positive Moods', icon: '😊' }
    ];
    
    filters.forEach((filter, index) => {
        const button = document.createElement('button');
        button.className = `filter-btn ${index === 0 ? 'active' : ''}`;
        button.setAttribute('data-filter', filter.key);
        button.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius-lg);
            background: white;
            color: var(--gray-700);
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        button.innerHTML = `<span>${filter.icon}</span> ${filter.label}`;
        
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.background = 'var(--gray-50)';
                this.style.borderColor = 'var(--primary-blue)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.background = 'white';
                this.style.borderColor = 'var(--gray-300)';
            }
        });
        
        filterControls.appendChild(button);
    });
    
    // Add CSS for active state
    const style = document.createElement('style');
    style.textContent = `
        .filter-btn.active {
            background: var(--gradient-primary) !important;
            color: white !important;
            border-color: var(--primary-blue) !important;
        }
    `;
    document.head.appendChild(style);
    
    historyMain.insertBefore(filterControls, historyMain.firstChild);
}

function applySessionFilter(filter) {
    const checkinCards = document.querySelectorAll('.checkin-card');
    const sessionCards = document.querySelectorAll('.session-card');
    
    // Filter check-ins
    checkinCards.forEach(card => {
        let show = true;
        
        switch (filter) {
            case 'recent':
                const checkinDate = new Date(card.querySelector('.checkin-date').textContent);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                show = checkinDate >= weekAgo;
                break;
            case 'positive':
                const moodScore = parseInt(card.querySelector('.mood-score').textContent.split('/')[0]);
                show = moodScore >= 4;
                break;
            case 'crisis':
                show = false; // Check-ins don't have crisis indicators
                break;
            case 'all':
            default:
                show = true;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
    
    // Filter sessions
    sessionCards.forEach(card => {
        let show = true;
        
        switch (filter) {
            case 'recent':
                const sessionDate = new Date(card.querySelector('.session-date').textContent);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                show = sessionDate >= weekAgo;
                break;
            case 'crisis':
                show = card.classList.contains('crisis-session');
                break;
            case 'positive':
                // This would need sentiment analysis or mood indicators in sessions
                show = true; // For now, show all
                break;
            case 'all':
            default:
                show = true;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
    
    // Show/hide empty states
    updateEmptyStates(filter);
}

function updateEmptyStates(filter) {
    const checkinSection = document.querySelector('.history-section:has(.checkins-grid)');
    const sessionSection = document.querySelector('.history-section:has(.sessions-list)');
    
    if (checkinSection) {
        const visibleCheckins = checkinSection.querySelectorAll('.checkin-card:not([style*="display: none"])');
        const emptyState = checkinSection.querySelector('.empty-state');
        
        if (visibleCheckins.length === 0 && !emptyState) {
            showFilterEmptyState(checkinSection, filter, 'check-ins');
        } else if (visibleCheckins.length > 0 && emptyState) {
            emptyState.remove();
        }
    }
    
    if (sessionSection) {
        const visibleSessions = sessionSection.querySelectorAll('.session-card:not([style*="display: none"])');
        const emptyState = sessionSection.querySelector('.empty-state');
        
        if (visibleSessions.length === 0 && !emptyState) {
            showFilterEmptyState(sessionSection, filter, 'sessions');
        } else if (visibleSessions.length > 0 && emptyState) {
            emptyState.remove();
        }
    }
}

function showFilterEmptyState(section, filter, type) {
    const grid = section.querySelector('.checkins-grid, .sessions-list');
    if (!grid) return;
    
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state filter-empty';
    emptyState.innerHTML = `
        <div class="empty-icon">🔍</div>
        <h3>No ${type} found</h3>
        <p>No ${type} match the current filter: "${filter}"</p>
    `;
    
    grid.parentNode.appendChild(emptyState);
}

// Analytics and insights
function generateInsights() {
    const checkins = Array.from(document.querySelectorAll('.checkin-card'));
    const sessions = Array.from(document.querySelectorAll('.session-card'));
    
    if (checkins.length === 0) return;
    
    // Calculate average mood
    const moods = checkins.map(card => {
        const moodText = card.querySelector('.mood-score').textContent;
        return parseInt(moodText.split('/')[0]);
    });
    
    const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    
    // Count crisis sessions
    const crisisSessions = sessions.filter(card => card.classList.contains('crisis-session')).length;
    
    // Show insights
    showInsightsPanel({
        avgMood: avgMood.toFixed(1),
        totalCheckins: checkins.length,
        totalSessions: sessions.length,
        crisisSessions: crisisSessions,
        moodTrend: calculateMoodTrend(moods)
    });
}

function calculateMoodTrend(moods) {
    if (moods.length < 2) return 'stable';
    
    const recent = moods.slice(-3);
    const earlier = moods.slice(0, -3);
    
    const recentAvg = recent.reduce((sum, mood) => sum + mood, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, mood) => sum + mood, 0) / earlier.length : recentAvg;
    
    if (recentAvg > earlierAvg + 0.5) return 'improving';
    if (recentAvg < earlierAvg - 0.5) return 'declining';
    return 'stable';
}

function showInsightsPanel(insights) {
    const insightsPanel = document.createElement('div');
    insightsPanel.className = 'insights-panel';
    insightsPanel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        background: white;
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: var(--shadow-xl);
        max-width: 300px;
        z-index: 1000;
        border-left: 4px solid var(--primary-blue);
    `;
    
    const trendEmoji = {
        'improving': '📈',
        'declining': '📉',
        'stable': '➡️'
    };
    
    insightsPanel.innerHTML = `
        <button class="close-insights" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
        <h3 style="margin: 0 0 1rem 0; color: var(--primary-blue);">📊 Your Insights</h3>
        <div class="insight-item" style="margin-bottom: 0.75rem;">
            <strong>Average Mood:</strong> ${insights.avgMood}/5
        </div>
        <div class="insight-item" style="margin-bottom: 0.75rem;">
            <strong>Check-ins:</strong> ${insights.totalCheckins}
        </div>
        <div class="insight-item" style="margin-bottom: 0.75rem;">
            <strong>Chat Sessions:</strong> ${insights.totalSessions}
        </div>
        <div class="insight-item" style="margin-bottom: 0.75rem;">
            <strong>Mood Trend:</strong> ${trendEmoji[insights.moodTrend]} ${insights.moodTrend}
        </div>
        ${insights.crisisSessions > 0 ? `<div class="insight-item" style="color: var(--crisis-red);"><strong>⚠️ Crisis Support Sessions:</strong> ${insights.crisisSessions}</div>` : ''}
    `;
    
    document.body.appendChild(insightsPanel);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (document.body.contains(insightsPanel)) {
            insightsPanel.remove();
        }
    }, 10000);
    
    // Close button handler
    insightsPanel.querySelector('.close-insights').addEventListener('click', () => {
        insightsPanel.remove();
    });
}

// Auto-generate insights on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(generateInsights, 2000);
});

// Export functions for testing
window.HistoryPage = {
    setupSpeakButtons,
    setupMoodTrend,
    applySessionFilter,
    generateInsights
};