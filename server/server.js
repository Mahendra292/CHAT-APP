import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
  cors: {
    // --- UPDATE THIS SECTION FOR SOCKET.IO ---
    origin: [
      "http://localhost:5173", // Your local client
      "https://chat-app-client-6wl7.onrender.com" // <-- ADD YOUR DEPLOYED CLIENT URL HERE
    ],
    credentials: true
  },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.json({ limit: '4mb' }));

// --- UPDATE THIS SECTION FOR EXPRESS CORS ---
const allowedOrigins = [
  'http://localhost:5173', // Your client's local development URL
  'https://chat-app-client-6wl7.onrender.com' // <-- ADD YOUR DEPLOYED CLIENT URL HERE
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// --- END CORRECTED CORS CONFIGURATION ---


// Routes
app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);


// Connect DB and start server
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on port: " + PORT));

export default server;