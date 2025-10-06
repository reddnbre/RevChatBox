// RevChattyBox - Clean Chat-Only Version
// Simple, reliable, and functional chat application

// Configuration
const CONFIG = {
    GAMES: [
        { id: 'hangman', name: 'Hangman', description: 'Guess the word letter by letter' },
        { id: 'connect4', name: 'Connect 4', description: 'Drop discs to win' },
        { id: 'war', name: 'War', description: 'Card battle game' },
        { id: 'battleship', name: 'Battleship', description: 'Strategic naval warfare' }
    ],
    THEME_KEY: 'rcb_theme',
    NAME_KEY: 'rcb_display_name',
    METRICS_KEY: 'rcb_metrics'
};

// Admin credentials (hidden)
const ADMIN_ACCESS = {
    u: 'admin',
    p: 'admin123'
};

// Global State
let isAdmin = false;
let gameState = {};
let metricsState = null;

// Utility Functions
const Utils = {
    formatTime: (date) => {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// Theme Management
const ThemeManager = {
    init: () => {
        const savedTheme = localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
        ThemeManager.setTheme(savedTheme);
        
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', ThemeManager.toggleTheme);
        }
    },
    
    setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        localStorage.setItem(CONFIG.THEME_KEY, theme);
    },
    
    toggleTheme: () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        ThemeManager.setTheme(newTheme);
    }
};

// Name Management
const NameManager = {
    init: () => {
        const savedName = localStorage.getItem(CONFIG.NAME_KEY);
        if (savedName) {
            NameManager.setDisplayName(savedName);
        } else {
            NameManager.showNameModal();
        }
    },
    
    showNameModal: () => {
        const modal = document.getElementById('nameEntryModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },
    
    hideNameModal: () => {
        const modal = document.getElementById('nameEntryModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    setDisplayName: (name) => {
        const displayElement = document.getElementById('displayName');
        if (displayElement) {
            displayElement.textContent = name;
        }
        localStorage.setItem(CONFIG.NAME_KEY, name);
        NameManager.hideNameModal();
    },
    
    getName: () => {
        return localStorage.getItem(CONFIG.NAME_KEY) || 'Anonymous';
    }
};

// Cookie Management
const CookieManager = {
    init: () => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            CookieManager.showBanner();
        }
    },
    
    showBanner: () => {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.style.display = 'block';
            
            document.getElementById('cookieAccept').addEventListener('click', () => {
                localStorage.setItem('cookie_consent', 'accepted');
                banner.style.display = 'none';
            });
            
            document.getElementById('cookieDecline').addEventListener('click', () => {
                localStorage.setItem('cookie_consent', 'declined');
                banner.style.display = 'none';
            });
        }
    }
};

// Metrics Management
const Metrics = {
    init: () => {
        Metrics.load();
        Metrics.addEvent('page_view');
    },
    
    load: () => {
        try {
            const saved = localStorage.getItem(CONFIG.METRICS_KEY);
            metricsState = saved ? JSON.parse(saved) : {
                events: [],
                uniqueVisitors: [],
                lastVisit: null
            };
        } catch (err) {
            console.error('Error loading metrics:', err);
            metricsState = {
                events: [],
                uniqueVisitors: [],
                lastVisit: null
            };
        }
    },
    
    addEvent: (eventType, data = {}) => {
        if (!metricsState) Metrics.load();
        
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        metricsState.events.push(event);
        metricsState.lastVisit = new Date().toISOString();
        
        // Track unique visitors
        const visitorId = localStorage.getItem('visitor_id') || Date.now().toString();
        if (!localStorage.getItem('visitor_id')) {
            localStorage.setItem('visitor_id', visitorId);
            metricsState.uniqueVisitors.push({
                id: visitorId,
                firstVisit: new Date().toISOString()
            });
        }
        
        Metrics.save();
    },
    
    save: () => {
        try {
            localStorage.setItem(CONFIG.METRICS_KEY, JSON.stringify(metricsState));
        } catch (err) {
            console.error('Error saving metrics:', err);
        }
    },
    
    getStats: () => {
        if (!metricsState) Metrics.load();
        return {
            totalEvents: metricsState.events.length,
            uniqueVisitors: metricsState.uniqueVisitors.length,
            lastVisit: metricsState.lastVisit
        };
    }
};

// Splash Screen Management
const SplashManager = {
    init: () => {
        const splash = document.getElementById('splash');
        const app = document.getElementById('app');
        
        if (!splash || !app) return;
        
        let progress = 0;
        const tips = [
            '🎯 Loading gaming features...',
            '🎨 Applying premium themes...',
            '🔧 Setting up chat system...',
            '🎮 Preparing game hub...',
            '⚡ Optimizing performance...',
            '🚀 Almost ready...',
            '✨ Welcome to RevChattyBox!'
        ];
        
        const progressBar = document.getElementById('progressBar');
        const statusText = document.getElementById('statusText');
        const progressPercent = document.getElementById('progressPercent');
        const progressTips = document.getElementById('progressTips');
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';
            
            const tipIndex = Math.floor((progress / 100) * tips.length);
            if (statusText && tips[tipIndex]) {
                statusText.textContent = tips[tipIndex];
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    splash.style.display = 'none';
                    app.style.display = 'block';
                    Metrics.addEvent('app_loaded');
                }, 500);
            }
        }, 200);
        
        // Button handlers
        document.getElementById('enterBtn')?.addEventListener('click', () => {
            clearInterval(interval);
            splash.style.display = 'none';
            app.style.display = 'block';
            Metrics.addEvent('app_loaded');
        });
        
        document.getElementById('skipBtn')?.addEventListener('click', () => {
            clearInterval(interval);
            splash.style.display = 'none';
            app.style.display = 'block';
            Metrics.addEvent('app_loaded');
        });
    }
};

// UI Management
const UIManager = {
    init: () => {
        UIManager.setupNameForm();
        UIManager.setupGameHub();
    },
    
    setupNameForm: () => {
        const form = document.getElementById('nameEntryForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('displayNameInput');
                const name = nameInput.value.trim();
                if (name) {
                    NameManager.setDisplayName(name);
                    Metrics.addEvent('name_set', { name: name });
                }
            });
        }
    },
    
    setupGameHub: () => {
        const gameHubBtn = document.getElementById('gameHubBtn');
        if (gameHubBtn) {
            gameHubBtn.addEventListener('click', GameManager.showGameHub);
        }
    }
};

// Game Management
const GameManager = {
    init: () => {
        GameManager.loadGames();
    },
    
    loadGames: () => {
        const gameList = document.getElementById('gameList');
        if (!gameList) return;
        
        gameList.innerHTML = '';
        CONFIG.GAMES.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <h3>${game.name}</h3>
                <p>${game.description}</p>
                <button onclick="GameManager.startGame('${game.id}')" class="btn btn-primary">Play</button>
            `;
            gameList.appendChild(gameCard);
        });
    },
    
    showGameHub: () => {
        const modal = document.getElementById('gameHubModal');
        if (modal) {
            modal.style.display = 'flex';
            Metrics.addEvent('game_hub_opened');
        }
    },
    
    hideGameHub: () => {
        const modal = document.getElementById('gameHubModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    startGame: (gameId) => {
        const game = CONFIG.GAMES.find(g => g.id === gameId);
        if (!game) return;
        
        const modal = document.getElementById('gameModal');
        const title = document.getElementById('gameTitle');
        
        if (modal && title) {
            title.textContent = game.name;
            modal.style.display = 'flex';
            
            // Load game content
            GameManager.loadGameContent(gameId);
            Metrics.addEvent('game_started', { game: gameId });
        }
        
        GameManager.hideGameHub();
    },
    
    hideGameModal: () => {
        const modal = document.getElementById('gameModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    loadGameContent: (gameId) => {
        const container = document.getElementById('gameContainer');
        const status = document.getElementById('gameStatus');
        
        if (!container || !status) return;
        
        status.innerHTML = '<p>Game loading...</p>';
        
        // Simple game implementations
        switch (gameId) {
            case 'hangman':
                GameManager.loadHangman(container, status);
                break;
            case 'connect4':
                GameManager.loadConnect4(container, status);
                break;
            case 'war':
                GameManager.loadWar(container, status);
                break;
            case 'battleship':
                GameManager.loadBattleship(container, status);
                break;
        }
    },
    
    loadHangman: (container, status) => {
        const words = ['JAVASCRIPT', 'PYTHON', 'GAMING', 'CHAT', 'REVCHATTYBOX'];
        const word = words[Math.floor(Math.random() * words.length)];
        let guessed = new Array(word.length).fill('_');
        let wrongGuesses = 0;
        const maxWrong = 6;
        
        status.innerHTML = `
            <p>Guess the word: ${guessed.join(' ')}</p>
            <p>Wrong guesses: ${wrongGuesses}/${maxWrong}</p>
        `;
        
        container.innerHTML = `
            <div class="hangman-game">
                <div class="word-display">${guessed.join(' ')}</div>
                <div class="alphabet">
                    ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => 
                        `<button class="letter-btn" data-letter="${letter}">${letter}</button>`
                    ).join('')}
                </div>
                <button onclick="GameManager.resetGame('hangman')" class="btn btn-secondary">Reset</button>
            </div>
        `;
        
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('letter-btn')) {
                const letter = e.target.dataset.letter;
                e.target.disabled = true;
                
                if (word.includes(letter)) {
                    for (let i = 0; i < word.length; i++) {
                        if (word[i] === letter) {
                            guessed[i] = letter;
                        }
                    }
                } else {
                    wrongGuesses++;
                }
                
                status.innerHTML = `
                    <p>Guess the word: ${guessed.join(' ')}</p>
                    <p>Wrong guesses: ${wrongGuesses}/${maxWrong}</p>
                `;
                
                if (guessed.join('') === word) {
                    status.innerHTML = '<p style="color: green;">🎉 You won!</p>';
                } else if (wrongGuesses >= maxWrong) {
                    status.innerHTML = `<p style="color: red;">💀 Game Over! The word was: ${word}</p>`;
                }
            }
        });
    },
    
    loadConnect4: (container, status) => {
        let board = Array(6).fill().map(() => Array(7).fill(''));
        let currentPlayer = '🔴';
        let gameOver = false;
        
        status.innerHTML = `<p>Current player: ${currentPlayer}</p>`;
        
        const renderBoard = () => {
            let html = '<div class="connect4-board">';
            for (let row = 0; row < 6; row++) {
                html += '<div class="row">';
                for (let col = 0; col < 7; col++) {
                    html += `<div class="cell" data-row="${row}" data-col="${col}">${board[row][col]}</div>`;
                }
                html += '</div>';
            }
            html += '</div>';
            return html;
        };
        
        container.innerHTML = `
            ${renderBoard()}
            <button onclick="GameManager.resetGame('connect4')" class="btn btn-secondary">Reset</button>
        `;
        
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !gameOver) {
                const col = parseInt(e.target.dataset.col);
                
                // Find the lowest empty row in this column
                for (let row = 5; row >= 0; row--) {
                    if (board[row][col] === '') {
                        board[row][col] = currentPlayer;
                        break;
                    }
                }
                
                currentPlayer = currentPlayer === '🔴' ? '🟡' : '🔴';
                status.innerHTML = `<p>Current player: ${currentPlayer}</p>`;
                
                container.innerHTML = `
                    ${renderBoard()}
                    <button onclick="GameManager.resetGame('connect4')" class="btn btn-secondary">Reset</button>
                `;
            }
        });
    },
    
    loadWar: (container, status) => {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let deck = [];
        let playerScore = 0;
        let botScore = 0;
        let round = 0;
        
        // Create deck
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push({ suit, rank, value: ranks.indexOf(rank) });
            }
        }
        
        // Shuffle deck
        deck.sort(() => Math.random() - 0.5);
        
        status.innerHTML = `
            <p>Round ${round + 1}</p>
            <p>Your score: ${playerScore} | Bot score: ${botScore}</p>
        `;
        
        container.innerHTML = `
            <div class="war-game">
                <div class="cards">
                    <div class="player-card">
                        <h3>Your Card</h3>
                        <div id="playerCardDisplay">Click Deal to start!</div>
                    </div>
                    <div class="bot-card">
                        <h3>Bot Card</h3>
                        <div id="botCardDisplay">Waiting...</div>
                    </div>
                </div>
                <button onclick="GameManager.dealWarCard()" class="btn btn-primary">Deal Card</button>
                <button onclick="GameManager.resetGame('war')" class="btn btn-secondary">Reset</button>
            </div>
        `;
        
        window.dealWarCard = () => {
            if (deck.length < 2) {
                status.innerHTML = '<p>Deck empty! Game over.</p>';
                return;
            }
            
            const playerCard = deck.pop();
            const botCard = deck.pop();
            
            document.getElementById('playerCardDisplay').innerHTML = 
                `${playerCard.rank} ${playerCard.suit}`;
            document.getElementById('botCardDisplay').innerHTML = 
                `${botCard.rank} ${botCard.suit}`;
            
            if (playerCard.value > botCard.value) {
                playerScore++;
                status.innerHTML = `
                    <p style="color: green;">You win this round!</p>
                    <p>Your score: ${playerScore} | Bot score: ${botScore}</p>
                `;
            } else if (botCard.value > playerCard.value) {
                botScore++;
                status.innerHTML = `
                    <p style="color: red;">Bot wins this round!</p>
                    <p>Your score: ${playerScore} | Bot score: ${botScore}</p>
                `;
            } else {
                status.innerHTML = `
                    <p style="color: orange;">Tie!</p>
                    <p>Your score: ${playerScore} | Bot score: ${botScore}</p>
                `;
            }
            
            round++;
        };
    },
    
    loadBattleship: (container, status) => {
        let board = Array(10).fill().map(() => Array(10).fill('🌊'));
        let ships = [
            { name: 'Carrier', size: 5, placed: false },
            { name: 'Battleship', size: 4, placed: false },
            { name: 'Cruiser', size: 3, placed: false },
            { name: 'Submarine', size: 3, placed: false },
            { name: 'Destroyer', size: 2, placed: false }
        ];
        let currentShip = 0;
        let placing = true;
        let hits = 0;
        let totalHits = ships.reduce((sum, ship) => sum + ship.size, 0);
        
        status.innerHTML = `
            <p>Place your ${ships[currentShip].name} (${ships[currentShip].size} cells)</p>
            <p>Click on the board to place your ship</p>
        `;
        
        const renderBoard = () => {
            let html = '<div class="battleship-board">';
            for (let row = 0; row < 10; row++) {
                html += '<div class="row">';
                for (let col = 0; col < 10; col++) {
                    html += `<div class="cell" data-row="${row}" data-col="${col}">${board[row][col]}</div>`;
                }
                html += '</div>';
            }
            html += '</div>';
            return html;
        };
        
        container.innerHTML = `
            ${renderBoard()}
            <button onclick="GameManager.resetGame('battleship')" class="btn btn-secondary">Reset</button>
        `;
        
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && placing) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                
                // Simple placement logic
                if (board[row][col] === '🌊') {
                    for (let i = 0; i < ships[currentShip].size; i++) {
                        if (col + i < 10) {
                            board[row][col + i] = '🚢';
                        }
                    }
                    ships[currentShip].placed = true;
                    currentShip++;
                    
                    if (currentShip >= ships.length) {
                        placing = false;
                        status.innerHTML = '<p>All ships placed! Click cells to attack!</p>';
                    } else {
                        status.innerHTML = `
                            <p>Place your ${ships[currentShip].name} (${ships[currentShip].size} cells)</p>
                        `;
                    }
                    
                    container.innerHTML = `
                        ${renderBoard()}
                        <button onclick="GameManager.resetGame('battleship')" class="btn btn-secondary">Reset</button>
                    `;
                }
            } else if (e.target.classList.contains('cell') && !placing) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                
                if (board[row][col] === '🚢') {
                    board[row][col] = '💥';
                    hits++;
                    status.innerHTML = `<p>Hit! (${hits}/${totalHits})</p>`;
                    
                    if (hits >= totalHits) {
                        status.innerHTML = '<p style="color: green;">🎉 You sunk all ships!</p>';
                    }
                } else if (board[row][col] === '🌊') {
                    board[row][col] = '❌';
                    status.innerHTML = `<p>Miss! (${hits}/${totalHits})</p>`;
                }
                
                container.innerHTML = `
                    ${renderBoard()}
                    <button onclick="GameManager.resetGame('battleship')" class="btn btn-secondary">Reset</button>
                `;
            }
        });
    },
    
    resetGame: (gameId) => {
        GameManager.loadGameContent(gameId);
        Metrics.addEvent('game_reset', { game: gameId });
    }
};

// Emoji Management
const EmojiManager = {
    emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
        '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
        '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '👏',
        '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '👎', '👍', '👌'
    ],
    
    init: () => {
        const emojiBtn = document.getElementById('emojiBtn');
        const picker = document.getElementById('emojiPicker');
        const input = document.getElementById('messageInput');
        
        if (emojiBtn && picker) {
            emojiBtn.addEventListener('click', EmojiManager.showPicker);
            EmojiManager.populateEmojiGrid();
        }
    },
    
    showPicker: () => {
        const picker = document.getElementById('emojiPicker');
        if (picker) {
            picker.style.display = 'block';
        }
    },
    
    hidePicker: () => {
        const picker = document.getElementById('emojiPicker');
        if (picker) {
            picker.style.display = 'none';
        }
    },
    
    populateEmojiGrid: () => {
        const grid = document.querySelector('.emoji-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        EmojiManager.emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-btn';
            btn.textContent = emoji;
            btn.addEventListener('click', () => EmojiManager.insertEmoji(emoji));
            grid.appendChild(btn);
        });
    },
    
    insertEmoji: (emoji) => {
        const input = document.getElementById('messageInput');
        if (input) {
            const cursorPos = input.selectionStart;
            const textBefore = input.value.substring(0, cursorPos);
            const textAfter = input.value.substring(cursorPos);
            input.value = textBefore + emoji + textAfter;
            input.focus();
            input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        }
        EmojiManager.hidePicker();
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('RevChattyBox initializing...');
    
    // Initialize core systems
    Metrics.init();
    ThemeManager.init();
    NameManager.init();
    CookieManager.init();
    UIManager.init();
    GameManager.init();
    EmojiManager.init();
    SplashManager.init();
    
    console.log('RevChattyBox initialized successfully!');
});

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Close modals with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
});