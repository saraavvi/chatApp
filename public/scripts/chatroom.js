var socket = io();

let chatForm = document.getElementById("chat-form")
let chatInput = document.getElementById("chat-input")
let messages = document.getElementById("messages")
let messagesContainer = document.getElementById("messages-container")
let room = document.getElementById("room_name")

//get the room name from the url 
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomname = urlParams.get('room');

room.innerText = roomname;

socket.emit("join room", {
    roomname: roomname
})

chatForm.addEventListener("submit", (event) => {
    event.preventDefault()

    //send message to server
    if (chatInput.value) {
        let message = chatInput.value
        console.log("sending chat message " + chatInput.value + " to the server")
        socket.emit("chat message", {
            message: message,// arg1: vad vi vill att eventet ska heta, arg2: vad vi vill skcika med, (ett objekt)
            roomname: roomname
        })
    }
    chatInput.value = "";
})

//recieve broadcasted messages from server:
socket.on("chat message", data => { // arg1: what the event is called on the server, arg2: the message
    console.log("recieved the broadcasted message " + data)
    let newMessage = document.createElement("li")
    newMessage.innerText = data;
    messages.append(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

})

