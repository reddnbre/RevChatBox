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
    getName: () => {
        // Check cookies first, then fallback to localStorage
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('rcb_display_name='));
        
        if (cookieValue) {
            return decodeURIComponent(cookieValue.split('=')[1]);
        }
        
        return localStorage.getItem(CONFIG.NAME_KEY) || '';
    },
    
    setName: (name) => {
        const trimmedName = name.trim().slice(0, 20);
        
        // Set in both cookies and localStorage for compatibility
        // Cookie expires in 1 year
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `rcb_display_name=${encodeURIComponent(trimmedName)}; expires=${expires.toUTCString()}; path=/`;
        
        localStorage.setItem(CONFIG.NAME_KEY, trimmedName);
    },
    
    clearName: () => {
        // Clear from both cookies and localStorage
        document.cookie = 'rcb_display_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem(CONFIG.NAME_KEY);
    },
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
        Utils.showNotification('Cookie preferences saved! Your display name and chat history will be preserved.', 'success');
    },
    
    decline: () => {
        // Clear existing data when declining
        localStorage.removeItem(CONFIG.THEME_KEY);
        localStorage.removeItem(CONFIG.NAME_KEY);
        localStorage.removeItem(CONFIG.METRICS_KEY);
        localStorage.removeItem('rcb_chat_messages');
        localStorage.setItem(CookieManager.COOKIE_KEY, 'declined');
        CookieManager.hideBanner();
        Utils.showNotification('Cookie preferences declined. All data has been cleared.', 'info');
        
        // Clear display name and chat
        NameManager.clearName();
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Refresh the page to reset state
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    },
    
    // Add method to clear all data when cookies are deleted
    clearAllData: () => {
        localStorage.clear();
        
        // Clear display name
        NameManager.clearName();
        
        // Clear chat messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Show name modal
        NameManager.showModal();
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
        if (!metricsState || !metricsState.events) {
            console.warn('Metrics not initialized, calling load()');
            Metrics.load();
        }
        metricsState.events.push({ type, data, ts: Date.now() });
        // Trim to last 5000 events
        if (metricsState.events.length > 5000) metricsState.events = metricsState.events.slice(-5000);
        Metrics.save();
    },
    countEvents: (type, sinceMs = 0) => {
        if (!metricsState || !metricsState.events) {
            console.warn('Metrics not initialized, calling load()');
            Metrics.load();
        }
        return metricsState.events.filter(e => e.type === type && e.ts >= sinceMs).length;
    },
    uniqueVisitorsSince: (sinceMs) => {
        if (!metricsState || !metricsState.events) {
            console.warn('Metrics not initialized, calling load()');
            Metrics.load();
        }
        const names = new Set();
        metricsState.events.forEach(e => {
            if (e.type === 'visit' && e.ts >= sinceMs && e.data && e.data.name) names.add(e.data.name);
        });
        return names.size;
    },
    recordVisit: () => Metrics.addEvent('visit', { name: NameManager.getName() || 'anon' })
};

// Real-time Chat Sync System
const ChatSync = {
    CHAT_KEY: 'rcb_global_chat',
    USERS_KEY: 'rcb_online_users',
    SYNC_INTERVAL: 1000, // Check for new messages every second
    
    // Generate unique user ID
    getUserId: () => {
        let userId = localStorage.getItem('rcb_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('rcb_user_id', userId);
        }
        return userId;
    },
    
    // Get user's display name
    getUserName: () => {
        return NameManager.getName() || 'Anonymous';
    },
    
    // Send message to global chat
    sendMessage: (message) => {
        console.log('ChatSync.sendMessage called with:', message);
        const messages = ChatSync.getMessages();
        const newMessage = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: message,
            sender: ChatSync.getUserName(),
            userId: ChatSync.getUserId(),
            timestamp: Date.now(),
            type: 'user'
        };
        
        console.log('New message object:', newMessage);
        messages.push(newMessage);
        
        // Keep only last 200 messages
        if (messages.length > 200) {
            messages.splice(0, messages.length - 200);
        }
        
        localStorage.setItem(ChatSync.CHAT_KEY, JSON.stringify(messages));
        
        // Update online users
        ChatSync.updateUserPresence();
    },
    
    // Get all messages
    getMessages: () => {
        try {
            return JSON.parse(localStorage.getItem(ChatSync.CHAT_KEY) || '[]');
        } catch {
            return [];
        }
    },
    
    // Update user presence
    updateUserPresence: () => {
        const users = ChatSync.getOnlineUsers();
        const currentUser = {
            id: ChatSync.getUserId(),
            name: ChatSync.getUserName(),
            lastSeen: Date.now()
        };
        
        // Update or add current user
        const existingIndex = users.findIndex(u => u.id === currentUser.id);
        if (existingIndex >= 0) {
            users[existingIndex] = currentUser;
        } else {
            users.push(currentUser);
        }
        
        // Remove users who haven't been seen for 5 minutes
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const activeUsers = users.filter(u => u.lastSeen > fiveMinutesAgo);
        
        localStorage.setItem(ChatSync.USERS_KEY, JSON.stringify(activeUsers));
        ChatSync.updateUserCount(activeUsers.length);
    },
    
    // Get online users
    getOnlineUsers: () => {
        try {
            return JSON.parse(localStorage.getItem(ChatSync.USERS_KEY) || '[]');
        } catch {
            return [];
        }
    },
    
    // Update user count display
    updateUserCount: (count) => {
        const userCountEl = document.getElementById('userCount');
        if (userCountEl) {
            userCountEl.innerHTML = `<span class="dot"></span><span>Users: ${count}</span>`;
        }
    },
    
    // Check for new messages and update chat
    syncMessages: () => {
        const messages = ChatSync.getMessages();
        const chatMessages = document.getElementById('chatMessages');
        
        if (!chatMessages) return;
        
        // Get current message count
        const currentMessageCount = chatMessages.children.length;
        
        // If we have new messages, reload the chat
        if (messages.length !== currentMessageCount) {
            ChatSync.displayAllMessages(messages);
        }
        
        // Update user presence
        ChatSync.updateUserPresence();
    },
    
    // Display all messages
    displayAllMessages: (messages) => {
        console.log('ChatSync.displayAllMessages called with:', messages.length, 'messages');
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error('chatMessages element not found!');
            return;
        }
        
        // Filter messages from last 8 hours
        const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
        const recentMessages = messages.filter(msg => msg.timestamp > eightHoursAgo);
        
        console.log('Recent messages:', recentMessages.length);
        chatMessages.innerHTML = '';
        
        recentMessages.forEach(msgData => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msgData.type}`;
            messageDiv.setAttribute('data-timestamp', msgData.timestamp);
            messageDiv.setAttribute('data-message-id', msgData.id);
            
            const time = Utils.formatTime(new Date(msgData.timestamp));
            const senderName = msgData.type === 'user' ? msgData.sender : 'Bot';
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="sender-name">${Utils.escapeHtml(senderName)}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-content">${Utils.escapeHtml(msgData.text)}</div>
            `;
            
            chatMessages.appendChild(messageDiv);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    
    // Start sync interval
    startSync: () => {
        ChatSync.updateUserPresence();
        ChatSync.syncMessages();
        
        // Set up periodic sync
        setInterval(ChatSync.syncMessages, ChatSync.SYNC_INTERVAL);
        
        // Initial message load
        setTimeout(() => {
            const messages = ChatSync.getMessages();
            console.log('Initial messages loaded:', messages.length);
            ChatSync.displayAllMessages(messages);
            
            // Add a test message if no messages exist
            if (messages.length === 0) {
                console.log('No messages found, adding test message');
                ChatSync.sendMessage('Chat system is working! 🎉');
            }
        }, 500);
        
        // Add welcome message for new users
        setTimeout(() => {
            const messages = ChatSync.getMessages();
            const hasWelcomeMessage = messages.some(msg => msg.text.includes('Welcome to RevChattyBox'));
            
            if (!hasWelcomeMessage) {
                const welcomeMessage = {
                    id: 'welcome_' + Date.now(),
                    text: 'Welcome to RevChattyBox! 🎉 Start chatting with other users!',
                    sender: 'System',
                    userId: 'system',
                    timestamp: Date.now(),
                    type: 'bot'
                };
                
                messages.unshift(welcomeMessage);
                localStorage.setItem(ChatSync.CHAT_KEY, JSON.stringify(messages));
                ChatSync.displayAllMessages(messages);
            }
        }, 1000);
        
        // Add test message functionality (for development)
        window.testChat = () => {
            const testMessages = [
                'Testing the chat system! 📱',
                'This is a test message from ' + ChatSync.getUserName(),
                'Multi-user chat is working! 🎉',
                'Can you see this message? 👀'
            ];
            
            const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
            ChatSync.sendMessage(randomMessage);
            
            console.log('Test message sent:', randomMessage);
            console.log('Current users online:', ChatSync.getOnlineUsers().length);
        };
        
        // Add manual send test
        window.manualSend = (text) => {
            console.log('Manual send called with:', text);
            ChatSync.sendMessage(text || 'Manual test message');
        };
        
        // Add display test
        window.testDisplay = () => {
            console.log('Testing message display...');
            const messages = ChatSync.getMessages();
            console.log('Current messages:', messages);
            ChatSync.displayAllMessages(messages);
        };
        
        // Log chat system status
        console.log('ChatSync initialized');
        console.log('User ID:', ChatSync.getUserId());
        console.log('Display Name:', ChatSync.getUserName());
        console.log('Online users:', ChatSync.getOnlineUsers().length);
    }
};

// Emoji Management
const EmojiManager = {
    emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
        '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
        '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
        '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
        '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
        '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
        '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
        '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
        '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
        '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
        '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
        '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
        '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋',
        '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
        '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇',
        '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏',
        '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳',
        '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
        '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋',
        '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤',
        '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗',
        '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️',
        '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎',
        '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏',
        '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️',
        '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️',
        '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵',
        '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘',
        '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢',
        '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭',
        '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆',
        '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅',
        '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️',
        '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️',
        '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧',
        '🚻', '🚮', '🎦', '📶', '🈁', '🔣', '🔤', '🔡',
        '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣',
        '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣',
        '9️⃣', '🔟'
    ],
    
    init: () => {
        const emojiBtn = document.getElementById('emojiBtn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', EmojiManager.showPicker);
        }
        
        // Populate emoji grid
        EmojiManager.populateEmojiGrid();
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
        const emojiGrid = document.getElementById('emoji-grid');
        if (!emojiGrid) return;
        
        emojiGrid.innerHTML = '';
        
        EmojiManager.emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'emoji-btn';
            emojiBtn.textContent = emoji;
            emojiBtn.title = emoji;
            
            emojiBtn.addEventListener('click', () => {
                EmojiManager.insertEmoji(emoji);
                EmojiManager.hidePicker();
            });
            
            emojiGrid.appendChild(emojiBtn);
        });
    },
    
    insertEmoji: (emoji) => {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            const currentValue = messageInput.value;
            const cursorPos = messageInput.selectionStart;
            
            const newValue = currentValue.slice(0, cursorPos) + emoji + currentValue.slice(cursorPos);
            messageInput.value = newValue;
            
            // Set cursor position after the emoji
            const newCursorPos = cursorPos + emoji.length;
            messageInput.setSelectionRange(newCursorPos, newCursorPos);
            
            // Focus back to input
            messageInput.focus();
        }
    }
};

// Chat Management
const ChatManager = {
    init: () => {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const pmBtn = document.getElementById('pmBtn');
        
        if (messageInput && sendBtn) {
            console.log('Setting up send button event listener');
            sendBtn.addEventListener('click', (e) => {
                console.log('Send button clicked!', e);
                ChatManager.sendMessage();
            });
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed');
                    ChatManager.sendMessage();
                }
            });
        } else {
            console.error('messageInput or sendBtn not found:', messageInput, sendBtn);
        }
        if (pmBtn) pmBtn.addEventListener('click', PMManager.showModal);
        
        // Start the real-time chat sync system
        ChatSync.startSync();
    },
    
    sendMessage: () => {
        console.log('ChatManager.sendMessage called');
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        console.log('Message input:', messageInput);
        console.log('Message text:', message);
        
        if (message && message.length <= 500) {
            console.log('Sending message:', message);
            // Send to global chat
            ChatSync.sendMessage(message);
            messageInput.value = '';
            
            // Clear input focus
            messageInput.blur();
            
            // Add bot response for fun
            setTimeout(() => {
                const botMessages = [
                    'Thanks for your message!',
                    'Cool! 👍',
                    'Nice one!',
                    'I see what you mean!',
                    'Interesting point!'
                ];
                const randomBotMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
                
                // Add bot message to global chat
                const messages = ChatSync.getMessages();
                const botMessage = {
                    id: Date.now() + '_bot_' + Math.random().toString(36).substr(2, 9),
                    text: randomBotMessage,
                    sender: 'ChatBot',
                    userId: 'bot',
                    timestamp: Date.now(),
                    type: 'bot'
                };
                
                messages.push(botMessage);
                
                // Keep only last 200 messages
                if (messages.length > 200) {
                    messages.splice(0, messages.length - 200);
                }
                
                localStorage.setItem(ChatSync.CHAT_KEY, JSON.stringify(messages));
            }, 1500 + Math.random() * 2000); // Random delay between 1.5-3.5 seconds
        }
    },
    
    addMessage: (message, sender) => {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const now = new Date();
        const timestamp = now.getTime(); // Store timestamp for cleanup
        const time = Utils.formatTime(now);
        
        // Add timestamp as data attribute for cleanup tracking
        messageDiv.setAttribute('data-timestamp', timestamp);
        
        messageDiv.innerHTML = `
            <div class="message-content">${Utils.escapeHtml(message)}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store message in localStorage for persistence
        ChatManager.saveMessageToStorage(message, sender, timestamp);
    },
    
    saveMessageToStorage: (message, sender, timestamp) => {
        const messages = ChatManager.getStoredMessages();
        messages.push({ message, sender, timestamp });
        
        // Keep only last 100 messages in storage
        if (messages.length > 100) {
            messages.splice(0, messages.length - 100);
        }
        
        localStorage.setItem('rcb_chat_messages', JSON.stringify(messages));
    },
    
    getStoredMessages: () => {
        try {
            return JSON.parse(localStorage.getItem('rcb_chat_messages') || '[]');
        } catch {
            return [];
        }
    },
    
    loadStoredMessages: () => {
        const messages = ChatManager.getStoredMessages();
        const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
        
        // Filter out messages older than 8 hours
        const recentMessages = messages.filter(msg => msg.timestamp > eightHoursAgo);
        
        // Clear old messages from storage
        if (recentMessages.length !== messages.length) {
            localStorage.setItem('rcb_chat_messages', JSON.stringify(recentMessages));
        }
        
        // Display recent messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            recentMessages.forEach(msg => {
                ChatManager.displayStoredMessage(msg);
            });
        }
    },
    
    displayStoredMessage: (msgData) => {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msgData.sender}`;
        messageDiv.setAttribute('data-timestamp', msgData.timestamp);
        
        const time = Utils.formatTime(new Date(msgData.timestamp));
        messageDiv.innerHTML = `
            <div class="message-content">${Utils.escapeHtml(msgData.message)}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
    },
    
    cleanupOldMessages: () => {
        const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
        const chatMessages = document.getElementById('chatMessages');
        
        if (chatMessages) {
            const messages = chatMessages.querySelectorAll('.message');
            messages.forEach(msg => {
                const timestamp = parseInt(msg.getAttribute('data-timestamp'));
                if (timestamp && timestamp < eightHoursAgo) {
                    msg.remove();
                }
            });
        }
        
        // Clean up localStorage
        const storedMessages = ChatManager.getStoredMessages();
        const recentMessages = storedMessages.filter(msg => msg.timestamp > eightHoursAgo);
        localStorage.setItem('rcb_chat_messages', JSON.stringify(recentMessages));
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
                    <button class="btn btn-primary" onclick="GameManager.startBotGame('${gameId}')">
                        🤖 Play vs Bot
                    </button>
                </div>
                <p class="mode-description">
                    Play against the computer bot.
                </p>
            </div>
        `;
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">Game:</span>
                    <span class="score">${game.name}</span>
                </div>
            </div>
        `;
    },
    
    startBotGame: (gameId) => {
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
        GameManager.hideGameModal();
        GameManager.showGameHub();
    },
    
    loadGame: (gameId) => {
        const gameContainer = document.getElementById('gameContainer');
        const gameStatus = document.getElementById('gameStatus');
        
        switch (gameId) {
            case 'hangman':
                Metrics.addEvent('game_start', { game: 'hangman' });
                Hangman.init();
                break;
            case 'connect4':
                Metrics.addEvent('game_start', { game: 'connect4' });
                Connect4.init();
                break;
            case 'war':
                Metrics.addEvent('game_start', { game: 'war' });
                War.init();
                break;
            case 'battleship':
                Metrics.addEvent('game_start', { game: 'battleship' });
                Battleship.init();
                break;
            default:
                Utils.showNotification('Game not found!', 'error');
        }
    }
};

// Hangman Game
const Hangman = {
    init: () => {
        gameState = {
            word: '',
            guessed: [],
            wrongGuesses: 0,
            maxWrong: 6,
            gameActive: true,
            score: 0,
            gameCount: 0
        };
        
        Hangman.selectRandomWord();
        Hangman.updateDisplay();
        Hangman.attachEvents();
    },
    
    selectRandomWord: () => {
        const words = [
            'JAVASCRIPT', 'PROGRAMMING', 'COMPUTER', 'ALGORITHM', 'FUNCTION',
            'VARIABLE', 'ARRAY', 'OBJECT', 'STRING', 'NUMBER', 'BOOLEAN',
            'CHAT', 'GAME', 'PLAYER', 'SCORE', 'WINNER', 'LOSER', 'GUESS'
        ];
        gameState.word = words[Math.floor(Math.random() * words.length)];
    },
    
    attachEvents: () => {
        const keyboard = document.getElementById('hangmanKeyboard');
        if (keyboard) {
            keyboard.innerHTML = '';
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                const btn = document.createElement('button');
                btn.className = 'key-btn';
                btn.textContent = letter;
                btn.onclick = () => Hangman.guessLetter(letter);
                keyboard.appendChild(btn);
            }
        }
    },
    
    guessLetter: (letter) => {
        if (!gameState.gameActive || gameState.guessed.includes(letter)) return;
        
        gameState.guessed.push(letter);
        
        if (!gameState.word.includes(letter)) {
            gameState.wrongGuesses++;
        }
        
        Hangman.updateDisplay();
        
        if (Hangman.checkWin()) {
            Hangman.endGame('win');
        } else if (gameState.wrongGuesses >= gameState.maxWrong) {
            Hangman.endGame('lose');
        }
    },
    
    checkWin: () => {
        return gameState.word.split('').every(letter => gameState.guessed.includes(letter));
    },
    
    updateDisplay: () => {
        const gameContainer = document.getElementById('gameContainer');
        const gameStatus = document.getElementById('gameStatus');
        
        // Display word with blanks
        const displayWord = gameState.word.split('').map(letter => 
            gameState.guessed.includes(letter) ? letter : '_'
        ).join(' ');
        
        // Update keyboard buttons
        const keyboard = document.getElementById('hangmanKeyboard');
        if (keyboard) {
            const buttons = keyboard.querySelectorAll('.key-btn');
            buttons.forEach(btn => {
                const letter = btn.textContent;
                if (gameState.guessed.includes(letter)) {
                    btn.disabled = true;
                    btn.classList.add('guessed');
                    if (gameState.word.includes(letter)) {
                        btn.classList.add('correct');
                    } else {
                        btn.classList.add('wrong');
                    }
                }
            });
        }
        
        gameContainer.innerHTML = `
            <div class="hangman-game">
                <div class="hangman-display">
                    <div class="word-display">${displayWord}</div>
                    <div class="hangman-drawing">
                        <svg width="200" height="250">
                            <line x1="20" y1="220" x2="180" y2="220" stroke="var(--text)" stroke-width="3"/>
                            <line x1="40" y1="220" x2="40" y2="20" stroke="var(--text)" stroke-width="3"/>
                            <line x1="40" y1="20" x2="140" y2="20" stroke="var(--text)" stroke-width="3"/>
                            <line x1="140" y1="20" x2="140" y2="40" stroke="var(--text)" stroke-width="3"/>
                            ${gameState.wrongGuesses >= 1 ? '<circle cx="140" cy="60" r="20" stroke="var(--text)" stroke-width="2" fill="none"/>' : ''}
                            ${gameState.wrongGuesses >= 2 ? '<line x1="140" y1="80" x2="140" y2="140" stroke="var(--text)" stroke-width="3"/>' : ''}
                            ${gameState.wrongGuesses >= 3 ? '<line x1="140" y1="100" x2="120" y2="120" stroke="var(--text)" stroke-width="3"/>' : ''}
                            ${gameState.wrongGuesses >= 4 ? '<line x1="140" y1="100" x2="160" y2="120" stroke="var(--text)" stroke-width="3"/>' : ''}
                            ${gameState.wrongGuesses >= 5 ? '<line x1="140" y1="140" x2="120" y2="160" stroke="var(--text)" stroke-width="3"/>' : ''}
                            ${gameState.wrongGuesses >= 6 ? '<line x1="140" y1="140" x2="160" y2="160" stroke="var(--text)" stroke-width="3"/>' : ''}
                        </svg>
                    </div>
                </div>
                <div id="hangmanKeyboard" class="hangman-keyboard"></div>
                <div class="game-info">
                    <p>Wrong guesses: ${gameState.wrongGuesses}/${gameState.maxWrong}</p>
                    <p>Guessed letters: ${gameState.guessed.join(', ')}</p>
                </div>
            </div>
        `;
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">Score:</span>
                    <span class="score">${gameState.score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">Games:</span>
                    <span class="score">${gameState.gameCount}</span>
                </div>
            </div>
        `;
        
        Hangman.attachEvents();
    },
    
    endGame: (result) => {
        gameState.gameActive = false;
        gameState.gameCount++;
        
        const gameContainer = document.getElementById('gameContainer');
        const message = result === 'win' ? '🎉 You Won! 🎉' : '😔 Game Over!';
        
        if (result === 'win') {
            gameState.score += 100;
        }
        
        gameContainer.innerHTML = `
            <div class="game-over-screen">
                <h2>${message}</h2>
                <div class="final-result">
                    <p>The word was: <strong>${gameState.word}</strong></p>
                    <p>Final Score: ${gameState.score}</p>
                    <p>Games Played: ${gameState.gameCount}</p>
                </div>
                <div class="game-actions">
                    <button class="btn btn-primary" onclick="Hangman.init()">Play Again</button>
                    <button class="btn btn-secondary" onclick="GameManager.backToGames()">Back to Games</button>
                </div>
            </div>
        `;
    }
};

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
        
        Connect4.renderBoard();
        Connect4.updateScoreDisplay();
    },
    
    renderBoard: () => {
        const gameContainer = document.getElementById('gameContainer');
        const board = document.createElement('div');
        board.className = 'connect4-board';
        board.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.className = 'connect4-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => Connect4.handleCellClick(row * 7 + col));
                board.appendChild(cell);
            }
        }
        
        gameContainer.innerHTML = `
            <div class="connect4-game">
                <div class="connect4-board-container">
                    ${board.outerHTML}
                </div>
            </div>
        `;
        
        Connect4.attachEvents();
    },
    
    attachEvents: () => {
        const cells = document.querySelectorAll('.connect4-cell');
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => Connect4.handleCellClick(index));
        });
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
        
        // Bot move
        setTimeout(() => Connect4.botMove(), 1000);
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
        
        // Simple AI: try to win, then block player, then random
        let move = Connect4.getWinningMove('player2');
        if (move === -1) {
            move = Connect4.getWinningMove('player1'); // Block player
        }
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
    
    getWinningMove: (player) => {
        for (let col = 0; col < 7; col++) {
            const row = Connect4.getLowestEmptyRow(col);
            if (row !== -1) {
                const cellIndex = row * 7 + col;
                gameState.board[cellIndex] = player;
                if (Connect4.checkWinner()) {
                    gameState.board[cellIndex] = '';
                    return col;
                }
                gameState.board[cellIndex] = '';
            }
        }
        return -1;
    },
    
    checkWinner: () => {
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1] // horizontal, vertical, diagonal
        ];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const player = gameState.board[row * 7 + col];
                if (player === '') continue;
                
                for (let [dr, dc] of directions) {
                    let count = 1;
                    let r = row + dr, c = col + dc;
                    
                    while (r >= 0 && r < 6 && c >= 0 && c < 7 && 
                           gameState.board[r * 7 + c] === player) {
                        count++;
                        r += dr;
                        c += dc;
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
    
    updateDisplay: () => {
        const cells = document.querySelectorAll('.connect4-cell');
        cells.forEach((cell, index) => {
            const player = gameState.board[index];
            cell.className = 'connect4-cell';
            if (player === 'player1') {
                cell.classList.add('player1');
            } else if (player === 'player2') {
                cell.classList.add('player2');
            }
        });
    },
    
    updateScoreDisplay: () => {
        const gameStatus = document.getElementById('gameStatus');
        const currentPlayerName = gameState.currentPlayer === 'player1' ? 'You' : 'Bot';
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">You:</span>
                    <span class="score">${gameState.player1Score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">Bot:</span>
                    <span class="score">${gameState.player2Score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">Games:</span>
                    <span class="score">${gameState.gameCount}</span>
                </div>
            </div>
            <div class="current-player">Current Turn: ${currentPlayerName}</div>
        `;
    },
    
    endGame: (result) => {
        gameState.gamePhase = 'ended';
        gameState.gameCount++;
        
        if (result === 'player1') {
            gameState.player1Score++;
        } else if (result === 'player2') {
            gameState.player2Score++;
        }
        
        const gameContainer = document.getElementById('gameContainer');
        const message = result === 'player1' ? '🎉 You Won! 🎉' : 
                       result === 'player2' ? '😔 Bot Won!' : 
                       '🤝 It\'s a Draw!';
        
        gameContainer.innerHTML = `
            <div class="game-over-screen">
                <h2>${message}</h2>
                <div class="score-summary">
                    <div>Your Score: ${gameState.player1Score}</div>
                    <div>Bot Score: ${gameState.player2Score}</div>
                    <div>Games Played: ${gameState.gameCount}</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-primary" onclick="Connect4.init()">Play Again</button>
                    <button class="btn btn-secondary" onclick="GameManager.backToGames()">Back to Games</button>
                </div>
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
            gameDeck: []
        };
        
        War.createDeck();
        War.dealCards();
        War.updateDisplay();
    },
    
    createDeck: () => {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        gameState.gameDeck = [];
        
        for (let suit of suits) {
            for (let value of values) {
                gameState.gameDeck.push({
                    suit: suit,
                    value: value,
                    rank: War.getCardRank(value)
                });
            }
        }
        
        // Shuffle deck
        for (let i = gameState.gameDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameState.gameDeck[i], gameState.gameDeck[j]] = [gameState.gameDeck[j], gameState.gameDeck[i]];
        }
    },
    
    getCardRank: (value) => {
        const ranks = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
        return ranks[value];
    },
    
    dealCards: () => {
        gameState.player1Cards = gameState.gameDeck.slice(0, 26);
        gameState.player2Cards = gameState.gameDeck.slice(26);
    },
    
    updateDisplay: () => {
        const gameContainer = document.getElementById('gameContainer');
        const gameStatus = document.getElementById('gameStatus');
        
        gameContainer.innerHTML = `
            <div class="war-game">
                <div class="war-header">
                    <h3>War Card Game</h3>
                    <p>Click "Draw Card" to play a round</p>
                </div>
                
                <div class="war-play-area">
                    <div class="player-area">
                        <div class="player-label">Your Cards: ${gameState.player1Cards.length}</div>
                        <div class="card-pile player1-pile"></div>
                    </div>
                    
                    <div class="center-area">
                        <button id="drawCardBtn" class="btn btn-primary" onclick="War.playRound()">
                            Draw Card
                        </button>
                        <div id="warResult" class="war-result"></div>
                    </div>
                    
                    <div class="player-area">
                        <div class="player-label">Bot Cards: ${gameState.player2Cards.length}</div>
                        <div class="card-pile player2-pile"></div>
                    </div>
                </div>
                
                <div class="war-stats">
                    <div class="stat">
                        <span>Your Score:</span>
                        <span>${gameState.player1Score}</span>
                    </div>
                    <div class="stat">
                        <span>Bot Score:</span>
                        <span>${gameState.player2Score}</span>
                    </div>
                    <div class="stat">
                        <span>Games:</span>
                        <span>${gameState.gameCount}</span>
                    </div>
                </div>
            </div>
        `;
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">Your Cards:</span>
                    <span class="score">${gameState.player1Cards.length}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">Bot Cards:</span>
                    <span class="score">${gameState.player2Cards.length}</span>
                </div>
            </div>
        `;
    },
    
    playRound: () => {
        if (gameState.player1Cards.length === 0 || gameState.player2Cards.length === 0) {
            War.endGame();
            return;
        }
        
        const player1Card = gameState.player1Cards.shift();
        const player2Card = gameState.player2Cards.shift();
        
        const result = War.compareCards(player1Card, player2Card);
        const warResult = document.getElementById('warResult');
        
        warResult.innerHTML = `
            <div class="card-comparison">
                <div class="card-display">
                    <div class="card player1-card">
                        <div class="card-value">${player1Card.value}</div>
                        <div class="card-suit">${player1Card.suit}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="card player2-card">
                        <div class="card-value">${player2Card.value}</div>
                        <div class="card-suit">${player2Card.suit}</div>
                    </div>
                </div>
                <div class="round-result">${result.message}</div>
            </div>
        `;
        
        if (result.winner === 'player1') {
            gameState.player1Cards.push(player1Card, player2Card);
            gameState.player1Score++;
        } else if (result.winner === 'player2') {
            gameState.player2Cards.push(player1Card, player2Card);
            gameState.player2Score++;
        } else {
            // War! - both cards go to winner of next round
            gameState.warCards = [player1Card, player2Card];
            War.playWarRound();
        }
        
        War.updateDisplay();
        
        // Check if game is over
        if (gameState.player1Cards.length === 0 || gameState.player2Cards.length === 0) {
            setTimeout(() => War.endGame(), 1000);
        }
    },
    
    compareCards: (card1, card2) => {
        if (card1.rank > card2.rank) {
            return { winner: 'player1', message: 'You win this round!' };
        } else if (card2.rank > card1.rank) {
            return { winner: 'player2', message: 'Bot wins this round!' };
        } else {
            return { winner: 'war', message: 'WAR! Both cards have equal value!' };
        }
    },
    
    playWarRound: () => {
        if (gameState.player1Cards.length < 2 || gameState.player2Cards.length < 2) {
            // Not enough cards for war
            if (gameState.player1Cards.length >= gameState.player2Cards.length) {
                gameState.player1Cards.push(...gameState.warCards);
                gameState.player1Score++;
            } else {
                gameState.player2Cards.push(...gameState.warCards);
                gameState.player2Score++;
            }
            gameState.warCards = [];
            return;
        }
        
        // Play war round
        const player1WarCard = gameState.player1Cards.shift();
        const player2WarCard = gameState.player2Cards.shift();
        
        gameState.warCards.push(player1WarCard, player2WarCard);
        
        const result = War.compareCards(player1WarCard, player2WarCard);
        
        if (result.winner === 'player1') {
            gameState.player1Cards.push(...gameState.warCards);
            gameState.player1Score++;
        } else if (result.winner === 'player2') {
            gameState.player2Cards.push(...gameState.warCards);
            gameState.player2Score++;
        } else {
            // Another war
            War.playWarRound();
        }
        
        gameState.warCards = [];
    },
    
    endGame: () => {
        gameState.gamePhase = 'ended';
        gameState.gameCount++;
        
        const winner = gameState.player1Cards.length > gameState.player2Cards.length ? 'You' : 
                      gameState.player2Cards.length > gameState.player1Cards.length ? 'Bot' : 'Draw';
        
        const gameContainer = document.getElementById('gameContainer');
        const message = winner === 'You' ? '🎉 You Won! 🎉' : 
                       winner === 'Bot' ? '😔 Bot Won!' : 
                       '🤝 It\'s a Draw!';
        
        gameContainer.innerHTML = `
            <div class="game-over-screen">
                <h2>${message}</h2>
                <div class="score-summary">
                    <div>Final Score - You: ${gameState.player1Score}, Bot: ${gameState.player2Score}</div>
                    <div>Cards Remaining - You: ${gameState.player1Cards.length}, Bot: ${gameState.player2Cards.length}</div>
                    <div>Games Played: ${gameState.gameCount}</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-primary" onclick="War.init()">Play Again</button>
                    <button class="btn btn-secondary" onclick="GameManager.backToGames()">Back to Games</button>
                </div>
            </div>
        `;
    }
};

// Battleship Game
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
            isMultiplayer: false
        };
        
        Battleship.showSetupScreen();
    },
    
    showSetupScreen: () => {
        const gameContainer = document.getElementById('gameContainer');
        const currentPlayerName = 'Player';
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
                            `<div class="cell setup-cell" data-index="${i}" onclick="Battleship.handleSetupClick(${i})"></div>`
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
        
        Battleship.updateSetupDisplay();
    },
    
    handleSetupClick: (index) => {
        if (gameState.gamePhase !== 'setup') return;
        
        const currentShip = gameState.player1Ships[gameState.currentShipIndex];
        if (!currentShip || currentShip.placed) return;
        
        const row = Math.floor(index / 10);
        const col = index % 10;
        const orientation = gameState.shipOrientation;
        
        if (Battleship.canPlaceShip(currentShip, row, col, orientation)) {
            Battleship.placeShip(currentShip, row, col, orientation);
            Battleship.showSetupScreen();
        } else {
            Utils.showNotification('Cannot place ship here!', 'error');
        }
    },
    
    canPlaceShip: (ship, row, col, orientation) => {
        const board = gameState.player1Board;
        const size = ship.size;
        
        if (orientation === 'horizontal') {
            if (col + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (board[row * 10 + col + i] !== '') return false;
            }
        } else {
            if (row + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (board[(row + i) * 10 + col] !== '') return false;
            }
        }
        return true;
    },
    
    placeShip: (ship, row, col, orientation) => {
        const board = gameState.player1Board;
        const size = ship.size;
        ship.positions = [];
        
        for (let i = 0; i < size; i++) {
            let index;
            if (orientation === 'horizontal') {
                index = row * 10 + col + i;
            } else {
                index = (row + i) * 10 + col;
            }
            
            board[index] = ship.name;
            ship.positions.push(index);
        }
        
        ship.placed = true;
        gameState.currentShipIndex++;
        
        if (gameState.currentShipIndex >= gameState.player1Ships.length) {
            Battleship.startGame();
        }
    },
    
    toggleOrientation: () => {
        gameState.shipOrientation = gameState.shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        Battleship.showSetupScreen();
    },
    
    placeRandomly: () => {
        const currentBoard = gameState.player1Board;
        const currentShips = gameState.player1Ships;
        
        currentBoard.fill('');
        currentShips.forEach(ship => {
            ship.positions = [];
            ship.placed = false;
        });
        
        gameState.currentShipIndex = 0;
        
        currentShips.forEach(ship => {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                
                if (Battleship.canPlaceShip(ship, row, col, orientation)) {
                    Battleship.placeShip(ship, row, col, orientation);
                    placed = true;
                }
                attempts++;
            }
            
            if (!placed) {
                Utils.showNotification('Could not place all ships randomly!', 'error');
                Battleship.showSetupScreen();
                return;
            }
        });
        
        Battleship.startGame();
    },
    
    startGame: () => {
        gameState.gamePhase = 'playing';
        Battleship.placeBotShips();
        Battleship.showGameBoard();
    },
    
    placeBotShips: () => {
        const board = gameState.player2Board;
        const ships = gameState.player2Ships;
        
        ships.forEach(ship => {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                
                if (Battleship.canPlaceShip(ship, row, col, orientation, board)) {
                    Battleship.placeShip(ship, row, col, orientation, board);
                    placed = true;
                }
                attempts++;
            }
        });
    },
    
    canPlaceShip: (ship, row, col, orientation, board = gameState.player1Board) => {
        const size = ship.size;
        
        if (orientation === 'horizontal') {
            if (col + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (board[row * 10 + col + i] !== '') return false;
            }
        } else {
            if (row + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (board[(row + i) * 10 + col] !== '') return false;
            }
        }
        return true;
    },
    
    placeShip: (ship, row, col, orientation, board = gameState.player1Board) => {
        const size = ship.size;
        ship.positions = [];
        
        for (let i = 0; i < size; i++) {
            let index;
            if (orientation === 'horizontal') {
                index = row * 10 + col + i;
            } else {
                index = (row + i) * 10 + col;
            }
            
            board[index] = ship.name;
            ship.positions.push(index);
        }
        
        ship.placed = true;
    },
    
    showGameBoard: () => {
        const gameContainer = document.getElementById('gameContainer');
        const gameStatus = document.getElementById('gameStatus');
        
        gameContainer.innerHTML = `
            <div class="battleship-game">
                <div class="game-boards">
                    <div class="board-section">
                        <h4>Your Board</h4>
                        <div class="board-grid player-board">
                            ${Array(100).fill().map((_, i) => 
                                `<div class="cell ${gameState.player1Board[i] ? 'ship' : ''}" data-index="${i}"></div>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="board-section">
                        <h4>Attack Board</h4>
                        <div class="board-grid attack-board">
                            ${Array(100).fill().map((_, i) => 
                                `<div class="cell attack-cell" data-index="${i}" onclick="Battleship.attack(${i})"></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="game-info">
                    <div class="current-turn">
                        <h4>Current Turn: ${gameState.currentPlayer === 'player1' ? 'You' : 'Bot'}</h4>
                    </div>
                </div>
            </div>
        `;
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">Your Hits:</span>
                    <span class="score">${gameState.player1Score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">Bot Hits:</span>
                    <span class="score">${gameState.player2Score}</span>
                </div>
            </div>
        `;
    },
    
    attack: (index) => {
        if (gameState.gamePhase !== 'playing' || gameState.currentPlayer !== 'player1') return;
        
        const board = gameState.player2Board;
        const cell = document.querySelector(`.attack-cell[data-index="${index}"]`);
        
        if (board[index] === 'hit' || board[index] === 'miss') return;
        
        if (board[index] !== '') {
            // Hit
            board[index] = 'hit';
            cell.classList.add('hit');
            gameState.player1Score++;
            
            // Check if ship is sunk
            const shipName = board[index];
            const ship = gameState.player2Ships.find(s => s.name === shipName);
            if (ship && !ship.sunk) {
                const allHit = ship.positions.every(pos => board[pos] === 'hit');
                if (allHit) {
                    ship.sunk = true;
                    Utils.showNotification(`${shipName} sunk!`, 'success');
                }
            }
            
            // Check win condition
            if (gameState.player1Score >= 17) { // Total ship cells
                Battleship.endGame('player1');
                return;
            }
        } else {
            // Miss
            board[index] = 'miss';
            cell.classList.add('miss');
        }
        
        gameState.currentPlayer = 'player2';
        Battleship.updateScoreDisplay();
        
        // Bot attack
        setTimeout(() => Battleship.botAttack(), 1000);
    },
    
    botAttack: () => {
        if (gameState.gamePhase !== 'playing' || gameState.currentPlayer !== 'player2') return;
        
        const board = gameState.player1Board;
        const availableCells = [];
        
        for (let i = 0; i < 100; i++) {
            if (board[i] !== 'hit' && board[i] !== 'miss') {
                availableCells.push(i);
            }
        }
        
        if (availableCells.length === 0) {
            Battleship.endGame('player1');
            return;
        }
        
        const attackIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
        
        if (board[attackIndex] !== '') {
            // Hit
            board[attackIndex] = 'hit';
            gameState.player2Score++;
            Utils.showNotification('Bot hit your ship!', 'error');
            
            // Check win condition
            if (gameState.player2Score >= 17) {
                Battleship.endGame('player2');
                return;
            }
        } else {
            // Miss
            board[attackIndex] = 'miss';
            Utils.showNotification('Bot missed!', 'info');
        }
        
        gameState.currentPlayer = 'player1';
        Battleship.updateScoreDisplay();
    },
    
    updateScoreDisplay: () => {
        const gameStatus = document.getElementById('gameStatus');
        
        gameStatus.innerHTML = `
            <div class="score-display">
                <div class="score-item">
                    <span class="player-label">Your Hits:</span>
                    <span class="score">${gameState.player1Score}</span>
                </div>
                <div class="score-item">
                    <span class="player-label">Bot Hits:</span>
                    <span class="score">${gameState.player2Score}</span>
                </div>
            </div>
            <div class="current-player">Current Turn: ${gameState.currentPlayer === 'player1' ? 'You' : 'Bot'}</div>
        `;
    },
    
    updateSetupDisplay: () => {
        const cells = document.querySelectorAll('.setup-cell');
        cells.forEach((cell, index) => {
            const shipName = gameState.player1Board[index];
            cell.className = 'cell setup-cell';
            if (shipName) {
                cell.classList.add('ship');
                cell.textContent = shipName[0];
            }
        });
    },
    
    endGame: (result) => {
        gameState.gamePhase = 'ended';
        gameState.gameCount++;
        
        const gameContainer = document.getElementById('gameContainer');
        const message = result === 'player1' ? '🎉 You Won! 🎉' : '😔 Bot Won!';
        
        gameContainer.innerHTML = `
            <div class="game-over-screen">
                <h2>${message}</h2>
                <div class="score-summary">
                    <div>Final Score - You: ${gameState.player1Score}, Bot: ${gameState.player2Score}</div>
                    <div>Games Played: ${gameState.gameCount}</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-primary" onclick="Battleship.init()">Play Again</button>
                    <button class="btn btn-secondary" onclick="GameManager.backToGames()">Back to Games</button>
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
        
        // Admin button event listeners
        const manageAdsBtn = document.getElementById('manageAdsBtn');
        const headerCodesBtn = document.getElementById('headerCodesBtn');
        const siteConfigBtn = document.getElementById('siteConfigBtn');
        const userMgmtBtn = document.getElementById('userMgmtBtn');
        
        if (manageAdsBtn) manageAdsBtn.addEventListener('click', AdminManager.showManageAds);
        if (headerCodesBtn) headerCodesBtn.addEventListener('click', AdminManager.showHeaderCodes);
        if (siteConfigBtn) siteConfigBtn.addEventListener('click', AdminManager.showSiteConfig);
        if (userMgmtBtn) userMgmtBtn.addEventListener('click', AdminManager.showUserMgmt);
    },
    
    showLogin: () => {
        const modal = document.getElementById('adminLoginModal');
        if (modal) modal.style.display = 'block';
        const form = document.getElementById('adminLoginForm');
        if (form && !AdminManager._loginBound) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('adminUsername').value;
                const password = document.getElementById('adminPassword').value;
                
                if (username === ADMIN_ACCESS.u && password === ADMIN_ACCESS.p) {
                    isAdmin = true;
                    AdminManager.hideLoginModal();
                    AdminManager.showBackofficeModal();
                    Utils.showNotification('Admin access granted!', 'success');
                } else {
                    Utils.showNotification('Invalid credentials!', 'error');
                }
            });
            AdminManager._loginBound = true;
        }
    },
    
    hideLoginModal: () => {
        const modal = document.getElementById('adminLoginModal');
        if (modal) modal.style.display = 'none';
    },
    
    showBackofficeModal: () => {
        const modal = document.getElementById('adminBackofficeModal');
        if (modal) modal.style.display = 'block';
        AdminManager.refreshStats();
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
    
    // Unique visitors
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
    container.innerHTML = `
        <h3>Ad Management</h3>
        <div class="form-group">
            <label>Top Ad:</label>
            <textarea id="ad_top" placeholder="Enter HTML/JavaScript code...">${AdManager.load().top || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Left Sidebar Ad:</label>
            <textarea id="ad_left" placeholder="Enter HTML/JavaScript code...">${AdManager.load().left || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Right Sidebar Ad:</label>
            <textarea id="ad_right" placeholder="Enter HTML/JavaScript code...">${AdManager.load().right || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Bottom Ad:</label>
            <textarea id="ad_bottom" placeholder="Enter HTML/JavaScript code...">${AdManager.load().bottom || ''}</textarea>
        </div>
        <button id="saveAdsBtn" class="btn btn-primary">Save Ads</button>
    `;
    
    const saveBtn = document.getElementById('saveAdsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
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
    container.innerHTML = `
        <h3>Header Verification Codes</h3>
        <div class="form-group">
            <label>Header Codes (Google Analytics, etc.):</label>
            <textarea id="headerCodes" placeholder="Paste your header verification codes here...">${localStorage.getItem('rcb_header_codes') || ''}</textarea>
        </div>
        <button id="saveHeaderCodesBtn" class="btn btn-primary">Save Codes</button>
    `;
    
    const saveBtn = document.getElementById('saveHeaderCodesBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const key = 'rcb_header_codes';
            const txt = document.getElementById('headerCodes').value;
            localStorage.setItem(key, txt);
            AdminManager.injectHeaderCodes();
            Utils.showNotification('Header codes saved and injected.', 'success');
        });
    }
};

AdminManager.injectHeaderCodes = () => {
    const key = 'rcb_header_codes';
    const txt = localStorage.getItem(key) || '';
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
        <div class="form-group">
            <label>Quick Theme Switch:</label>
            <div class="theme-buttons">
                <button id="themeLight" class="btn btn-secondary">Light Theme</button>
                <button id="themeDark" class="btn btn-secondary">Dark Theme</button>
            </div>
        </div>
        <div class="form-group">
            <button id="resetLocalBtn" class="btn btn-danger">Reset Local Data</button>
        </div>
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
    container.innerHTML = `
        <h3>User Management</h3>
        <div class="form-group">
            <label>Update Display Name:</label>
            <input type="text" id="updateNameInput" placeholder="Enter new display name..." value="${NameManager.getName()}">
            <button id="updateNameBtn" class="btn btn-primary">Update Name</button>
        </div>
    `;
    
    const updateBtn = document.getElementById('updateNameBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            const input = document.getElementById('updateNameInput');
            if (input && input.value.trim()) {
                NameManager.setName(input.value);
                UIManager.updateDisplayName();
                Utils.showNotification('Display name updated.', 'success');
            }
        });
    }
};

// Premium Splash Screen Manager
const SplashManager = {
    progress: 0,
    currentTip: 0,
    loadingInterval: null,
    tipInterval: null,
    
    tips: [
        'Loading chat system...',
        'Initializing messaging...',
        'Setting up user interface...',
        'Preparing chat features...',
        'Loading theme preferences...',
        'Optimizing performance...',
        'Almost ready...'
    ],
    
    init: () => {
        // Set up event listeners
        const enterBtn = document.getElementById('enterBtn');
        const skipBtn = document.getElementById('skipBtn');
        
        
        if (enterBtn) {
            enterBtn.addEventListener('click', SplashManager.enterApp);
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', SplashManager.skipLoading);
        }
        
        // Start the loading simulation
        SplashManager.startLoading();
    },
    
    startLoading: () => {
        
        // Simulate realistic loading progress
        const loadingSteps = [
            { progress: 15, tip: 0, delay: 800 },
            { progress: 35, tip: 1, delay: 1200 },
            { progress: 55, tip: 2, delay: 1000 },
            { progress: 75, tip: 3, delay: 1100 },
            { progress: 90, tip: 4, delay: 900 },
            { progress: 95, tip: 5, delay: 700 },
            { progress: 100, tip: 6, delay: 500 }
        ];
        
        let currentStep = 0;
        
        const updateProgress = () => {
            if (currentStep >= loadingSteps.length) {
                SplashManager.completeLoading();
                return;
            }
            
            const step = loadingSteps[currentStep];
            SplashManager.updateProgress(step.progress, step.tip);
            currentStep++;
            
            setTimeout(updateProgress, step.delay);
        };
        
        // Start the loading sequence
        setTimeout(updateProgress, 500);
    },
    
    updateProgress: (progress, tipIndex) => {
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const statusText = document.getElementById('statusText');
        const progressTips = document.getElementById('progressTips');
        const progressTrack = document.querySelector('.progress-track');
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        if (progressPercent) {
            progressPercent.textContent = Math.round(progress) + '%';
        }
        
        if (progressTrack) {
            progressTrack.setAttribute('aria-valuenow', Math.round(progress));
        }
        
        if (tipIndex !== undefined && SplashManager.tips[tipIndex]) {
            const tip = SplashManager.tips[tipIndex];
            if (progressTips) {
                progressTips.innerHTML = `<span class="tip">${tip}</span>`;
            }
            if (statusText) {
                statusText.textContent = tip;
            }
        }
        
        // Enable enter button at 100%
        if (progress >= 100) {
            const enterBtn = document.getElementById('enterBtn');
            if (enterBtn) {
                enterBtn.disabled = false;
                enterBtn.classList.add('pulse');
            }
        }
    },
    
    completeLoading: () => {
        const statusText = document.getElementById('statusText');
        const progressTips = document.getElementById('progressTips');
        
        if (statusText) {
            statusText.textContent = 'Ready to launch!';
        }
        
        if (progressTips) {
            progressTips.innerHTML = '<span class="tip">Welcome to RevChattyBox!</span>';
        }
        
        // Add completion animation
        const enterBtn = document.getElementById('enterBtn');
        if (enterBtn) {
            enterBtn.classList.add('ready');
        }
    },
    
    enterApp: () => {
        const splash = document.getElementById('splash');
        if (splash) {
            // Add exit animation
            splash.style.opacity = '0';
            splash.style.transform = 'scale(0.9)';
            splash.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                splash.style.display = 'none';
                // Ask for name if not set
                if (!NameManager.getName()) {
                    NameManager.showModal();
                }
            }, 500);
        }
    },
    
    skipLoading: () => {
        // Skip directly to completion
        SplashManager.updateProgress(100, 6);
        SplashManager.completeLoading();
        
        // Auto-enter after a short delay
        setTimeout(() => {
            SplashManager.enterApp();
        }, 1000);
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize metrics first
    Metrics.load();
    
    // Initialize UI components
    UIManager.init();
    
    ChatManager.init();
    EmojiManager.init();
    GameManager.init();
    AdminManager.init();
    AdStats.initImpressions();
    AdManager.renderSlots();
    AdminManager.injectHeaderCodes();
    // Enhanced splash screen with premium loading experience
    SplashManager.init();
    
    // User count is now handled by ChatSync.updateUserPresence()
    
    Utils.showNotification('RevChattyBox loaded successfully!', 'success');
});