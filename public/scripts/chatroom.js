var socket = io();
let chatForm = document.getElementById("chat-form")
let chatInput = document.getElementById("chat-input")
let messages = document.getElementById("messages")
let messagesContainer = document.getElementById("messages-container")
let userList = document.getElementById("user-list")
let username = document.getElementById("this_user").innerText;
let url_array = document.location.href.split('/') // get room id from url 
let id = url_array[url_array.length - 1];
messages.scrollTop = messages.scrollHeight;

function deleteEmit() {
    //add eventlisteners to all deletebuttons. emit to server on click. 
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
}

deleteEmit()

//update online users in the dom when a user joins or leaves the room. 
function updateUserList(users) {
    const items = Array.from(document.querySelectorAll(".user-item"))
    items.forEach(item => {
        item.remove()
    })

    users.forEach(user => {
        const item = document.createElement("li")
        item.classList.add("user-item")

        const name = document.createElement("span")
        name.innerText = user.username;

        const picContainer = document.createElement("div")
        picContainer.classList.add("messagepic-container-small")

        const pic = document.createElement("img")
        pic.classList.add("picture-small");

        if (user.picture) {
            pic.src = user.picture;
        } else {
            pic.src = "/public/images/default.jpg";
        }

        picContainer.append(pic)
        item.append(picContainer)
        item.append(name)
        userList.append(item)
    })
}

socket.emit("join room", {
    id: id,
    username: username
})


socket.on("joined user", users => {
    updateUserList(users)
})

socket.on("user leaves", users => {
    updateUserList(users)
})

chatForm.addEventListener("submit", (event) => {
    event.preventDefault()
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

    let newMessage = document.createElement("li")
    newMessage.classList.add("message-item")
    newMessage.id = msgData.msgid;

    let pictureContainer = document.createElement("div")
    pictureContainer.classList.add("messagepic-container")

    let picture = document.createElement("img")
    picture.classList.add("picture");
    if (msgData.picture != null) {
        picture.src = `/${msgData.picture}`;
    } else {
        picture.src = "/public/images/default.jpg";
    }

    let textContainer = document.createElement("div")
    textContainer.classList.add("message-container")

    let senderDateContainer = document.createElement("div")
    senderDateContainer.classList.add("sender-date-container")

    let sender = document.createElement("span")
    sender.classList.add("item-sender")
    sender.innerText = msgData.sender;

    let time = document.createElement("span")
    time.classList.add("item-date")
    time.innerText = ` ${new Date().toLocaleDateString("en-US")}, ${new Date().toLocaleTimeString("en-US")}`


    let chatMessage = document.createElement("div")
    chatMessage.classList.add("item-text")
    chatMessage.innerText = msgData.msg;

    let buttonContainer = document.createElement("div")
    buttonContainer.classList.add("delete-btn-container")

    pictureContainer.append(picture);
    senderDateContainer.append(sender)
    senderDateContainer.append(time)
    textContainer.append(senderDateContainer)
    textContainer.append(chatMessage)
    newMessage.append(pictureContainer);

    if (msgData.sender == username) {
        let deleteBtn = document.createElement("input")
        deleteBtn.classList.add("delete_btn", "hidden")
        deleteBtn.type = "button"
        deleteBtn.name = msgData.msgid
        deleteBtn.value = "x"
        buttonContainer.append(deleteBtn)
    }
    newMessage.append(textContainer)
    newMessage.append(buttonContainer)
    messages.append(newMessage);
    deleteEmit()
})

//receives info about a messege being deleted and removes it from the dom. 
socket.on("delete message", data => {
    const messages = document.getElementsByClassName("message-item")
    for (let message of messages) {
        if (message.id == data.deletedMessage) {
            message.remove()
        }
    }
})



