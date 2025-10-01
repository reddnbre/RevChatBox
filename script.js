// RevChattyBox - Clean Working Version
// Simple, reliable, and functional

// Configuration
const CONFIG = {
    GAMES: [
        { id: 'tictactoe', name: 'Tic Tac Toe', description: 'Classic 3x3 grid game' },
        { id: 'battleship', name: 'Battleship', description: 'Strategic naval warfare' },
        { id: 'connect4', name: 'Connect 4', description: 'Drop discs to win' },
        { id: 'war', name: 'War', description: 'Card battle game' }
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Name Management
const NameManager = {
    getName: () => localStorage.getItem(CONFIG.NAME_KEY) || '',
    setName: (name) => localStorage.setItem(CONFIG.NAME_KEY, name.trim().slice(0, 20)),
    showModal: () => {
        const modal = document.getElementById('nameEntryModal');
        if (modal) modal.style.display = 'block';
        const input = document.getElementById('displayNameInput');
        if (input) input.value = NameManager.getName();
    },
    hideModal: () => {
        const modal = document.getElementById('nameEntryModal');
        if (modal) modal.style.display = 'none';
    },
    init: () => {
        const form = document.getElementById('nameEntryForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('displayNameInput');
                if (input && input.value.trim()) {
                    NameManager.setName(input.value);
                    NameManager.hideModal();
                    UIManager.updateDisplayName();
                }
            });
        }
        if (!NameManager.getName()) {
            NameManager.showModal();
        } else {
            UIManager.updateDisplayName();
        }
    }
};

// UI Management (theme, name)
const UIManager = {
    applyTheme: () => {
        const saved = localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
        document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
        
        // Set initial theme button icon
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.textContent = saved === 'dark' ? '🌙' : '☀️';
        }
    },
    toggleTheme: () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(CONFIG.THEME_KEY, next);
        
        // Update theme button icon
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
        }
    },
    updateDisplayName: () => {
        const el = document.getElementById('displayName');
        if (!el) return;
        const name = NameManager.getName();
        el.textContent = name ? `Hi, ${name}` : '';
    },
    init: () => {
        UIManager.applyTheme();
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) themeBtn.addEventListener('click', UIManager.toggleTheme);
        NameManager.init();
        CookieManager.init();
    }
};

// Cookie Consent Management
const CookieManager = {
    COOKIE_KEY: 'rcb_cookie_consent',
    
    hasConsent: () => {
        return localStorage.getItem(CookieManager.COOKIE_KEY) === 'accepted';
    },
    
    showBanner: () => {
        const banner = document.getElementById('cookieBanner');
        if (banner && !CookieManager.hasConsent()) {
            banner.classList.add('show');
        }
    },
    
    hideBanner: () => {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('show');
        }
    },
    
    accept: () => {
        localStorage.setItem(CookieManager.COOKIE_KEY, 'accepted');
        CookieManager.hideBanner();
        Utils.showNotification('Cookie preferences saved!', 'success');
    },
    
    decline: () => {
        // Clear existing data when declining
        localStorage.removeItem(CONFIG.THEME_KEY);
        localStorage.removeItem(CONFIG.NAME_KEY);
        localStorage.removeItem(CONFIG.METRICS_KEY);
        localStorage.setItem(CookieManager.COOKIE_KEY, 'declined');
        CookieManager.hideBanner();
        Utils.showNotification('Cookie preferences declined. Some features may be limited.', 'info');
        
        // Refresh the page to reset state
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    },
    
    init: () => {
        // Show banner if no consent given yet
        if (!CookieManager.hasConsent()) {
            setTimeout(() => CookieManager.showBanner(), 1000);
        }
        
        // Add event listeners
        const acceptBtn = document.getElementById('cookieAccept');
        const declineBtn = document.getElementById('cookieDecline');
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', CookieManager.accept);
        }
        
        if (declineBtn) {
            declineBtn.addEventListener('click', CookieManager.decline);
        }
    }
};

// Metrics Management
const Metrics = {
    load: () => {
        try {
            metricsState = JSON.parse(localStorage.getItem(CONFIG.METRICS_KEY) || '{}');
        } catch {
            metricsState = {};
        }
        metricsState.events = metricsState.events || [];
        metricsState.visitors = metricsState.visitors || {};
        // Track visitor
        const name = NameManager.getName() || `anon-${Math.random().toString(36).slice(2, 8)}`;
        const today = new Date().toISOString().slice(0,10);
        metricsState.visitors[today] = metricsState.visitors[today] || new Set ? metricsState.visitors[today] : {};
        // Use array for storage compatibility
        if (!Array.isArray(metricsState.visitors[today])) metricsState.visitors[today] = [];
        if (!metricsState.visitors[today].includes(name)) metricsState.visitors[today].push(name);
        Metrics.save();
    },
    save: () => localStorage.setItem(CONFIG.METRICS_KEY, JSON.stringify(metricsState)),
    addEvent: (type, data={}) => {
        metricsState.events.push({ type, data, ts: Date.now() });
        // Trim to last 5000 events
        if (metricsState.events.length > 5000) metricsState.events = metricsState.events.slice(-5000);
        Metrics.save();
    },
    countEvents: (type, sinceMs = 0) => metricsState.events.filter(e => e.type === type && e.ts >= sinceMs).length,
    uniqueVisitorsSince: (sinceMs) => {
        const names = new Set();
        metricsState.events.forEach(e => {
            if (e.type === 'visit' && e.ts >= sinceMs && e.data && e.data.name) names.add(e.data.name);
        });
        return names.size;
    },
    recordVisit: () => Metrics.addEvent('visit', { name: NameManager.getName() || 'anon' })
};

// Chat Management
const ChatManager = {
    init: () => {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const pmBtn = document.getElementById('pmBtn');
        
        if (messageInput && sendBtn) {
            sendBtn.addEventListener('click', ChatManager.sendMessage);
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    ChatManager.sendMessage();
                }
            });
        }
        if (pmBtn) pmBtn.addEventListener('click', PMManager.showModal);
    },
    
    sendMessage: () => {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (message && message.length <= 500) {
            ChatManager.addMessage(message, 'user');
            messageInput.value = '';
            
            // Simulate bot response
            setTimeout(() => {
                ChatManager.addMessage('Thanks for your message!', 'bot');
            }, 1000);
        }
    },
    
    addMessage: (message, sender) => {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const time = Utils.formatTime(new Date());
        messageDiv.innerHTML = `
            <div class="message-content">${Utils.escapeHtml(message)}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
};

// Private Message Manager (client-side simulation)
const PMManager = {
    showModal: () => {
        const modal = document.getElementById('pmModal');
        if (modal) modal.style.display = 'block';
        const recipient = document.getElementById('pmRecipient');
        if (recipient && !recipient.value) recipient.value = '';
        const form = document.getElementById('pmForm');
        if (form && !PMManager._bound) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                PMManager.send();
            });
            PMManager._bound = true;
        }
    },
    hideModal: () => {
        const modal = document.getElementById('pmModal');
        if (modal) modal.style.display = 'none';
    },
    send: () => {
        const recipient = document.getElementById('pmRecipient');
        const text = document.getElementById('pmText');
        const from = NameManager.getName() || 'You';
        if (!recipient || !text || !text.value.trim()) return;
        const to = recipient.value.trim();
        const msg = `<span class=\"pm-badge\">PM</span><strong>${Utils.escapeHtml(from)}</strong> ➜ <strong>${Utils.escapeHtml(to)}</strong>: ${Utils.escapeHtml(text.value.trim())}`;
        ChatManager.addMessage(msg, 'pm');
        text.value = '';
        PMManager.hideModal();
    }
};

// Game Manager
const GameManager = {
    init: () => {
        const gameHubBtn = document.getElementById('gameHubBtn');
        if (gameHubBtn) {
            gameHubBtn.addEventListener('click', GameManager.showGameHub);
        }
        // Init UI and metrics
        UIManager.init();
        Metrics.load();
        Metrics.recordVisit();
    },
    
    showGameHub: () => {
        const gameHubModal = document.getElementById('gameHubModal');
        if (gameHubModal) {
            gameHubModal.style.display = 'block';
            GameManager.renderGameList();
        }
    },
    
    hideGameHub: () => {
        const gameHubModal = document.getElementById('gameHubModal');
        if (gameHubModal) {
            gameHubModal.style.display = 'none';
        }
    },
    
    renderGameList: () => {
        const gameList = document.getElementById('gameList');
        if (gameList) {
            gameList.innerHTML = CONFIG.GAMES.map(game => `
                <div class="game-item" onclick="GameManager.selectGame('${game.id}')">
                    <h3>${game.name}</h3>
                    <p>${game.description}</p>
                    <button class="btn btn-primary">Play Game</button>
                </div>
            `).join('');
        }
    },
    
    selectGame: (gameId) => {
        GameManager.hideGameHub();
        
        const gameModal = document.getElementById('gameModal');
        const gameTitle = document.getElementById('gameTitle');
        const game = CONFIG.GAMES.find(g => g.id === gameId);
        
        if (gameModal && gameTitle && game) {
            gameTitle.textContent = game.name;
            gameModal.style.display = 'block';
            GameManager.showGameModeSelection(gameId);
        }
    },
    
    showGameModeSelection: (gameId) => {
        const gameContainer = document.getElementById('gameContainer');
        const gameStatus = document.getElementById('gameStatus');
        
        gameContainer.innerHTML = `
            <div class="game-mode-selection">
                <h3>Choose Game Mode</h3>
                <div class="mode-buttons">
                    <button class="btn btn-primary" onclick="GameManager.startMultiplayer('${gameId}')">
                        🎮 PvP (Wait for Player)
                    </button>
                    <button class="btn btn-secondary" onclick="GameManager.startBotGame('${gameId}')">
                        🤖 Play vs Bot
                    </button>
                </div>
                <p class="mode-description">
                    PvP: Wait 30 seconds for another player to join, or play against a bot.
                </p>
            </div>
        `;
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">Game:</span>
                    <span class="score">${CONFIG.GAMES.find(g => g.id === gameId)?.name || gameId}</span>
                </div>
            </div>
        `;
    },
    
    startMultiplayer: (gameId) => {
        const gameContainer = document.getElementById('gameContainer');
        const gameStatus = document.getElementById('gameStatus');
        
        // Generate unique room code
        const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        
        gameContainer.innerHTML = `
            <div class="waiting-room">
                <h3>🎮 Waiting for Player</h3>
                <div class="room-code">Room Code: <strong>${roomCode}</strong></div>
                <div class="waiting-text">Share this code with another player to join!</div>
                <div class="countdown" id="countdown">30</div>
                <div class="waiting-message">Waiting for another player to join...</div>
                <button class="btn btn-secondary" onclick="GameManager.startBotGame('${gameId}')">
                    Skip Wait - Play Bot
                </button>
            </div>
        `;
        
        // Start 30-second countdown
        let timeLeft = 30;
        const countdownElement = document.getElementById('countdown');
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (countdownElement) {
                countdownElement.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                // No player joined, fall back to bot
                GameManager.startBotGame(gameId);
            }
        }, 1000);
        
        // Simulate player joining after random delay (5-20 seconds)
        const joinDelay = Math.random() * 15000 + 5000; // 5-20 seconds
        
        setTimeout(() => {
            if (timeLeft > 0) {
                clearInterval(countdownInterval);
                GameManager.playerJoined(gameId, roomCode);
            }
        }, joinDelay);
    },
    
    playerJoined: (gameId, roomCode) => {
        const gameContainer = document.getElementById('gameContainer');
        
        gameContainer.innerHTML = `
            <div class="player-joined">
                <h3>🎉 Player Joined!</h3>
                <div class="join-message">Another player has joined room ${roomCode}</div>
                <div class="starting-text">Starting game...</div>
            </div>
        `;
        
        // Set multiplayer state
        gameState.isMultiplayer = true;
        
        setTimeout(() => {
            GameManager.loadGame(gameId);
        }, 2000);
    },
    
    startBotGame: (gameId) => {
        // Set single-player state
        gameState.isMultiplayer = false;
        GameManager.loadGame(gameId);
    },
    
    hideGameModal: () => {
        const gameModal = document.getElementById('gameModal');
        if (gameModal) {
            gameModal.style.display = 'none';
        }
    },
    
    backToGames: () => {
        // Close game modal and reopen the Game Hub
        GameManager.hideGameModal();
        GameManager.showGameHub();
    },
    
    loadGame: (gameId) => {
        const gameContainer = document.getElementById('gameContainer');
        const gameStatus = document.getElementById('gameStatus');
        
        switch (gameId) {
            case 'tictactoe':
                gameContainer.innerHTML = `
                    <div class="tic-tac-toe-board">
                        <div class="game-grid-3x3">
                            ${Array(9).fill().map((_, i) => `<div class="cell" data-index="${i}"></div>`).join('')}
                        </div>
                    </div>
                `;
                Metrics.addEvent('game_start', { game: 'tictactoe' });
                TicTacToe.init();
                break;
            case 'battleship':
                Metrics.addEvent('game_start', { game: 'battleship' });
                Battleship.init();
                break;
            case 'connect4':
                Metrics.addEvent('game_start', { game: 'connect4' });
                Connect4.init();
                break;
            case 'war':
                Metrics.addEvent('game_start', { game: 'war' });
                War.init();
                break;
            default:
                Utils.showNotification('Game not found!', 'error');
        }
    }
};

// Tic Tac Toe Game
const TicTacToe = {
    init: () => {
        gameState = {
            board: Array(9).fill(''),
            currentPlayer: 'X',
            gameActive: true,
            player1Score: 0,
            player2Score: 0,
            gameCount: 0,
            isMultiplayer: gameState.isMultiplayer || false
        };
        
        TicTacToe.updateScoreDisplay();
        TicTacToe.clearBoard();
        TicTacToe.attachEvents();
    },
    
    clearBoard: () => {
        const cells = document.querySelectorAll('.tic-tac-toe-board .cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.style.background = 'white';
            cell.style.color = 'black';
        });
    },
    
    attachEvents: () => {
        const cells = document.querySelectorAll('.tic-tac-toe-board .cell');
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => TicTacToe.handleCellClick(index));
        });
    },
    
    updateScoreDisplay: () => {
        const gameStatus = document.getElementById('gameStatus');
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        const currentPlayerName = gameState.currentPlayer === 'X' ? player1Name : player2Name;
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">${player1Name} (X):</span>
                    <span class="score">${gameState.player1Score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">${player2Name} (O):</span>
                    <span class="score">${gameState.player2Score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">Games:</span>
                    <span class="score">${gameState.gameCount}</span>
                </div>
            </div>
            <div class="current-player">Current Player: ${currentPlayerName} (${gameState.currentPlayer})</div>
        `;
    },
    
    handleCellClick: (index) => {
        if (!gameState.gameActive || gameState.board[index] !== '') return;
        
        gameState.board[index] = gameState.currentPlayer;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = gameState.currentPlayer;
        cell.style.background = gameState.currentPlayer === 'X' ? '#007bff' : '#dc3545';
        cell.style.color = 'white';
        
        if (TicTacToe.checkWinner()) {
            TicTacToe.highlightWinningCells();
            TicTacToe.endGame(gameState.currentPlayer === 'X' ? 'player' : 'bot');
            return;
        }
        
        if (TicTacToe.checkDraw()) {
            TicTacToe.endGame('draw');
            return;
        }
        
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        TicTacToe.updateScoreDisplay();
        
        // Bot move only in single-player mode
        if (!gameState.isMultiplayer && gameState.currentPlayer === 'O') {
            setTimeout(() => TicTacToe.botMove(), 800);
        }
    },
    
    botMove: () => {
        if (!gameState.gameActive) return;
        
        const emptyCells = gameState.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        const moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        if (moveIndex !== undefined) {
            TicTacToe.handleCellClick(moveIndex);
        }
    },
    
    highlightWinningCells: () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
                pattern.forEach(index => {
                    const cell = document.querySelector(`[data-index="${index}"]`);
                    cell.style.background = '#28a745';
                    cell.style.animation = 'pulse 0.5s ease-in-out 3';
                });
                break;
            }
        }
    },
    
    endGame: (result) => {
        gameState.gameActive = false;
        gameState.gameCount++;
        
        let message = '';
        let type = 'info';
        
        switch (result) {
            case 'player':
                gameState.player1Score++;
                const winnerName = gameState.isMultiplayer ? 'Player 1' : 'You';
                message = `🎉 Congratulations! ${winnerName} Wins! 🎉`;
                type = 'success';
                break;
            case 'bot':
                gameState.player2Score++;
                const loserName = gameState.isMultiplayer ? 'Player 2' : 'Bot';
                message = `😔 ${loserName} Wins! Better luck next time!`;
                type = 'error';
                break;
            case 'draw':
                message = '🤝 It\'s a Draw!';
                type = 'info';
                break;
        }
        
        Utils.showNotification(message, type);
        TicTacToe.updateScoreDisplay();
        
        setTimeout(() => {
            TicTacToe.showGameOverScreen(result);
        }, 2000);
    },
    
    showGameOverScreen: (result) => {
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="game-over-screen">
                <h2>Game Over!</h2>
                <div class="final-result">
                    ${result === 'player' ? '🎉 You Won! 🎉' : 
                      result === 'bot' ? '😔 Bot Won!' : 
                      '🤝 It\'s a Draw!'}
                </div>
                <div class="score-summary">
                    <div>${gameState.isMultiplayer ? 'Player 1' : 'Your'} Score: ${gameState.player1Score}</div>
                    <div>${gameState.isMultiplayer ? 'Player 2' : 'Bot'} Score: ${gameState.player2Score}</div>
                    <div>Games Played: ${gameState.gameCount}</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-primary" onclick="TicTacToe.init()">Play Again</button>
                    <button class="btn btn-secondary" onclick="GameManager.backToGames()">Back to Games</button>
                </div>
            </div>
        `;
    },
    
    checkWinner: () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c];
        });
    },
    
    checkDraw: () => {
        return gameState.board.every(cell => cell !== '');
    }
};

// Battleship Game - FIXED VERSION
const Battleship = {
    init: () => {
        gameState = {
            player1Board: Array(100).fill(''),
            player2Board: Array(100).fill(''),
            ships: [
                { name: 'Carrier', size: 5 },
                { name: 'Battleship', size: 4 },
                { name: 'Cruiser', size: 3 },
                { name: 'Submarine', size: 3 },
                { name: 'Destroyer', size: 2 }
            ],
            player1Ships: [
                { name: 'Carrier', size: 5, positions: [], sunk: false, placed: false },
                { name: 'Battleship', size: 4, positions: [], sunk: false, placed: false },
                { name: 'Cruiser', size: 3, positions: [], sunk: false, placed: false },
                { name: 'Submarine', size: 3, positions: [], sunk: false, placed: false },
                { name: 'Destroyer', size: 2, positions: [], sunk: false, placed: false }
            ],
            player2Ships: [
                { name: 'Carrier', size: 5, positions: [], sunk: false, placed: false },
                { name: 'Battleship', size: 4, positions: [], sunk: false, placed: false },
                { name: 'Cruiser', size: 3, positions: [], sunk: false, placed: false },
                { name: 'Submarine', size: 3, positions: [], sunk: false, placed: false },
                { name: 'Destroyer', size: 2, positions: [], sunk: false, placed: false }
            ],
            currentPlayer: 'player1',
            gamePhase: 'setup',
            currentShipIndex: 0,
            shipOrientation: 'horizontal',
            gameActive: true,
            player1Score: 0,
            player2Score: 0,
            gameCount: 0,
            isMultiplayer: gameState.isMultiplayer || false
        };
        
        Battleship.startSetup();
    },
    
    startSetup: () => {
        gameState.gamePhase = 'setup';
        gameState.currentPlayer = 'player1';
        gameState.currentShipIndex = 0;
        Battleship.showSetupScreen();
    },
    
    showSetupScreen: () => {
        const gameContainer = document.getElementById('gameContainer');
        const currentPlayerName = 'Player 1';
        const currentShip = gameState.player1Ships[gameState.currentShipIndex];
        
        gameContainer.innerHTML = `
            <div class="battleship-setup">
                <div class="setup-header">
                    <h3>🚢 ${currentPlayerName} - Place Your Ships</h3>
                    <p>Place your <strong>${currentShip.name}</strong> (${currentShip.size} cells)</p>
                </div>
                
                <div class="setup-controls">
                    <button onclick="Battleship.toggleOrientation()" class="btn btn-secondary">
                        ${gameState.shipOrientation === 'horizontal' ? '↔️ Horizontal' : '↕️ Vertical'}
                    </button>
                    <button onclick="Battleship.placeRandomly()" class="btn btn-info">🎲 Place Randomly</button>
                </div>
                
                <div class="setup-board">
                    <div class="board-grid setup-grid">
                        ${Array(100).fill().map((_, i) => 
                            `<div class="cell setup-cell" data-index="${i}"></div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="ships-progress">
                    ${gameState.player1Ships.map((ship, index) => 
                        `<span class="ship-status ${ship.placed ? 'placed' : (index === gameState.currentShipIndex ? 'current' : 'pending')}">
                            ${ship.name}
                        </span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        Battleship.attachSetupEvents();
        Battleship.updateSetupDisplay();
    },
    
    attachSetupEvents: () => {
        document.querySelectorAll('.setup-cell').forEach((cell, index) => {
            cell.addEventListener('click', () => Battleship.placeShipAt(index));
            cell.addEventListener('mouseenter', () => Battleship.showPreview(index));
            cell.addEventListener('mouseleave', () => Battleship.clearPreview());
        });
    },
    
    updateSetupDisplay: () => {
        const currentBoard = gameState.player1Board;
        
        document.querySelectorAll('.setup-cell').forEach((cell, index) => {
            if (currentBoard[index] === 'ship') {
                cell.style.background = '#007bff';
                cell.textContent = '🚢';
                cell.style.color = 'white';
            } else {
                cell.style.background = '';
                cell.textContent = '';
                cell.style.color = '';
            }
        });
    },
    
    toggleOrientation: () => {
        gameState.shipOrientation = gameState.shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        Battleship.showSetupScreen();
    },
    
    placeRandomly: () => {
        const currentBoard = gameState.player1Board;
        const currentShips = gameState.player1Ships;
        
        // Clear board
        currentBoard.fill('');
        currentShips.forEach(ship => {
            ship.positions = [];
            ship.placed = false;
        });
        
        // Place all ships randomly
        currentShips.forEach(ship => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const startPos = Math.floor(Math.random() * 100);
                const horizontal = Math.random() < 0.5;
                
                if (Battleship.canPlaceShip(currentBoard, startPos, ship.size, horizontal)) {
                    Battleship.placeShipOnBoard(currentBoard, startPos, ship.size, horizontal, ship);
                    ship.placed = true;
                    placed = true;
                }
                attempts++;
            }
        });
        
        Battleship.startGame();
    },
    
    showPreview: (index) => {
        Battleship.clearPreview();
        
        const currentShip = gameState.player1Ships[gameState.currentShipIndex];
        const currentBoard = gameState.player1Board;
        
        if (Battleship.canPlaceShip(currentBoard, index, currentShip.size, gameState.shipOrientation === 'horizontal')) {
            // Show green preview
            for (let i = 0; i < currentShip.size; i++) {
                const pos = gameState.shipOrientation === 'horizontal' ? index + i : index + i * 10;
                if (pos < 100) {
                    const cell = document.querySelector(`[data-index="${pos}"]`);
                    if (cell && currentBoard[pos] === '') {
                        cell.style.background = '#90EE90';
                        cell.style.opacity = '0.7';
                    }
                }
            }
        } else {
            // Show red preview for invalid placement
            for (let i = 0; i < currentShip.size; i++) {
                const pos = gameState.shipOrientation === 'horizontal' ? index + i : index + i * 10;
                if (pos < 100) {
                    const cell = document.querySelector(`[data-index="${pos}"]`);
                    if (cell) {
                        cell.style.background = '#ff6b6b';
                        cell.style.opacity = '0.7';
                    }
                }
            }
        }
    },
    
    clearPreview: () => {
        document.querySelectorAll('.setup-cell').forEach(cell => {
            if (cell.style.background === 'rgb(144, 238, 144)' || cell.style.background === 'rgb(255, 107, 107)') {
                cell.style.background = '';
                cell.style.opacity = '';
            }
        });
    },
    
    placeShipAt: (index) => {
        const currentShip = gameState.player1Ships[gameState.currentShipIndex];
        const currentBoard = gameState.player1Board;
        
        if (Battleship.canPlaceShip(currentBoard, index, currentShip.size, gameState.shipOrientation === 'horizontal')) {
            Battleship.placeShipOnBoard(currentBoard, index, currentShip.size, gameState.shipOrientation === 'horizontal', currentShip);
            currentShip.placed = true;
            
            // Move to next ship
            gameState.currentShipIndex++;
            
            if (gameState.currentShipIndex >= gameState.player1Ships.length) {
                // All ships placed
                Battleship.startGame();
            } else {
                // Show next ship placement
                Battleship.showSetupScreen();
            }
        } else {
            Utils.showNotification('Cannot place ship there!', 'warning');
        }
    },
    
    canPlaceShip: (board, startPos, size, horizontal) => {
        const row = Math.floor(startPos / 10);
        const col = startPos % 10;
        
        if (horizontal) {
            if (col + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (board[startPos + i] !== '') return false;
            }
        } else {
            if (row + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (board[startPos + i * 10] !== '') return false;
            }
        }
        return true;
    },
    
    placeShipOnBoard: (board, startPos, size, horizontal, ship) => {
        ship.positions = [];
        for (let i = 0; i < size; i++) {
            const pos = horizontal ? startPos + i : startPos + i * 10;
            board[pos] = 'ship';
            ship.positions.push(pos);
        }
    },
    
    startGame: () => {
        gameState.gamePhase = 'playing';
        gameState.currentPlayer = 'player1';
        
        // Auto-place Player 2's ships randomly
        Battleship.placeShips(gameState.player2Board, gameState.player2Ships);
        gameState.player2Ships.forEach(ship => ship.placed = true);
        
        Battleship.showGameBoard();
    },
    
    placeShips: (board, ships) => {
        board.fill('');
        
        ships.forEach(ship => {
            let placed = false;
            while (!placed) {
                const startPos = Math.floor(Math.random() * 100);
                const horizontal = Math.random() < 0.5;
                
                if (Battleship.canPlaceShip(board, startPos, ship.size, horizontal)) {
                    Battleship.placeShipOnBoard(board, startPos, ship.size, horizontal, ship);
                    placed = true;
                }
            }
        });
    },
    
    showGameBoard: () => {
        const gameContainer = document.getElementById('gameContainer');
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        const currentPlayerName = gameState.currentPlayer === 'player1' ? player1Name : player2Name;
        const opponentName = gameState.currentPlayer === 'player1' ? player2Name : player1Name;
        
        gameContainer.innerHTML = `
            <div class="battleship-game">
                <div class="game-header">
                    <h3>🎯 ${currentPlayerName}'s Turn</h3>
                    <p>Attack ${opponentName}'s fleet!</p>
                </div>
                
                <div class="game-boards">
                    <div class="board-section">
                        <h4>Your Fleet (${player1Name})</h4>
                        <div class="board-grid your-fleet">
                            ${Array(100).fill().map((_, i) => 
                                `<div class="cell fleet-cell" data-index="${i}" data-board="fleet"></div>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="board-section">
                        <h4>Attack Grid (${player2Name})</h4>
                        <div class="board-grid attack-grid">
                            ${Array(100).fill().map((_, i) => 
                                `<div class="cell attack-cell" data-index="${i}" data-board="attack"></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        Battleship.attachGameEvents();
        Battleship.updateGameDisplay();
        Battleship.updateScoreDisplay();
    },
    
    attachGameEvents: () => {
        document.querySelectorAll('.attack-cell').forEach((cell, index) => {
            cell.addEventListener('click', () => Battleship.attackPosition(index));
        });
    },
    
    updateGameDisplay: () => {
        // Always show Player 1's fleet (your ships + hits/misses on your ships)
        document.querySelectorAll('.fleet-cell').forEach((cell, index) => {
            if (gameState.player1Board[index] === 'ship') {
                cell.style.background = '#007bff';
                cell.textContent = '🚢';
                cell.style.color = 'white';
            } else if (gameState.player1Board[index] === 'hit') {
                cell.style.background = '#dc3545';
                cell.textContent = '💥';
            } else if (gameState.player1Board[index] === 'miss') {
                cell.style.background = '#6c757d';
                cell.textContent = '💧';
            } else {
                cell.style.background = '';
                cell.textContent = '';
                cell.style.color = '';
            }
        });
        
        // Show attack grid (ONLY hits and misses on Player 2's ships - ships completely hidden)
        document.querySelectorAll('.attack-cell').forEach((cell, index) => {
            if (gameState.player2Board[index] === 'hit') {
                cell.style.background = '#dc3545';
                cell.textContent = '💥';
            } else if (gameState.player2Board[index] === 'miss') {
                cell.style.background = '#6c757d';
                cell.textContent = '💧';
            } else {
                // Empty cell - no ship visible
                cell.style.background = '';
                cell.textContent = '';
            }
        });
    },
    
    attackPosition: (index) => {
        const opponentBoard = gameState.currentPlayer === 'player1' ? gameState.player2Board : gameState.player1Board;
        const opponentShips = gameState.currentPlayer === 'player1' ? gameState.player2Ships : gameState.player1Ships;
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        const currentPlayerName = gameState.currentPlayer === 'player1' ? player1Name : player2Name;
        
        // Check if already attacked
        if (opponentBoard[index] === 'hit' || opponentBoard[index] === 'miss') {
            Utils.showNotification('Already attacked this position!', 'warning');
            return;
        }
        
        const cell = document.querySelector(`[data-index="${index}"][data-board="attack"]`);
        
        if (opponentBoard[index] === 'ship') {
            // Hit!
            opponentBoard[index] = 'hit';
            cell.style.background = '#dc3545';
            cell.textContent = '💥';
            cell.style.animation = 'explosion 0.5s ease-in-out';
            
            // Check if ship is sunk
            const sunkShip = opponentShips.find(ship => 
                ship.positions.includes(index) && 
                ship.positions.every(pos => opponentBoard[pos] === 'hit')
            );
            
            if (sunkShip) {
                sunkShip.sunk = true;
                Utils.showNotification(`🎯 ${sunkShip.name} sunk by ${currentPlayerName}!`, 'success');
            } else {
                Utils.showNotification(`🎯 Hit by ${currentPlayerName}!`, 'success');
            }
            
            // Check win condition
            if (opponentShips.every(ship => ship.sunk)) {
                Battleship.endGame(gameState.currentPlayer);
                return;
            }
            
            // If hit, same player gets another turn
            Battleship.updateScoreDisplay();
            return;
        } else {
            // Miss
            opponentBoard[index] = 'miss';
            cell.style.background = '#6c757d';
            cell.textContent = '💧';
            cell.style.animation = 'splash 0.5s ease-in-out';
            Utils.showNotification(`💧 Miss by ${currentPlayerName}!`, 'info');
        }
        
        // Only switch turns on a miss
        gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
        
        // Update display and handle bot turn
        setTimeout(() => {
            Battleship.updateGameDisplay();
            Battleship.updateScoreDisplay();
            
            // If it's now the bot's turn (and not multiplayer), make bot move
            if (!gameState.isMultiplayer && gameState.currentPlayer === 'player2') {
                setTimeout(() => {
                    Battleship.botMove();
                }, 1000);
            }
        }, 1500);
    },
    
    botMove: () => {
        if (!gameState.gameActive || gameState.currentPlayer !== 'player2') return;
        
        // Find an empty cell to attack
        const player1Board = gameState.player1Board;
        const emptyCells = [];
        
        for (let i = 0; i < 100; i++) {
            if (player1Board[i] !== 'hit' && player1Board[i] !== 'miss') {
                emptyCells.push(i);
            }
        }
        
        if (emptyCells.length > 0) {
            const attackIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            Battleship.botAttackPosition(attackIndex);
        }
    },
    
    botAttackPosition: (index) => {
        const player1Board = gameState.player1Board;
        const player1Ships = gameState.player1Ships;
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        
        const cell = document.querySelector(`[data-index="${index}"][data-board="fleet"]`);
        
        if (player1Board[index] === 'ship') {
            // Bot hit!
            player1Board[index] = 'hit';
            cell.style.background = '#dc3545';
            cell.textContent = '💥';
            cell.style.animation = 'explosion 0.5s ease-in-out';
            
            // Check if ship is sunk
            const sunkShip = player1Ships.find(ship => 
                ship.positions.includes(index) && 
                ship.positions.every(pos => player1Board[pos] === 'hit')
            );
            
            if (sunkShip) {
                sunkShip.sunk = true;
                Utils.showNotification(`🎯 ${sunkShip.name} sunk by ${player2Name}!`, 'error');
            } else {
                Utils.showNotification(`🎯 Hit by ${player2Name}!`, 'error');
            }
            
            // Check win condition
            if (player1Ships.every(ship => ship.sunk)) {
                Battleship.endGame('player2');
                return;
            }
            
            // If hit, bot gets another turn
            Battleship.updateScoreDisplay();
            setTimeout(() => {
                Battleship.botMove();
            }, 1000);
            return;
        } else {
            // Bot miss
            player1Board[index] = 'miss';
            cell.style.background = '#6c757d';
            cell.textContent = '💧';
            cell.style.animation = 'splash 0.5s ease-in-out';
            Utils.showNotification(`💧 Miss by ${player2Name}!`, 'info');
        }
        
        // Switch back to player 1
        gameState.currentPlayer = 'player1';
        
        // Update display
        setTimeout(() => {
            Battleship.updateGameDisplay();
            Battleship.updateScoreDisplay();
        }, 1500);
    },
    
    endGame: (winner) => {
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        const winnerName = winner === 'player1' ? player1Name : player2Name;
        const loserName = winner === 'player1' ? player2Name : player1Name;
        
        // Update scores
        if (winner === 'player1') {
            gameState.player1Score++;
        } else {
            gameState.player2Score++;
        }
        gameState.gameCount++;
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="game-over-screen">
                <div class="final-result">
                    <h2>🎉 ${winnerName} Wins! 🎉</h2>
                    <p>${winnerName} destroyed ${loserName}'s entire fleet!</p>
                </div>
                
                <div class="score-summary">
                    <div class="score-item">
                        <span class="player-label">${player1Name}:</span>
                        <span class="score ${winner === 'player1' ? 'winner' : ''}">${gameState.player1Score}</span>
                    </div>
                    <div class="score-item">
                        <span class="player-label">${player2Name}:</span>
                        <span class="score ${winner === 'player2' ? 'winner' : ''}">${gameState.player2Score}</span>
                    </div>
                </div>
                
                <div class="game-actions">
                    <button onclick="Battleship.init()" class="btn btn-primary">🔄 Play Again</button>
                    <button onclick="GameManager.backToGames()" class="btn btn-secondary">🏠 Back to Games</button>
                </div>
            </div>
        `;
        
        Battleship.updateScoreDisplay();
    },
    
    updateScoreDisplay: () => {
        const gameStatus = document.getElementById('gameStatus');
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        const currentPlayerName = gameState.currentPlayer === 'player1' ? player1Name : player2Name;
        const player1ShipsRemaining = gameState.player1Ships.filter(ship => !ship.sunk).length;
        const player2ShipsRemaining = gameState.player2Ships.filter(ship => !ship.sunk).length;
        
        if (gameState.gamePhase === 'setup') {
            gameStatus.innerHTML = `
                <div class="score-display">
                    <div class="score-item">
                        <span class="player-label">Setup Phase:</span>
                        <span class="score">${player1Name} placing ships</span>
                    </div>
                </div>
            `;
        } else {
            gameStatus.innerHTML = `
                <div class="score-display">
                    <div class="score-item">
                        <span class="player-label">${player1Name} Ships:</span>
                        <span class="score">${player1ShipsRemaining}</span>
                    </div>
                    <div class="score-item">
                        <span class="player-label">${player2Name} Ships:</span>
                        <span class="score">${player2ShipsRemaining}</span>
                    </div>
                    <div class="score-item">
                        <span class="player-label">Current Turn:</span>
                        <span class="score">${currentPlayerName}</span>
                    </div>
                </div>
                <div class="current-player">🎯 ${currentPlayerName}'s Turn - Click on the attack grid to fire!</div>
            `;
        }
    }
};

// Simple War placeholder
// Connect 4 Game
const Connect4 = {
    init: () => {
        gameState = {
            board: Array(42).fill(''),
            currentPlayer: 'player1',
            gamePhase: 'playing',
            player1Score: 0,
            player2Score: 0,
            gameCount: 0,
            isMultiplayer: false
        };
        
        Connect4.showGameModeSelection();
    },
    
    showGameModeSelection: () => {
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="game-mode-selection">
                <h2>Connect 4</h2>
                <p>Choose your game mode:</p>
                <div class="mode-buttons">
                    <button onclick="Connect4.startMultiplayer()" class="btn btn-primary">PvP (Wait for Player)</button>
                    <button onclick="Connect4.startBotGame()" class="btn btn-secondary">Play vs Bot</button>
                </div>
                <button onclick="GameManager.backToGames()" class="btn btn-outline">Back to Games</button>
            </div>
        `;
    },
    
    startMultiplayer: () => {
        const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="waiting-room">
                <h3>Waiting for Player...</h3>
                <div class="room-code">Room Code: ${roomCode}</div>
                <div class="waiting-text">Share this code with a friend!</div>
                <div class="countdown">Auto-starting with bot in: <span id="countdown">30</span>s</div>
                <button onclick="GameManager.backToGames()" class="btn btn-secondary">Cancel</button>
            </div>
        `;
        
        let timeLeft = 30;
        const countdown = setInterval(() => {
            timeLeft--;
            document.getElementById('countdown').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                Connect4.startBotGame();
            }
        }, 1000);
        
        // Simulate player joining after 15 seconds
        setTimeout(() => {
            if (timeLeft > 0) {
                clearInterval(countdown);
                Connect4.playerJoined();
            }
        }, 15000);
    },
    
    playerJoined: () => {
        gameState.isMultiplayer = true;
        Connect4.loadGame();
    },
    
    startBotGame: () => {
        gameState.isMultiplayer = false;
        Connect4.loadGame();
    },
    
    loadGame: () => {
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="connect4-game">
                <div class="game-header">
                    <h3>Connect 4</h3>
                    <div id="gameStatus" class="game-status"></div>
                </div>
                <div class="connect4-board">
                    <div class="board-grid" id="connect4Board"></div>
                </div>
                <div class="game-controls">
                    <button onclick="Connect4.init()" class="btn btn-primary">New Game</button>
                    <button onclick="GameManager.backToGames()" class="btn btn-secondary">Back to Games</button>
                </div>
            </div>
        `;
        
        Connect4.createBoard();
        Connect4.updateScoreDisplay();
    },
    
    createBoard: () => {
        const board = document.getElementById('connect4Board');
        board.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.className = 'connect4-cell';
                cell.dataset.index = row * 7 + col;
                cell.addEventListener('click', () => Connect4.handleCellClick(row * 7 + col));
                board.appendChild(cell);
            }
        }
    },
    
    handleCellClick: (index) => {
        if (gameState.gamePhase !== 'playing' || gameState.currentPlayer !== 'player1') return;
        
        const col = index % 7;
        const row = Connect4.getLowestEmptyRow(col);
        if (row === -1) return; // Column is full
        
        const cellIndex = row * 7 + col;
        gameState.board[cellIndex] = 'player1';
        
        Connect4.updateDisplay();
        
        if (Connect4.checkWinner()) {
            Connect4.endGame('player1');
            return;
        }
        
        if (Connect4.checkDraw()) {
            Connect4.endGame('draw');
            return;
        }
        
        gameState.currentPlayer = 'player2';
        Connect4.updateScoreDisplay();
        
        if (!gameState.isMultiplayer) {
            setTimeout(() => Connect4.botMove(), 1000);
        }
    },
    
    getLowestEmptyRow: (col) => {
        for (let row = 5; row >= 0; row--) {
            if (gameState.board[row * 7 + col] === '') {
                return row;
            }
        }
        return -1;
    },
    
    botMove: () => {
        if (gameState.gamePhase !== 'playing' || gameState.currentPlayer !== 'player2') return;
        
        // Simple bot logic - try to win, then block, then random
        let move = Connect4.getBestMove();
        if (move === -1) {
            // Random move
            const availableCols = [];
            for (let col = 0; col < 7; col++) {
                if (Connect4.getLowestEmptyRow(col) !== -1) {
                    availableCols.push(col);
                }
            }
            move = availableCols[Math.floor(Math.random() * availableCols.length)];
        }
        
        const row = Connect4.getLowestEmptyRow(move);
        const cellIndex = row * 7 + move;
        gameState.board[cellIndex] = 'player2';
        
        Connect4.updateDisplay();
        
        if (Connect4.checkWinner()) {
            Connect4.endGame('player2');
            return;
        }
        
        if (Connect4.checkDraw()) {
            Connect4.endGame('draw');
            return;
        }
        
        gameState.currentPlayer = 'player1';
        Connect4.updateScoreDisplay();
    },
    
    getBestMove: () => {
        // Check for winning move
        for (let col = 0; col < 7; col++) {
            const row = Connect4.getLowestEmptyRow(col);
            if (row !== -1) {
                const cellIndex = row * 7 + col;
                gameState.board[cellIndex] = 'player2';
                if (Connect4.checkWinner()) {
                    gameState.board[cellIndex] = '';
                    return col;
                }
                gameState.board[cellIndex] = '';
            }
        }
        
        // Check for blocking move
        for (let col = 0; col < 7; col++) {
            const row = Connect4.getLowestEmptyRow(col);
            if (row !== -1) {
                const cellIndex = row * 7 + col;
                gameState.board[cellIndex] = 'player1';
                if (Connect4.checkWinner()) {
                    gameState.board[cellIndex] = '';
                    return col;
                }
                gameState.board[cellIndex] = '';
            }
        }
        
        return -1;
    },
    
    updateDisplay: () => {
        document.querySelectorAll('.connect4-cell').forEach((cell, index) => {
            if (gameState.board[index] === 'player1') {
                cell.style.background = '#007bff';
                cell.textContent = '🔴';
            } else if (gameState.board[index] === 'player2') {
                cell.style.background = '#ffc107';
                cell.textContent = '🟡';
            } else {
                cell.style.background = '';
                cell.textContent = '';
            }
        });
    },
    
    checkWinner: () => {
        const directions = [
            { dr: 0, dc: 1 }, // Horizontal
            { dr: 1, dc: 0 }, // Vertical
            { dr: 1, dc: 1 }, // Diagonal \
            { dr: 1, dc: -1 } // Diagonal /
        ];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cellIndex = row * 7 + col;
                const player = gameState.board[cellIndex];
                if (player === '') continue;
                
                for (const dir of directions) {
                    let count = 1;
                    for (let i = 1; i < 4; i++) {
                        const newRow = row + dir.dr * i;
                        const newCol = col + dir.dc * i;
                        if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7) break;
                        const newIndex = newRow * 7 + newCol;
                        if (gameState.board[newIndex] === player) {
                            count++;
                        } else {
                            break;
                        }
                    }
                    if (count >= 4) return true;
                }
            }
        }
        return false;
    },
    
    checkDraw: () => {
        return gameState.board.every(cell => cell !== '');
    },
    
    endGame: (winner) => {
        gameState.gamePhase = 'ended';
        
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        
        if (winner === 'player1') {
            gameState.player1Score++;
        } else if (winner === 'player2') {
            gameState.player2Score++;
        }
        gameState.gameCount++;
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="game-over-screen">
                <div class="final-result">
                    <h2>${winner === 'player1' ? '🎉 ' + player1Name + ' Wins! 🎉' : 
                          winner === 'player2' ? '🎉 ' + player2Name + ' Wins! 🎉' : 
                          '🤝 It\'s a Draw!'}</h2>
                </div>
                <div class="score-summary">
                    <div class="score-item">
                        <span class="player-label">${player1Name}:</span>
                        <span class="score ${winner === 'player1' ? 'winner' : ''}">${gameState.player1Score}</span>
                    </div>
                    <div class="score-item">
                        <span class="player-label">${player2Name}:</span>
                        <span class="score ${winner === 'player2' ? 'winner' : ''}">${gameState.player2Score}</span>
                    </div>
                </div>
                <div class="game-actions">
                    <button onclick="Connect4.init()" class="btn btn-primary">🔄 Play Again</button>
                    <button onclick="GameManager.backToGames()" class="btn btn-secondary">🏠 Back to Games</button>
                </div>
            </div>
        `;
    },
    
    updateScoreDisplay: () => {
        const gameStatus = document.getElementById('gameStatus');
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        const currentPlayerName = gameState.currentPlayer === 'player1' ? player1Name : player2Name;
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">${player1Name}:</span>
                    <span class="score">${gameState.player1Score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">${player2Name}:</span>
                    <span class="score">${gameState.player2Score}</span>
                </div>
                <div class="current-player">Current Turn: ${currentPlayerName}</div>
            </div>
        `;
    }
};

// War Card Game
const War = {
    init: () => {
        gameState = {
            player1Cards: [],
            player2Cards: [],
            currentPlayer: 'player1',
            gamePhase: 'playing',
            player1Score: 0,
            player2Score: 0,
            gameCount: 0,
            isMultiplayer: false,
            warCards: [],
            gameDeck: []
        };
        
        War.showGameModeSelection();
    },
    
    showGameModeSelection: () => {
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="game-mode-selection">
                <h2>War Card Game</h2>
                <p>Choose your game mode:</p>
                <div class="mode-buttons">
                    <button onclick="War.startMultiplayer()" class="btn btn-primary">PvP (Wait for Player)</button>
                    <button onclick="War.startBotGame()" class="btn btn-secondary">Play vs Bot</button>
                </div>
                <button onclick="GameManager.backToGames()" class="btn btn-outline">Back to Games</button>
            </div>
        `;
    },
    
    startMultiplayer: () => {
        const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="waiting-room">
                <h3>Waiting for Player...</h3>
                <div class="room-code">Room Code: ${roomCode}</div>
                <div class="waiting-text">Share this code with a friend!</div>
                <div class="countdown">Auto-starting with bot in: <span id="countdown">30</span>s</div>
                <button onclick="GameManager.backToGames()" class="btn btn-secondary">Cancel</button>
            </div>
        `;
        
        let timeLeft = 30;
        const countdown = setInterval(() => {
            timeLeft--;
            document.getElementById('countdown').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                War.startBotGame();
            }
        }, 1000);
        
        // Simulate player joining after 15 seconds
        setTimeout(() => {
            if (timeLeft > 0) {
                clearInterval(countdown);
                War.playerJoined();
            }
        }, 15000);
    },
    
    playerJoined: () => {
        gameState.isMultiplayer = true;
        War.loadGame();
    },
    
    startBotGame: () => {
        gameState.isMultiplayer = false;
        War.loadGame();
    },
    
    loadGame: () => {
        War.createDeck();
        War.dealCards();
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="war-game">
                <div class="game-header">
                    <h3>War Card Game</h3>
                    <div id="gameStatus" class="game-status"></div>
                </div>
                <div class="war-game-area">
                    <div class="player-cards">
                        <div class="card-label">${gameState.isMultiplayer ? 'Player 1' : 'Your'} Cards</div>
                        <div class="card-count" id="player1CardCount">${gameState.player1Cards.length}</div>
                    </div>
                    <div class="battle-area">
                        <div class="battle-display" id="battleDisplay">
                            <div class="ready-display">
                                <div class="ready-text">Ready to Battle!</div>
                                <div class="ready-emoji">⚔️</div>
                            </div>
                        </div>
                    </div>
                    <div class="opponent-cards">
                        <div class="card-label">${gameState.isMultiplayer ? 'Player 2' : 'Bot'} Cards</div>
                        <div class="card-count" id="player2CardCount">${gameState.player2Cards.length}</div>
                    </div>
                </div>
                <div class="game-controls">
                    <button onclick="War.playCard()" class="btn btn-primary">Play Card</button>
                    <button onclick="War.init()" class="btn btn-secondary">New Game</button>
                    <button onclick="GameManager.backToGames()" class="btn btn-outline">Back to Games</button>
                </div>
            </div>
        `;
        
        War.updateScoreDisplay();
    },
    
    createDeck: () => {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        gameState.gameDeck = [];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                gameState.gameDeck.push({ suit, rank, value: War.getCardValue(rank) });
            }
        }
        
        // Shuffle deck
        for (let i = gameState.gameDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameState.gameDeck[i], gameState.gameDeck[j]] = [gameState.gameDeck[j], gameState.gameDeck[i]];
        }
    },
    
    getCardValue: (rank) => {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        return parseInt(rank);
    },
    
    dealCards: () => {
        gameState.player1Cards = [];
        gameState.player2Cards = [];
        
        for (let i = 0; i < gameState.gameDeck.length; i++) {
            if (i % 2 === 0) {
                gameState.player1Cards.push(gameState.gameDeck[i]);
            } else {
                gameState.player2Cards.push(gameState.gameDeck[i]);
            }
        }
    },
    
    playCard: () => {
        if (gameState.player1Cards.length === 0 || gameState.player2Cards.length === 0) {
            War.endGame();
            return;
        }
        
        const player1Card = gameState.player1Cards.shift();
        const player2Card = gameState.player2Cards.shift();
        
        const battleDisplay = document.getElementById('battleDisplay');
        battleDisplay.innerHTML = `
            <div class="battle-cards">
                <div class="battle-card player-card">
                    <div class="card-rank">${player1Card.rank}</div>
                    <div class="card-suit">${player1Card.suit}</div>
                </div>
                <div class="vs">VS</div>
                <div class="battle-card opponent-card">
                    <div class="card-rank">${player2Card.rank}</div>
                    <div class="card-suit">${player2Card.suit}</div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            if (player1Card.value > player2Card.value) {
                // Player 1 wins
                gameState.player1Cards.push(player1Card, player2Card);
                battleDisplay.innerHTML += `
                    <div class="war-display">
                        <div class="war-title">${gameState.isMultiplayer ? 'Player 1' : 'You'} Win!</div>
                        <div class="war-info">You captured both cards!</div>
                    </div>
                `;
            } else if (player2Card.value > player1Card.value) {
                // Player 2 wins
                gameState.player2Cards.push(player1Card, player2Card);
                battleDisplay.innerHTML += `
                    <div class="war-display">
                        <div class="war-title">${gameState.isMultiplayer ? 'Player 2' : 'Bot'} Wins!</div>
                        <div class="war-info">They captured both cards!</div>
                    </div>
                `;
            } else {
                // War!
                War.handleWar([player1Card, player2Card]);
                return;
            }
            
            War.updateCardCounts();
            
            setTimeout(() => {
                if (gameState.player1Cards.length === 0 || gameState.player2Cards.length === 0) {
                    War.endGame();
                } else {
                    War.resetBattleDisplay();
                }
            }, 2000);
        }, 1000);
    },
    
    handleWar: (warCards) => {
        if (gameState.player1Cards.length < 3 || gameState.player2Cards.length < 3) {
            // Not enough cards for war
            const battleDisplay = document.getElementById('battleDisplay');
            battleDisplay.innerHTML += `
                <div class="war-display">
                    <div class="war-title">War!</div>
                    <div class="war-info">Not enough cards for war. Game continues...</div>
                </div>
            `;
            return;
        }
        
        const player1WarCards = gameState.player1Cards.splice(0, 3);
        const player2WarCards = gameState.player2Cards.splice(0, 3);
        
        const battleDisplay = document.getElementById('battleDisplay');
        battleDisplay.innerHTML += `
            <div class="war-display">
                <div class="war-title">WAR!</div>
                <div class="war-cards">
                    <div class="war-card">${player1WarCards[2].rank}${player1WarCards[2].suit}</div>
                    <div class="vs">VS</div>
                    <div class="war-card">${player2WarCards[2].rank}${player2WarCards[2].suit}</div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const player1WarCard = player1WarCards[2];
            const player2WarCard = player2WarCards[2];
            
            if (player1WarCard.value > player2WarCard.value) {
                // Player 1 wins war
                gameState.player1Cards.push(...warCards, ...player1WarCards, ...player2WarCards);
                battleDisplay.innerHTML += `
                    <div class="war-info">${gameState.isMultiplayer ? 'Player 1' : 'You'} wins the war!</div>
                `;
            } else if (player2WarCard.value > player1WarCard.value) {
                // Player 2 wins war
                gameState.player2Cards.push(...warCards, ...player1WarCards, ...player2WarCards);
                battleDisplay.innerHTML += `
                    <div class="war-info">${gameState.isMultiplayer ? 'Player 2' : 'Bot'} wins the war!</div>
                `;
            } else {
                // Another war
                War.handleWar([...warCards, ...player1WarCards, ...player2WarCards]);
                return;
            }
            
            War.updateCardCounts();
            
            setTimeout(() => {
                if (gameState.player1Cards.length === 0 || gameState.player2Cards.length === 0) {
                    War.endGame();
                } else {
                    War.resetBattleDisplay();
                }
            }, 2000);
        }, 1000);
    },
    
    updateCardCounts: () => {
        document.getElementById('player1CardCount').textContent = gameState.player1Cards.length;
        document.getElementById('player2CardCount').textContent = gameState.player2Cards.length;
    },
    
    resetBattleDisplay: () => {
        const battleDisplay = document.getElementById('battleDisplay');
        battleDisplay.innerHTML = `
            <div class="ready-display">
                <div class="ready-text">Ready for Next Battle!</div>
                <div class="ready-emoji">⚔️</div>
            </div>
        `;
    },
    
    endGame: () => {
        const winner = gameState.player1Cards.length > gameState.player2Cards.length ? 'player1' : 'player2';
        
        if (winner === 'player1') {
            gameState.player1Score++;
        } else {
            gameState.player2Score++;
        }
        gameState.gameCount++;
        
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        const winnerName = winner === 'player1' ? player1Name : player2Name;
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="game-over-screen">
                <div class="final-result">
                    <h2>🎉 ${winnerName} Wins! 🎉</h2>
                    <p>${winnerName} captured all the cards!</p>
                </div>
                <div class="score-summary">
                    <div class="score-item">
                        <span class="player-label">${player1Name}:</span>
                        <span class="score ${winner === 'player1' ? 'winner' : ''}">${gameState.player1Score}</span>
                    </div>
                    <div class="score-item">
                        <span class="player-label">${player2Name}:</span>
                        <span class="score ${winner === 'player2' ? 'winner' : ''}">${gameState.player2Score}</span>
                    </div>
                </div>
                <div class="game-actions">
                    <button onclick="War.init()" class="btn btn-primary">🔄 Play Again</button>
                    <button onclick="GameManager.backToGames()" class="btn btn-secondary">🏠 Back to Games</button>
                </div>
            </div>
        `;
    },
    
    updateScoreDisplay: () => {
        const gameStatus = document.getElementById('gameStatus');
        const player1Name = gameState.isMultiplayer ? 'Player 1' : 'You';
        const player2Name = gameState.isMultiplayer ? 'Player 2' : 'Bot';
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">${player1Name}:</span>
                    <span class="score">${gameState.player1Score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">${player2Name}:</span>
                    <span class="score">${gameState.player2Score}</span>
                </div>
            </div>
        `;
    }
};

// Admin Management
const AdminManager = {
    init: () => {
        // Admin keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                AdminManager.showLogin();
            }
        });
        
        // Admin login form
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                AdminManager.handleLogin();
            });
        }

        // Admin buttons (delegated post-login)
        document.addEventListener('click', (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            if (t.id === 'manageAdsBtn') AdminManager.showManageAds();
            if (t.id === 'headerCodesBtn') AdminManager.showHeaderCodes();
            if (t.id === 'siteConfigBtn') AdminManager.showSiteConfig();
            if (t.id === 'userMgmtBtn') AdminManager.showUserMgmt();
        });
    },
    
    showLogin: () => {
        document.getElementById('adminLoginModal').style.display = 'block';
    },
    
    hideLoginModal: () => {
        document.getElementById('adminLoginModal').style.display = 'none';
    },
    
    handleLogin: () => {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === ADMIN_ACCESS.u && password === ADMIN_ACCESS.p) {
            isAdmin = true;
            AdminManager.hideLoginModal();
            document.getElementById('adminBackofficeModal').style.display = 'block';
            Utils.showNotification('Access granted!', 'success');
            AdminManager.refreshStats();
            // Auto-refresh stats every 30s while open
            if (AdminManager._statsInterval) clearInterval(AdminManager._statsInterval);
            AdminManager._statsInterval = setInterval(() => {
                const modal = document.getElementById('adminBackofficeModal');
                if (modal && modal.style.display === 'block') {
                    AdminManager.refreshStats();
                } else {
                    clearInterval(AdminManager._statsInterval);
                    AdminManager._statsInterval = null;
                }
            }, 30000);
        } else {
            Utils.showNotification('Invalid credentials!', 'error');
        }
    },
    
    hideBackofficeModal: () => {
        document.getElementById('adminBackofficeModal').style.display = 'none';
    }
};

// Ad impression tracking
const AdStats = {
    trackImpression: (slot) => Metrics.addEvent('ad_impression', { slot }),
    initImpressions: () => {
        ['top','left','right','bottom'].forEach(slot => {
            // Fire once per load
            AdStats.trackImpression(slot);
        });
    }
};

// Admin stats rendering
AdminManager.refreshStats = () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const m3 = 90 * dayMs;
    const m6 = 180 * dayMs;
    const y1 = 365 * dayMs;
    const get = (id) => document.getElementById(id);
    const set = (id, val) => { const el = get(id); if (el) el.textContent = String(val); };
    
    // Games
    const games24 = Metrics.countEvents('game_start', now - dayMs);
    const gamesAll = Metrics.countEvents('game_start', 0);
    set('statGames24h', games24);
    set('statGamesAll', gamesAll);
    
    // Ads
    const ads24 = Metrics.countEvents('ad_impression', now - dayMs);
    const adsAll = Metrics.countEvents('ad_impression', 0);
    set('statAds24h', ads24);
    set('statAdsAll', adsAll);
    
    // Unique visitors via visit events
    const uv24 = Metrics.uniqueVisitorsSince(now - dayMs);
    const uv3m = Metrics.uniqueVisitorsSince(now - m3);
    const uv6m = Metrics.uniqueVisitorsSince(now - m6);
    const uv1y = Metrics.uniqueVisitorsSince(now - y1);
    set('statUV24h', uv24);
    set('statUV3m', uv3m);
    set('statUV6m', uv6m);
    set('statUV1y', uv1y);
};

// Simple Ad manager storing raw code per slot in localStorage
const AdManager = {
    KEY: 'rcb_ads',
    load: () => {
        try { return JSON.parse(localStorage.getItem(AdManager.KEY) || '{}'); } catch { return {}; }
    },
    save: (data) => localStorage.setItem(AdManager.KEY, JSON.stringify(data)),
    renderSlots: () => {
        const ads = AdManager.load();
        const map = {
            top: document.querySelector('.top-ad .ad-placeholder'),
            left: document.querySelector('.left-sidebar .ad-placeholder'),
            right: document.querySelector('.right-sidebar .ad-placeholder'),
            bottom: document.querySelector('.bottom-ad .ad-placeholder')
        };
        Object.entries(map).forEach(([slot, el]) => {
            if (!el) return;
            if (ads[slot]) {
                el.innerHTML = ads[slot];
            }
        });
    }
};

AdminManager.showManageAds = () => {
    const container = document.getElementById('adminDynamic');
    if (!container) return;
    container.style.display = 'block';
    const ads = AdManager.load();
    container.innerHTML = `
        <h3>Manage Ad Slots</h3>
        <p>Paste ad code for each slot. It will render immediately in the UI.</p>
        <form id="adsForm" class="form">
            <div class="form-group"><label>Top Banner</label><textarea id="ad_top" rows="4" style="width:100%">${ads.top || ''}</textarea></div>
            <div class="form-group"><label>Left Sidebar</label><textarea id="ad_left" rows="4" style="width:100%">${ads.left || ''}</textarea></div>
            <div class="form-group"><label>Right Sidebar</label><textarea id="ad_right" rows="4" style="width:100%">${ads.right || ''}</textarea></div>
            <div class="form-group"><label>Bottom Banner</label><textarea id="ad_bottom" rows="4" style="width:100%">${ads.bottom || ''}</textarea></div>
            <button type="submit" class="btn btn-primary">Save Ads</button>
        </form>
    `;
    const form = document.getElementById('adsForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                top: document.getElementById('ad_top').value,
                left: document.getElementById('ad_left').value,
                right: document.getElementById('ad_right').value,
                bottom: document.getElementById('ad_bottom').value
            };
            AdManager.save(data);
            AdManager.renderSlots();
            Utils.showNotification('Ads saved and rendered.', 'success');
        });
    }
};

AdminManager.showHeaderCodes = () => {
    const container = document.getElementById('adminDynamic');
    if (!container) return;
    container.style.display = 'block';
    const key = 'rcb_header_codes';
    let saved = '';
    try { saved = localStorage.getItem(key) || ''; } catch { saved = ''; }
    container.innerHTML = `
        <h3>Header Verification Codes</h3>
        <p>Paste verification meta tags or scripts required by ad networks (AdSense, Adsterra, Monetag, etc.). These will be injected into the page <head> on load to verify ownership.</p>
        <form id="headerCodesForm">
            <div class="form-group">
                <label for="headerCodes">Head Snippets</label>
                <textarea id="headerCodes" rows="8" style="width:100%">${saved}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Save & Inject</button>
        </form>
    `;
    const form = document.getElementById('headerCodesForm');
    if (form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        const txt = document.getElementById('headerCodes').value;
        localStorage.setItem(key, txt);
        AdminManager.injectHeaderCodes();
        Utils.showNotification('Header codes saved and injected.', 'success');
    });
};

AdminManager.injectHeaderCodes = () => {
    const key = 'rcb_header_codes';
    let txt = '';
    try { txt = localStorage.getItem(key) || ''; } catch { txt = ''; }
    if (!txt) return;
    // Remove previous injection container if exists
    let holder = document.getElementById('rcb-header-inject');
    if (holder) holder.remove();
    holder = document.createElement('div');
    holder.id = 'rcb-header-inject';
    holder.style.display = 'none';
    holder.innerHTML = txt;
    document.head.appendChild(holder);
};

AdminManager.showSiteConfig = () => {
    const container = document.getElementById('adminDynamic');
    if (!container) return;
    container.style.display = 'block';
    container.innerHTML = `
        <h3>Site Configuration</h3>
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
            <span>Theme:</span>
            <button id="themeLight" class="btn btn-outline">Light</button>
            <button id="themeDark" class="btn btn-outline">Dark</button>
        </div>
        <button id="resetLocalBtn" class="btn btn-warning">Reset Local Data</button>
    `;
    const themeLight = document.getElementById('themeLight');
    const themeDark = document.getElementById('themeDark');
    const resetBtn = document.getElementById('resetLocalBtn');
    if (themeLight) themeLight.addEventListener('click', () => { localStorage.setItem(CONFIG.THEME_KEY, 'light'); UIManager.applyTheme(); });
    if (themeDark) themeDark.addEventListener('click', () => { localStorage.setItem(CONFIG.THEME_KEY, 'dark'); UIManager.applyTheme(); });
    if (resetBtn) resetBtn.addEventListener('click', () => { localStorage.clear(); Utils.showNotification('Local data cleared. Reloading...', 'warning'); setTimeout(()=>location.reload(), 600); });
};

AdminManager.showUserMgmt = () => {
    const container = document.getElementById('adminDynamic');
    if (!container) return;
    container.style.display = 'block';
    const name = NameManager.getName();
    container.innerHTML = `
        <h3>User Management</h3>
        <p>Current device display name: <strong>${name || '(none)'}</strong></p>
        <div class="form-group">
            <label for="newName">Change Display Name</label>
            <input id="newName" type="text" maxlength="20" value="${name || ''}" />
        </div>
        <button id="saveNameBtn" class="btn btn-primary">Save Name</button>
    `;
    const saveNameBtn = document.getElementById('saveNameBtn');
    if (saveNameBtn) saveNameBtn.addEventListener('click', () => {
        const input = document.getElementById('newName');
        if (input && input.value.trim()) {
            NameManager.setName(input.value);
            UIManager.updateDisplayName();
            Utils.showNotification('Display name updated.', 'success');
        }
    });
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    ChatManager.init();
    GameManager.init();
    AdminManager.init();
    AdStats.initImpressions();
    AdManager.renderSlots();
    AdminManager.injectHeaderCodes();
    // Splash enter
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn) enterBtn.addEventListener('click', () => {
        const splash = document.getElementById('splash');
        if (splash) splash.style.display = 'none';
        // Ask for name if not set
        if (!NameManager.getName()) NameManager.showModal();
    });
    
    // Update user count (simulate)
    setInterval(() => {
        const connectedUsers = Math.floor(Math.random() * 50) + 10;
            const userCountEl = document.getElementById('userCount');
            const userCountEl2 = document.getElementById('userCount2');
            if (userCountEl) userCountEl.textContent = `Users: ${connectedUsers}`;
            if (userCountEl2) userCountEl2.textContent = `Users: ${connectedUsers}`;
    }, 5000);
    
    Utils.showNotification('RevChattyBox loaded successfully!', 'success');
});