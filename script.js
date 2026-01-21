// Game State
let currentFlagUrl = '';
let correctAnswer = '';
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let totalGames = 0;
let isSubmitting = false;
let currentHint = '';
let difficulty = 'medium';

// DOM Elements
const flagImage = document.getElementById('flag-image');
const loading = document.getElementById('loading');
const answerInput = document.getElementById('answer-input');
const clearBtn = document.getElementById('clear-btn');
const charCount = document.getElementById('char-count');
const submitBtn = document.getElementById('submit-btn');
const newBtn = document.getElementById('new-btn');
const hintBtn = document.getElementById('hint-btn');
const resultBox = document.getElementById('result-box');
const resultIcon = document.getElementById('result-icon');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const countryInfo = document.getElementById('country-info');
const scoreEl = document.getElementById('score');
const correctCountEl = document.getElementById('correct-count');
const wrongCountEl = document.getElementById('wrong-count');
const accuracyEl = document.getElementById('accuracy');
const averageScoreEl = document.getElementById('average-score');
const difficultyEl = document.getElementById('difficulty');
const hintEl = document.getElementById('hint');
const apiStatus = document.getElementById('api-status');
const notification = document.getElementById('notification');
const hintModal = document.getElementById('hint-modal');
const hintContent = document.getElementById('hint-content');

// Country name mappings for hints and validation
const countryMappings = {
    'amerika serikat': ['usa', 'amerika', 'united states'],
    'inggris': ['united kingdom', 'uk', 'britain'],
    'china': ['cina', 'tiongkok', 'prc'],
    'korea selatan': ['south korea', 'korea'],
    'korea utara': ['north korea'],
    'arab saudi': ['saudi arabia'],
    'uni emirat arab': ['uae', 'emirates'],
    'rusia': ['russia'],
    'jepang': ['japan'],
    'india': ['india'],
    'brasil': ['brazil'],
    'australia': ['australia'],
    'kanada': ['canada'],
    'jerman': ['germany'],
    'prancis': ['france'],
    'italia': ['italy'],
    'spanyol': ['spain'],
    'portugal': ['portugal'],
    'belanda': ['netherlands', 'holland'],
    'swiss': ['switzerland'],
    'swedia': ['sweden'],
    'norwegia': ['norway'],
    'denmark': ['denmark'],
    'finlandia': ['finland'],
    'polandia': ['poland'],
    'czechia': ['czech republic'],
    'slovakia': ['slovak republic'],
    'hungaria': ['hungary'],
    'austria': ['austria'],
    'yunani': ['greece'],
    'turki': ['turkey'],
    'mesir': ['egypt'],
    'mexico': ['mexico'],
    'argentina': ['argentina'],
    'chili': ['chile'],
    'kolombia': ['colombia'],
    'venezuela': ['venezuela'],
    'peru': ['peru'],
    'filipina': ['philippines'],
    'vietnam': ['vietnam'],
    'thailand': ['thailand'],
    'malaysia': ['malaysia'],
    'singapura': ['singapore'],
    'indonesia': ['indonesia']
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    getNewFlag();
});

// Setup event listeners
function setupEventListeners() {
    // Input validation
    answerInput.addEventListener('input', function() {
        const hasValue = this.value.trim().length > 0;
        submitBtn.disabled = !hasValue || isSubmitting;
        updateCharCount();
    });

    // Enter key to submit
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            submitAnswer();
        }
        if (e.key === 'Escape') {
            this.value = '';
            submitBtn.disabled = true;
            updateCharCount();
        }
    });

    // Clear button
    clearBtn.addEventListener('click', function() {
        answerInput.value = '';
        answerInput.focus();
        submitBtn.disabled = true;
        updateCharCount();
    });

    // Image load handler
    flagImage.addEventListener('load', function() {
        flagImage.classList.add('loaded');
        loading.style.display = 'none';
    });

    // Image error handler
    flagImage.addEventListener('error', function() {
        showNotification('Gagal memuat gambar bendera', 'error');
        loading.style.display = 'none';
        flagImage.style.display = 'none';
    });
}

// Update character count
function updateCharCount() {
    const count = answerInput.value.length;
    charCount.textContent = `${count}/30`;
    charCount.style.color = count >= 30 ? '#ff0000' : '#666';
}

// Show notification
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = '';
    notification.classList.add(type);
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show hint modal
function showHint() {
    generateHint();
    hintModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close hint modal
function closeHintModal() {
    hintModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Generate hint based on correct answer
function generateHint() {
    if (!correctAnswer) return;
    
    const answer = correctAnswer.toLowerCase();
    let hintText = '';
    
    // Different hint strategies
    const hintType = Math.floor(Math.random() * 3);
    
    switch(hintType) {
        case 0: // First letter hint
            hintText = `Nama negara ini dimulai dengan huruf <strong>"${answer.charAt(0).toUpperCase()}"</strong>`;
            break;
            
        case 1: // Length hint
            const wordCount = answer.split(' ').length;
            const charCount = answer.replace(/\s/g, '').length;
            hintText = `Nama negara ini terdiri dari <strong>${wordCount} kata</strong> dan <strong>${charCount} huruf</strong>`;
            break;
            
        case 2: // Region hint (simplified)
            const regions = {
                'asia': ['indonesia', 'jepang', 'china', 'india', 'korea', 'thailand', 'malaysia', 'singapura', 'vietnam', 'filipina'],
                'europe': ['inggris', 'jerman', 'prancis', 'italia', 'spanyol', 'rusia', 'belanda', 'swiss', 'swedia', 'norwegia'],
                'america': ['amerika serikat', 'kanada', 'mexico', 'brasil', 'argentina', 'chili', 'kolombia'],
                'africa': ['mesir', 'arab saudi', 'uni emirat arab', 'turki'],
                'oceania': ['australia']
            };
            
            let region = '';
            for (const [reg, countries] of Object.entries(regions)) {
                if (countries.some(c => answer.includes(c) || answer.includes(countryMappings[c]?.[0] || ''))) {
                    region = reg;
                    break;
                }
            }
            
            if (region) {
                hintText = `Negara ini berada di benua <strong>${region.toUpperCase()}</strong>`;
            } else {
                hintText = `Negara ini cukup terkenal di dunia`;
            }
            break;
    }
    
    hintContent.innerHTML = hintText;
    currentHint = hintText;
}

// Get new flag from API
async function getNewFlag() {
    // Reset state
    resetRoundState();
    isSubmitting = false;
    
    // Show loading
    loading.style.display = 'flex';
    flagImage.style.display = 'none';
    flagImage.classList.remove('loaded');
    
    // Update API status
    updateApiStatus('loading', 'Mengambil bendera...');
    
    try {
        const response = await fetch('https://api.siputzx.my.id/api/games/tebakbendera', {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Parse data berdasarkan struktur API
        let flagData;
        if (data.data) {
            flagData = data.data;
        } else if (data.result) {
            flagData = data.result;
        } else {
            flagData = data;
        }

        currentFlagUrl = flagData.img || flagData.image || '';
        correctAnswer = flagData.name || flagData.country || '';
        
        if (!currentFlagUrl || !correctAnswer) {
            throw new Error('Data tidak valid dari API');
        }

        // Set image source
        flagImage.src = currentFlagUrl;
        flagImage.alt = `Bendera ${correctAnswer}`;
        
        // Update hint text
        hintEl.textContent = '🔍 Tebak nama negaranya';
        
        // Set difficulty (random for now)
        const difficulties = ['⚪ Mudah', '🟡 Sedang', '🔴 Sulit'];
        difficultyEl.textContent = difficulties[Math.floor(Math.random() * difficulties.length)];
        
        // Focus input
        answerInput.focus();
        
        // Enable controls
        newBtn.disabled = false;
        submitBtn.disabled = true;
        hintBtn.disabled = false;
        
        // Update API status
        updateApiStatus('success', 'Tebak Bendera API');
        showNotification('Bendera baru siap!', 'success');
        
    } catch (error) {
        console.error('Error fetching flag:', error);
        
        // Show error
        loading.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">❌</div>
                <p style="font-weight: 700; color: #ff0000;">Gagal memuat bendera</p>
                <button onclick="getNewFlag()" style="
                    background: #000;
                    color: #fff;
                    border: 2px solid #000;
                    padding: 8px 16px;
                    font-family: 'Poppins';
                    font-weight: 900;
                    margin-top: 12px;
                    cursor: pointer;
                ">
                    🔄 Coba Lagi
                </button>
            </div>
        `;
        
        // Disable controls
        answerInput.disabled = true;
        submitBtn.disabled = true;
        hintBtn.disabled = true;
        
        // Update API status
        updateApiStatus('error', 'Gagal mengambil');
        showNotification('Gagal memuat bendera', 'error');
    }
}

// Update API status display
function updateApiStatus(status, message) {
    apiStatus.textContent = `API: ${message}`;
    
    switch(status) {
        case 'loading':
            apiStatus.style.color = '#666';
            break;
        case 'success':
            apiStatus.style.color = '#000';
            break;
        case 'error':
            apiStatus.style.color = '#ff0000';
            break;
    }
}

// Normalize answer for comparison
function normalizeAnswer(answer) {
    return answer.toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '');
}

// Check if answer is correct (with variations)
function isAnswerCorrect(userAnswer, correctAnswer) {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    // Exact match
    if (normalizedUser === normalizedCorrect) {
        return true;
    }
    
    // Check synonyms/alternative names
    const correctLower = correctAnswer.toLowerCase();
    if (countryMappings[correctLower]) {
        const alternatives = countryMappings[correctLower];
        if (alternatives.includes(normalizedUser)) {
            return true;
        }
    }
    
    // Check if correct answer is in user's answer
    if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
        return true;
    }
    
    return false;
}

// Submit answer
function submitAnswer() {
    if (!answerInput.value.trim() || isSubmitting) {
        return;
    }

    isSubmitting = true;
    const userAnswer = answerInput.value.trim();
    const isCorrect = isAnswerCorrect(userAnswer, correctAnswer);
    
    totalGames++;
    
    if (isCorrect) {
        handleCorrectAnswer(userAnswer);
    } else {
        handleIncorrectAnswer(userAnswer);
    }
}

// Handle correct answer
function handleCorrectAnswer(userAnswer) {
    score += 100;
    correctCount++;
    
    // Update UI
    updateStats();
    
    // Show success
    resultIcon.textContent = '✓';
    resultIcon.style.backgroundColor = '#000';
    resultIcon.style.color = '#fff';
    resultTitle.textContent = 'BENAR!';
    resultTitle.style.color = '#000';
    resultMessage.textContent = `Jawaban: ${correctAnswer.toUpperCase()}`;
    resultMessage.style.color = '#000';
    
    // Show country info
    countryInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 900;">✅</span>
            <span>Jawaban kamu: <strong>${userAnswer.toUpperCase()}</strong></span>
        </div>
    `;
    
    // Animation
    resultBox.style.animation = 'correct 0.5s ease';
    setTimeout(() => {
        resultBox.style.animation = '';
    }, 500);
    
    showNotification(`✅ +100 Poin! Jawaban benar!`, 'success');
    
    // Disable submit button for this round
    submitBtn.disabled = true;
    isSubmitting = false;
    
    // Auto focus new button after delay
    setTimeout(() => {
        newBtn.focus();
    }, 500);
}

// Handle incorrect answer
function handleIncorrectAnswer(userAnswer) {
    wrongCount++;
    
    // Update UI
    updateStats();
    
    // Show error
    resultIcon.textContent = '✕';
    resultIcon.style.backgroundColor = '#000';
    resultIcon.style.color = '#fff';
    resultTitle.textContent = 'SALAH';
    resultTitle.style.color = '#000';
    resultMessage.textContent = `Jawaban yang benar:`;
    resultMessage.style.color = '#000';
    
    // Show country info
    countryInfo.innerHTML = `
        <div style="margin-bottom: 8px;">
            <span style="font-weight: 900;">❌</span> Jawaban kamu: <strong>${userAnswer.toUpperCase()}</strong>
        </div>
        <div>
            <span style="font-weight: 900;">✅</span> Jawaban benar: <strong style="color: #000; text-decoration: underline;">${correctAnswer.toUpperCase()}</strong>
        </div>
    `;
    
    // Animation
    resultBox.style.animation = 'incorrect 0.5s ease';
    setTimeout(() => {
        resultBox.style.animation = '';
    }, 500);
    
    showNotification('Jawaban salah, coba lagi!', 'error');
    
    // Keep input for retry
    answerInput.select();
    isSubmitting = false;
}

// Update stats
function updateStats() {
    scoreEl.textContent = score;
    correctCountEl.textContent = correctCount;
    wrongCountEl.textContent = wrongCount;
    
    // Calculate accuracy
    const accuracy = totalGames > 0 ? Math.round((correctCount / totalGames) * 100) : 0;
    accuracyEl.textContent = `${accuracy}%`;
    
    // Calculate average score
    const average = totalGames > 0 ? Math.round(score / totalGames) : 0;
    averageScoreEl.textContent = average;
}

// Reset round state
function resetRoundState() {
    answerInput.value = '';
    answerInput.disabled = false;
    submitBtn.disabled = true;
    
    resultIcon.textContent = '⚫';
    resultIcon.style.backgroundColor = '#000';
    resultIcon.style.color = '#fff';
    resultTitle.textContent = 'Tunggu jawaban';
    resultTitle.style.color = '#000';
    resultMessage.textContent = 'Submit jawaban untuk melihat hasil';
    resultMessage.style.color = '#000';
    countryInfo.innerHTML = '';
    
    updateCharCount();
}

// Initialize styles for notification
document.head.insertAdjacentHTML('beforeend', `
    <style>
        #notification.success {
            background: #000;
            color: #fff;
            border-color: #000;
        }
        
        #notification.error {
            background: #000;
            color: #ff0000;
            border-color: #ff0000;
        }
        
        #notification.warning {
            background: #000;
            color: #ffcc00;
            border-color: #ffcc00;
        }
        
        #notification.info {
            background: #000;
            color: #fff;
            border-color: #000;
        }
        
        /* Close modal by clicking outside */
        .modal.active .modal-content {
            animation: slideIn 0.3s ease;
        }
    </style>
`);

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (hintModal.classList.contains('active') && e.target === hintModal) {
        closeHintModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && hintModal.classList.contains('active')) {
        closeHintModal();
    }
});

// Add sample data for development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Development mode: Tebak Bendera Game Loaded');
}
