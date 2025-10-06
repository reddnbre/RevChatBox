# 🎮 RevChatBox - Real-time Gaming Chat Hub

A beautiful, real-time chat application with games, built with Socket.IO and modern web technologies.

## ✨ Features

- 🚀 **Real-time messaging** - Instant chat between multiple users
- 🎮 **4 Built-in games** - Hangman, Connect 4, War, Battleship
- 🌙 **Day/Night themes** - Beautiful glassmorphism design
- 😊 **Emoji picker** - Add emojis to your messages
- 👥 **User presence** - See who's online
- 💬 **Room support** - Create different chat rooms
- 📱 **Responsive design** - Works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed on your system

### Installation & Setup

1. **Clone or download the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - Go to `http://localhost:3001`
   - Open multiple tabs/windows to test real-time chat
   - Use `?room=alpha` for different rooms

## 🎯 How to Use

### Basic Chat
1. **Enter your name** when prompted
2. **Type messages** and press Enter or click Send
3. **See real-time updates** from other users

### Games
1. Click the **"Game Hub"** button in the header
2. Choose from:
   - 🎯 **Hangman** - Guess the word letter by letter
   - 🔴 **Connect 4** - Drop discs to win
   - 🃏 **War** - Card battle game
   - ⚓ **Battleship** - Strategic naval warfare

### Rooms
- **Default room:** `global`
- **Custom rooms:** Add `?room=yourroomname` to the URL
- **Multiple rooms:** Each room has separate chat history

### Themes
- Click the **🌙/☀️** button to toggle day/night mode
- Your preference is automatically saved

## 🛠️ Development

### File Structure
```
RevChatBox/
├── index.html          # Main application
├── script.js           # Game logic and UI management
├── revchattybox-modern.css  # Main stylesheet
├── server.js           # Socket.IO server
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

### Key Technologies
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express, Socket.IO
- **Styling:** CSS Grid, Flexbox, Glassmorphism effects
- **Real-time:** WebSocket connections via Socket.IO

### Customization

#### Adding New Games
1. Add game config to `CONFIG.GAMES` in `script.js`
2. Implement game logic in `GameManager.loadGameContent()`
3. Add CSS styles for the game UI

#### Styling
- Main styles: `revchattybox-modern.css`
- CSS variables for easy theme customization
- Glassmorphism effects with backdrop-filter

#### Server Configuration
- Port: Change `PORT` in `server.js` (default: 3001)
- CORS: Update origins in server.js for production
- Message history: Adjust `MAX_HISTORY` constant

## 🌐 Production Deployment

### Heroku
1. Add `Procfile`: `web: node server.js`
2. Set environment variables if needed
3. Deploy via Git

### Vercel/Netlify
- These are for static sites - you'll need a Node.js hosting service
- Consider Railway, Render, or DigitalOcean App Platform

### Self-hosted
1. Install Node.js on your server
2. Clone repository and run `npm install`
3. Use PM2 for process management: `pm2 start server.js`
4. Set up reverse proxy with Nginx

## 🔧 Troubleshooting

### Common Issues

**"Cannot connect to server"**
- Make sure the server is running (`npm start`)
- Check that port 3001 is not blocked
- Verify Node.js version (16+)

**"Messages not appearing"**
- Check browser console for errors
- Ensure Socket.IO connection is established
- Try refreshing the page

**"Games not loading"**
- Check browser console for JavaScript errors
- Ensure all CSS files are loaded
- Verify JavaScript is enabled

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎉 Enjoy!

Have fun chatting and gaming! For issues or feature requests, please open an issue on GitHub.
