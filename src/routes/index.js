import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import conversationRoutes from "./conversation.routes.js";
import messageRoutes from "./message.routes.js";

// express.Router class is used to create modular and mountable route handlers. It is a complete middleware and routing system, which is why it is often referred to as a "mini-app". In simple words, it is used to group related routes together, allowing you to create multiple route groups for specific parts of your application. This improves code organization and makes your Express app more scalable.
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/conversation", conversationRoutes);
router.use("/message", messageRoutes);

export default router;
