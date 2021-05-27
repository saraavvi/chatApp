//todo: fix authentication for profile routes
const express = require("express");
const router = express.Router();
const User = require("../models/user")
const { isLoggedIn } = require("../middlewares/isloggedin")
const multer = require("multer")
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const fs = require("fs");
const { unlink } = require('fs');
const path = require("path")
const methodOverride = require('method-override')


router.use(methodOverride('_method'))


router.post("/upload-picture", isLoggedIn, upload.single("picture"), async (req, res, next) => {
    console.log(req.file);
    try {
        if (req.file) {
            //lägg till bilden i databasen:
            const updatePicture = await User.findByIdAndUpdate(req.user._id,
                { profilePicUrl: req.file.path, profilePicName: req.file.filename }, { useFindAndModify: false },
                function (err, result) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            )
            res.redirect(`/profile/${req.user._id}`)
        } else {
            req.flash("error", "could not upload profile picture")
            res.redirect(`/profile/${req.user._id}`)
        }
    } catch (err) {
        console.log(err)
    }
})

router.get("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!(id == req.user._id)) {
        return res.end("you dont have the permission to do view that page")
    }
    res.render("profile", { user })
})

router.put("/update-username", isLoggedIn, async (req, res) => {
    const { name } = req.body;
    await User.findByIdAndUpdate(req.user._id,
        { username: name }, { useFindAndModify: false },
        function (err, result) {
            if (err) {
                req.flash("error", "username is not available")
                res.redirect(`/profile/${req.user._id}`);
                console.log(err)
            } else {
                console.log(result)
            }
        }
    )
    req.flash("success", "Username updated, please log in again with ypur new username")
    res.redirect("/login")
})

router.put("/update-email", isLoggedIn, async (req, res) => {
    const { email } = req.body;
    await User.findByIdAndUpdate(req.user._id,
        { email: email }, { useFindAndModify: false },
        function (err, result) {
            if (err) {
                req.flash("error", "there is already an account with this email")
                res.redirect(`/profile/${req.user._id}`);
                console.log(err)
            } else {
                console.log(result)
            }
        }
    )
    req.flash("success", "Email updated")
    res.redirect(`/profile/${req.user._id}`);
})

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

//pic is deleted from cloudinary and from database. 
router.delete("/delete-picture", isLoggedIn, async (req, res) => {
    try {
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
    } catch (err) {
        console.log(err)
    }
})

module.exports = router