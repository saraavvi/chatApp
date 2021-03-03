const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users")

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("mongo is connected")
    })
    .catch(err => {
        console.log("Error in mongo connection")
        console.log(err)
    })

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", userRoutes) // all routes for register, login, logout ... 

app.get("/", (req, res) => { //landingpage
    res.render("landingpage")
})

app.get("/chat", (req, res) => {
    res.render("chat")
})

app.listen(3000, () => {
    console.log("listening on 3000")
})