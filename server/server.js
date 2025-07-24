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
    origin: "*", // For local testing, keeping this as '*' for now.
                 // For production, change this to your client's specific Render URL (e.g., 'https://your-client-app.onrender.com')
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

// --- CORRECTED CORS CONFIGURATION FOR EXPRESS ROUTES ---
// This is crucial for fixing the 'wildcard * with credentials' error.
const allowedOrigins = [
  'http://localhost:5173', // Your client's local development URL
  // IMPORTANT: Add your deployed client's Render URL here once it's live.
  // Example: 'https://your-client-app.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl requests)
    // or if the origin is in our allowed list.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // This allows cookies/auth headers to be sent
}));
// --- END CORRECTED CORS CONFIGURATION ---


// Routes
app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);


// Connect DB and start server
await connectDB();

// --- CORRECTED SERVER LISTEN BLOCK ---
// This block must be outside any 'if (process.env.NODE_ENV !== "production")'
// to ensure the server listens on Render.
const PORT = process.env.PORT || 5000; // Use Render's assigned port or 5000 for local dev
server.listen(PORT, () => console.log("Server is running on port: " + PORT));
// --- END CORRECTED SERVER LISTEN BLOCK ---


// export server for vercel (this export is not directly used by Render for starting the app)
export default server;