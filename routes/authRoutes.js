const express = require("express");
const authControllers = require("../controllers/authControllers");

// Creating object of Router().
const router = express.Router();

router.post("/signup", authControllers.register, authControllers.sendOTP);
router.post("/resend-otp", authControllers.resendOTP);
router.post("/verify-otp", authControllers.verifyOTP);
router.post("/login", authControllers.login);

module.exports = router;
