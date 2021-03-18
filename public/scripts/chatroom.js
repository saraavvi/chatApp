var socket = io();

let chatForm = document.getElementById("chat-form")
let chatInput = document.getElementById("chat-input")
let messages = document.getElementById("messages")
let messagesContainer = document.getElementById("messages-container")
messages.scrollTop = messages.scrollHeight;

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
socket.on("chat message", msgData => {
    console.log("recieved the broadcasted message " + msgData.msg)
    let newMessage = document.createElement("li")
    newMessage.classList.add("message-item")
    let textContainer = document.createElement("div")
    let chatMessage = document.createElement("div")
    let sender = document.createElement("b")
    let time = ` ${new Date().toLocaleDateString("en-US")}, ${new Date().toLocaleTimeString("en-US")}`
    let pictureContainer = document.createElement("div")
    let picture = document.createElement("img")
    picture.classList.add("picture");
    picture.src = `/${msgData.picture}`;
    chatMessage.innerText = msgData.msg;
    sender.innerText = msgData.sender;
    pictureContainer.append(picture);
    pictureContainer.classList.add("messagepic-container")
    newMessage.append(pictureContainer);
    textContainer.append(sender);
    textContainer.append(time);
    textContainer.append(chatMessage);
    newMessage.append(textContainer)

    messages.append(newMessage);


})

