if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash")
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes")
const profileRoutes = require("./routes/profileRoutes")
const User = require("./models/user")
const Room = require("./models/room")
const Message = require("./models/message");
const { Socket } = require("socket.io");
const app = express();
const http = require("http").Server(app)
const io = require("socket.io")(http)
const { userJoins, userLeaves, getUsers } = require("./utils/users")

app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/public", express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/chatApp';

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("mongo is connected")
    })
    .catch(err => {
        console.log("Error in mongo connection")
        console.log(err)
    })


app.engine("ejs", ejsMate)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(flash())

const secret = process.env.SECRET || "secret";

const store = new MongoStore({
    url: dbUrl,
    secret
    // touchAfter: 24 * 60 * 60
})

store.on("error", function (err) {
    console.log("store error.. ", err)
})

const sessionConfig = { // hur fixar man expiration för kakan?
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
}
app.use(session(sessionConfig))
app.use(passport.initialize()) // required to initialize passport 
app.use(passport.session()) // for user to stay logged in and not have to login on every request
passport.use(new LocalStrategy(User.authenticate())); // use the local strategy. the authenticate-method comes from passport-local-mongoose
//store and unstore the user in the session. theese also comes from passport-local-mongoose:
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//using this middleware so the user and flash-message will be avaliable in all templates
app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.signedInUser = req.user;
    next();
})

app.use("/", userRoutes) // all routes for register, login, logout ... 
app.use("/chat", chatRoutes) // chat page and chat room routes.. 
app.use("/profile", profileRoutes) // profile page and file upload

app.get("/", (req, res) => { //landingpage
    res.render("landingpage")
})

//move sockets to a separate file later..?
io.on("connection", (socket) => {

    socket.on("join room", async (data) => {
        const room = await Room.findById(data.id)
        const roomid = data.id;
        const roomname = room.name
        const username = data.username;
        const user = await User.findOne({ username: username })
        const picture = user.profilePic;
        socket.join(roomname)

        //update online users when a user joins room 
        userJoins({ username: username, roomname: roomname, picture: picture })
        const users = getUsers(roomname)
        io.to(roomname).emit("joined user", users)

        //listening to incoming messages from clients
        socket.on("chat message", async data => {
            const chatmessage = data.message;
            const senderId = user._id;

            //save message to message collection:
            const newMsg = new Message({ chatmessage: chatmessage, sender: senderId })
            newMsg.save()

            //push this message to the array in room collection..
            Room.findByIdAndUpdate(roomid, { $push: { messages: newMsg._id } }, { useFindAndModify: false }, function (err, result) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log(result);
                }
            })

            //broadcast to all clients
            const msgData = { msg: data.message, sender: username, picture: picture, msgid: newMsg._id, senderId: senderId }
            io.to(roomname).emit("chat message", msgData)
        })

        //litening for a client deleting a message. 
        socket.on("delete message", async data => {
            const message = await Message.findById(data.deletedMessage);
            const user = await User.findOne({ username: data.username })

            // Need to be authorized.
            if (JSON.stringify(user._id) == JSON.stringify(message.sender)) {
                //broadcast to all clients so that it will be deleted "live" for everyone
                io.to(roomname).emit("delete message", data)
                //then delete it from the database aswell: (messages and rooms collection)
                Room.findByIdAndUpdate(roomid, { $pull: { messages: data.deletedMessage } },
                    { useFindAndModify: false },
                    function (err, result) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log(result);
                        }
                    })
                Message.findByIdAndDelete(data.deletedMessage,
                    function (err, result) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(result)
                        }
                    }
                )
            } else {
                console.log("you dont have the permission to do that")
            }
        })

        socket.on("disconnect", () => {
            //update online users when a user leaves room 
            userLeaves({ username: username, roomname: roomname })
            const users = getUsers(roomname)
            io.to(roomname).emit("user leaves", users)
        })
    })
})





http.listen(3000, () => {
    console.log("listening on 3000")
})
