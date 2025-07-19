import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";  // ✅ Correct import (capital S)

// Create express app and HTTP server
const app = express();
const httpServer = http.createServer(app);  // ✅ Avoided reusing 'server' name

// Initialize socket.io server
export const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket) => {  // ✅ socket param added
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all connected
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.json({ limit: '4mb' }));
app.use(cors());

// Route setup
app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);  // ✅ Fixed: was "application" before

// Connect MongoDB
await connectDB();

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log("server is running on port: " + PORT));
