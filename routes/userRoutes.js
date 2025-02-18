const express = require("express");
const userControllers = require("../controllers/userControllers");
const authControllers = require("../controllers/authControllers");

// Creating object of Router().
const router = express.Router();

router.get("/me", authControllers.isUserAuthorized, userControllers.getMe);

router.patch("/me", authControllers.isUserAuthorized, userControllers.updateMe);

router.patch(
    "/avatar",
    authControllers.isUserAuthorized,
    userControllers.updateAvatar
);

router.patch(
    "/password",
    authControllers.isUserAuthorized,
    userControllers.updatePassword
);

router.get(
    "/users",
    authControllers.isUserAuthorized,
    userControllers.getUsers
);

router.post(
    "/start-conversations",
    authControllers.isUserAuthorized,
    userControllers.startConversation
);

router.get(
    "/conversations",
    authControllers.isUserAuthorized,
    userControllers.getConversations
);

module.exports = router;
