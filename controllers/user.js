const User = require("../models/user");

module.exports.getSignUpRequest = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signUpForm = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "User registered");
            res.redirect("/listings");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.getLoginRequest = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.loginForm = async (req, res) => {
    req.flash("success", "Welcome back to ApnaGhar");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "logged out!!")
        res.redirect("/listings");
    });
};