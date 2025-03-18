import express from "express";
import {
	register,
	sendOTP,
	resendOTP,
	verifyOTP,
	login,
	logout,
} from "../controllers/auth.controllers.js";

// express.Router class is used to create modular and mountable route handlers. It is a complete middleware and routing system, which is why it is often referred to as a "mini-app". In simple words, it is used to group related routes together, allowing you to create multiple route groups for specific parts of your application. This improves code organization and makes your Express app more scalable.
const router = express.Router();

router.post("/signup", register, sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/logout", logout);

export default router;
