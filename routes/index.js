const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

// Creating object of Router().
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

module.exports = router;
