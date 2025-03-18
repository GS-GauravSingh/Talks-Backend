import express from "express";
import { isUserAuthenticated } from "../controllers/auth.controllers.js";
import {
	getMe,
	updateMe,
	updateAvatar,
	updatePassword,
	getUsers,
} from "../controllers/user.controllers.js";

// express.Router class is used to create modular and mountable route handlers. It is a complete middleware and routing system, which is why it is often referred to as a "mini-app". In simple words, it is used to group related routes together, allowing you to create multiple route groups for specific parts of your application. This improves code organization and makes your Express app more scalable.
const router = express.Router();

router.get("/me", isUserAuthenticated, getMe);
router.get("/all", isUserAuthenticated, getUsers);
router.patch("/me", isUserAuthenticated, updateMe);
router.patch("/avatar", isUserAuthenticated, updateAvatar);
router.patch("/password", isUserAuthenticated, updatePassword);

export default router;
