//protect chat route: need to be logged in to go here. Can check this with the passport-method isAuthenticated
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to be logged in")
        return res.redirect("/login")
    }
    next()
}