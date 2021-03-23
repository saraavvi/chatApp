var socket = io();
let chatForm = document.getElementById("chat-form")
let chatInput = document.getElementById("chat-input")
let messages = document.getElementById("messages")
let messagesContainer = document.getElementById("messages-container")
let userList = document.getElementById("user-list")
messages.scrollTop = messages.scrollHeight;
let username = document.getElementById("this_user").innerText;
let url_array = document.location.href.split('/') // get room id from url 
let id = url_array[url_array.length - 1];

//update online users in the dom when a user joins or leaves the room. 
function updateUserList(users) {
    //clear userlist first:
    const items = Array.from(document.querySelectorAll(".userItem"))
    items.forEach(item => {
        item.remove()
    })
    //prints out updated user list
    users.forEach(user => {
        const item = document.createElement("li")
        item.innerText = user.username;
        item.classList.add("userItem")
        userList.append(item)
    })
}

socket.emit("join room", {
    id: id,
    username: username
})


socket.on("joined user", users => {
    console.log("user has joined:")
    console.log(users)
    updateUserList(users)
})

socket.on("user leaves", users => {
    console.log("user has left:")
    console.log(users)
    updateUserList(users)
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

//recieve broadcasted messages from server and ads it to the dom:
socket.on("chat message", msgData => {
    console.log("recieved the broadcasted message " + msgData.msg)
    let newMessage = document.createElement("li")
    newMessage.id = msgData.msgid;
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

//emit to server that a messege will be deleted. 
let deleteMessageBtn = document.getElementsByClassName("delete_btn")
for (let btn of deleteMessageBtn) {
    btn.addEventListener("click", (e) => {
        e.preventDefault()
        let deletedMessage = btn.name;
        socket.emit("delete message", {
            deletedMessage: deletedMessage,
            username: username
        })
    })
}
//receives info about a messege being deleted and removes it from the dom. 
socket.on("delete message", data => {
    const messages = document.getElementsByClassName("message-item")
    // ta bort meddelandet från sidan:
    for (let message of messages) {
        if (message.id == data.deletedMessage) {
            message.remove()
        }
    }
})



