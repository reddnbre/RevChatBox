const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: ["http://localhost:3001", "http://localhost:5500", "http://127.0.0.1:3001", "http://127.0.0.1:5500", "https://*.revempire.net"],
    methods: ["GET", "POST"]
  } 
});
const PORT = process.env.PORT || 3001;

// --- simple in-memory history per room ---
const rooms = new Map(); // room -> { messages: [] }
const MAX_HISTORY = 200;
const now = () => Date.now();
const esc = s => String(s ?? "").slice(0, 1000).replace(/[&<>]/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c]));

function getRoom(r){ 
  if(!rooms.has(r)) rooms.set(r,{messages:[], users: new Set()}); 
  return rooms.get(r); 
}

function addMsg(r,m){ 
  const room = getRoom(r); 
  room.messages.push(m); 
  if(room.messages.length > MAX_HISTORY) {
    room.messages.splice(0, room.messages.length - MAX_HISTORY); 
  }
}

// --- serve static files ---
app.use(express.static('.'));

// --- serve main page ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API endpoints ---
app.get("/api/rooms", (req, res) => {
  const roomList = Array.from(rooms.keys()).map(room => ({
    name: room,
    messageCount: rooms.get(room).messages.length,
    userCount: rooms.get(room).users.size
  }));
  res.json(roomList);
});

// --- socket handlers ---
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.data = { name: "Anonymous", room: "global", lastMsgAt: 0, lastTypingAt: 0 };

  socket.on("join", ({room, name}) => {
    const oldRoom = socket.data.room;
    room = esc(room || "global"); 
    name = esc(name || "Anonymous");
    
    // Leave old room
    if (oldRoom && oldRoom !== room) {
      socket.leave(oldRoom);
      const oldRoomData = getRoom(oldRoom);
      oldRoomData.users.delete(socket.id);
      
      // Notify others in old room
      const leaveMsg = {
        type: "system", 
        text: `${socket.data.name} left`, 
        ts: now()
      };
      addMsg(oldRoom, leaveMsg);
      socket.to(oldRoom).emit("system", leaveMsg);
      socket.to(oldRoom).emit("user_count", oldRoomData.users.size);
    }
    
    // Join new room
    socket.join(room);
    socket.data.room = room;
    socket.data.name = name;
    
    const roomData = getRoom(room);
    roomData.users.add(socket.id);
    
    // Send history to new user
    socket.emit("history", roomData.messages);
    
    // Notify others in room
    const joinMsg = {
      type: "system", 
      text: `${name} joined`, 
      ts: now()
    };
    addMsg(room, joinMsg);
    socket.to(room).emit("system", joinMsg);
    socket.to(room).emit("user_count", roomData.users.size);
    socket.emit("user_count", roomData.users.size);
    
    console.log(`${name} joined room: ${room}`);
  });

  socket.on("chat:message", (raw) => {
    const text = esc(raw?.text || ""); 
    if (!text) return;
    
    // Rate limiting
    const t = now(); 
    if (t - (socket.data.lastMsgAt || 0) < 400) return; 
    socket.data.lastMsgAt = t;
    
    const message = { 
      type: "user", 
      name: socket.data.name, 
      text, 
      ts: t, 
      id: socket.id 
    };
    
    addMsg(socket.data.room, message);
    io.to(socket.data.room).emit("chat:message", message);
    
    console.log(`${socket.data.name} in ${socket.data.room}: ${text}`);
  });

  socket.on("typing", () => {
    const t = now(); 
    if (t - (socket.data.lastTypingAt || 0) < 1000) return; 
    socket.data.lastTypingAt = t;
    
    socket.to(socket.data.room).emit("typing", { 
      name: socket.data.name, 
      ts: t 
    });
  });

  socket.on("disconnect", () => {
    const {room, name} = socket.data || {};
    if (room) { 
      const roomData = getRoom(room);
      roomData.users.delete(socket.id);
      
      const leaveMsg = {
        type: "system", 
        text: `${name} left`, 
        ts: now()
      }; 
      addMsg(room, leaveMsg); 
      socket.to(room).emit("system", leaveMsg);
      socket.to(room).emit("user_count", roomData.users.size);
      
      console.log(`${name} left room: ${room}`);
    }
  });
});

// --- start server ---
server.listen(PORT, () => {
  console.log(`🚀 RevChatBox server running on http://localhost:${PORT}`);
  console.log(`📱 Open in multiple browsers/tabs to test real-time chat`);
  console.log(`🏠 Use ?room=alpha to test different rooms`);
});

// --- graceful shutdown ---
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down RevChatBox server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
