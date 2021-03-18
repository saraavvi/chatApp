const express = require("express");
const router = express.Router();
const User = require("../models/user")
const { isLoggedIn } = require("../middlewares/isloggedin")
const multer = require("multer")
const fs = require("fs");
const path = require("path")
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

const uploadPath = "uploads/"; // flrekommer på flera ställen så skapar den här constanten.

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
        files: 1, //begränsning för hur många filer man får ladda upp
        fieldSize: 2 * 1024 * 1024 // begränsning för hur stora filern får vara. (max 2mb här)
    },
    fileFilter: (request, file, callback) => { //  gör så att man bara ska kunna ladda upp filer med vissa filendelser 
        if (!file.originalname.match(/\.(jpg|png|gif)$/)) {
            callback(new Error("only images allowed"), false)
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
//bilden sparas i uploads nu. todo: fixa så att referens till bilden sparas i databasen.
router.post("/upload-picture", upload.single("picture"), async (req, res) => {
    try {
        console.log(req.file)
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