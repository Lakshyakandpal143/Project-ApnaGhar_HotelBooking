const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user");
const passport = require("passport");
const flash = require("connect-flash");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/user.js");

router.route("/signup")
    .get(userController.getSignUpRequest)
    .post(wrapAsync(userController.signUpForm));

router.route("/login")
    .get(userController.getLoginRequest)

    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(userController.loginForm));

router.get("/logout", userController.logout);

module.exports = router;