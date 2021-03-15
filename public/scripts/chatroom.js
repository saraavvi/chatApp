var socket = io();

let chatForm = document.getElementById("chat-form")
let chatInput = document.getElementById("chat-input")
let messages = document.getElementById("messages")


let username = document.getElementById("this_user").innerText;

// get room id from url 
let url_array = document.location.href.split('/')
let id = url_array[url_array.length - 1];

socket.emit("join room", {
    id: id,
    username: username
})

chatForm.addEventListener("submit", (event) => {
    event.preventDefault()
    //send message to server
    if (chatInput.value) {
        let message = chatInput.value
        socket.emit("chat message", {
            message: message
        })
    }
    chatInput.value = "";
})


//recieve broadcasted messages from server:
socket.on("chat message", msgData => { // arg1: what the event is called on the server, arg2: the message
    console.log("recieved the broadcasted message " + msgData.msg)
    let newMessage = document.createElement("li")
    let chatMessage = document.createElement("div")
    let sender = document.createElement("b")
    chatMessage.innerText = msgData.msg;
    sender.innerText = msgData.sender;
    newMessage.append(sender);
    newMessage.append(chatMessage);
    messages.append(newMessage);


})

