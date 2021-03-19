const express = require("express");
const router = express.Router();
const User = require("../models/user")
const Message = require("../models/message")
const { isLoggedIn } = require("../middlewares/isloggedin")
const multer = require("multer")
const fs = require("fs");
const path = require("path")
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

const uploadPath = "uploads/";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: {
        files: 1,
        fieldSize: 2 * 1024 * 1024
    },
    fileFilter: (request, file, callback) => {
        if (!file.originalname.match(/\.(jpg|png|gif|JPG|jpeg)$/)) {
            return callback(new Error("only images allowed"), false)
        }
        callback(null, true)
    }
})

//a users profilepage
router.get("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    console.log(user.profilePic)
    res.render("profile", { user })
})

router.put("/update-username", async (req, res) => {
    console.log("updating username!")
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

router.put("/update-email", async (req, res) => {
    console.log("updating email!")
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


router.delete("/delete-account", (req, res) => {
    const { id } = req.user._id;
    console.log("deleting account")
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

//bilden sparas i uploads nu och bildens sökväg läggs till i databasen.
// todo: hantera error på nåt annat sätt än att det bara skrivs ut på sidan
router.post("/upload-picture", upload.single("picture"), async (req, res, next) => {
    try {
        const profileRef = req.file.path;
        if (profileRef) { // om allt gått bra:
            //lägg till bilden i databasen:
            const updatePicture = await User.findByIdAndUpdate(req.user._id,
                { profilePic: profileRef }, { useFindAndModify: false },
                function (err, result) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            )
            req.flash("success", "profile picture uploaded")
            res.redirect(`/profile/${req.user._id}`)
        } else {
            req.flash("error", "could not upload profile picture")
            res.redirect(`/profile/${req.user._id}`)
        }
    } catch (err) {
        console.log(err)
    }
})
//todo: 
//pic should be deletet from uploads as well 
//prob: when there is an error the file is still uploaded to uploads..
router.delete("/delete-picture", async (req, res) => {
    try {
        console.log("deleting profile pic");
        // const user = await User.findById(req.user._id);
        // const deletedPicture = user.profilePic;
        // console.log(deletedPicture)
        // fs.unlink(`/${deletedPicture}`, (err) => {
        //     if (err) {
        //         console.error(err)
        //     }
        // })
        await User.findByIdAndUpdate(req.user._id, { profilePic: null }, { useFindAndModify: false },
            function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(result)
                }
            }
        )
        req.flash("success", "Profile picture deleted")
        res.redirect(`/profile/${req.user._id}`)
    } catch (err) {
        console.log(err)
    }
})



module.exports = router