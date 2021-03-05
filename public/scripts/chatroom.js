var socket = io();

let chatForm = document.getElementById("chat-form")
let chatInput = document.getElementById("chat-input")
let messages = document.getElementById("messages")
let messagesContainer = document.getElementById("messages-container")

chatForm.addEventListener("submit", (event) => {
    event.preventDefault()

    //send message to server
    if (chatInput.value) {
        console.log("sending chat message " + chatInput.value + " to the server")
        socket.emit("chat message", chatInput.value) // arg1: vad vi vill att eventet ska heta, arg2: vad vi vill skcika med
    }
    chatInput.value = "";
})

//recieve broadcasted messages from server:
socket.on("chat message", message => { // arg1: what the event is called on the server, arg2: the message
    console.log("recieved the broadcasted message " + message)
    let newMessage = document.createElement("li")
    newMessage.innerText = message;
    messages.append(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

})

