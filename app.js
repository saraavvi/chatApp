const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash")
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes")
const User = require("./models/user")
const Room = require("./models/room")
const Message = require("./models/message")
const app = express();
const http = require("http").Server(app)
const io = require("socket.io")(http)

app.use("/public", express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

mongoose.connect('mongodb://localhost:27017/chatApp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
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

const sessionConfig = { // hur fixar man expiration för kakan?
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}
app.use(session(sessionConfig))
app.use(passport.initialize()) // required to initialize passport 
app.use(passport.session()) // for user to stay logged in and not have to login on every request
passport.use(new LocalStrategy(User.authenticate())); // use the local strategy. the authenticate-method comes from passport-local-mongoose

//store and unstore the user in the session. theese also comes from passport-local-mongoose
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//to get access to the user we can use req.user: req.user property will be set to the authenticated user when login
//using this middleware because I want the user and flash-message to be avaliable in my templates
app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.signedInUser = req.user;
    next();
})

app.use("/", userRoutes) // all routes for register, login, logout ... 
app.use("/chat", chatRoutes) // chat page and chat root routes.. 

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
        socket.join(roomname)


        //listening to incoming messages, and boadcast
        socket.on("chat message", async data => {
            const msgData = { msg: data.message, sender: username }
            io.to(roomname).emit("chat message", msgData)
            const chatmessage = data.message;
            const user = await User.findOne({ username: username }).exec()
            const sender = user._id;

            //save message to message collection:
            const newMsg = new Message({ chatmessage: chatmessage, sender: sender })
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
        })
    })

    socket.on("disconnect", () => {
        console.log("user disconnected")
    })
})


http.listen(3000, () => {
    console.log("listening on 3000")
})
