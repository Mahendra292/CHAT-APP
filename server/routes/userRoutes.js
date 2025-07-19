import express from "express";
import {
  signUp,            // ✅ matches export exactly (capital U)
  login,
  updateProfile,
  checkAuth,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();   // ✅ fixed capital 'R' in Router

userRouter.post("/signup", signUp);    // ✅ matches correctly
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;            
