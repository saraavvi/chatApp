const express = require("express");
const router = express.Router();
const User = require("../models/user")
const { isLoggedIn } = require("../middlewares/isloggedin")
const multer = require("multer")
const { storage } = require("../cloudinary");
const { cloudinary } = require("../cloudinary");
const upload = multer({ storage });
const path = require("path")
const methodOverride = require('method-override')
const AppError = require("../utils/AppError");
const wrapAsync = require("../utils/wrapAsync")

router.use(methodOverride('_method'))


/**
 * a user can visit the profile to view settings page and edit them
 */
router.get("/:id", isLoggedIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!(id == req.user._id)) {
        throw new AppError("you dont have the permission to do view that page", 401);
    }
    res.render("profile", { user })
}))

/**
 * user can upload a profile pic. It will be stored on cloudinary 
 * and a reference will be stored in the database
 */
router.post("/upload-picture", isLoggedIn, upload.single("picture"), wrapAsync(async (req, res, next) => {
    if (req.file) {
        await User.findByIdAndUpdate(req.user._id,
            { profilePicUrl: req.file.path, profilePicName: req.file.filename }, { useFindAndModify: false }
        );
        res.redirect(`/profile/${req.user._id}`)
    }
}));

router.put("/update-username", isLoggedIn, wrapAsync(async (req, res, next) => {
    const { name } = req.body;
    await User.findByIdAndUpdate(req.user._id,
        { username: name }, { useFindAndModify: false }
    )
    req.flash("success", "Username updated, please log in again with ypur new username")
    res.redirect("/login")
}));

router.put("/update-email", isLoggedIn, wrapAsync(async (req, res, next) => {
    const { email } = req.body;
    await User.findByIdAndUpdate(req.user._id,
        { email: email }, { useFindAndModify: false },
        function (err, result) {
            if (err) {
                return next(new AppError("email not available", 404));
            } else {
                console.log(result)
            }
        }
    )
    req.flash("success", "Email updated")
    res.redirect(`/profile/${req.user._id}`);
}));

router.delete("/delete-account", isLoggedIn, (req, res) => {
    const id = req.user._id;
    User.findByIdAndDelete(id,
        function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log(result)
            }
        }
    )
    res.redirect("/")
})

router.delete("/delete-picture", isLoggedIn, wrapAsync(async (req, res) => {
    console.log("deleting profile pic");
    const user = await User.findById(req.user._id);
    const deletedPictureName = user.profilePicName;

    cloudinary.uploader.destroy(deletedPictureName);

    await User.findByIdAndUpdate(req.user._id, { profilePicUrl: null, profilePicName: null }, { useFindAndModify: false },
        function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log(result)
            }
        }
    )
    res.redirect(`/profile/${req.user._id}`)
}));

/**
 * error handler middleware
 */
router.use((err, req, res, next) => {
    const { status = 500 } = err; // default status code
    if (!err.message) {
        err.message = "something went wrong";
    }
    req.flash("error", err.message)
    res.status(status).redirect(`/profile/${req.user._id}`)
})

module.exports = router