import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect private routes
export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token is provided and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user without the password field
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized access" });
  }
};
