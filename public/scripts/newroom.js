
let newRoom = document.getElementById("new_room")
let addRoomBtn = document.getElementById("add_room")
addRoomBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let room = { name: newRoom.value }
    // fetch and post to endpoint on the server: add a room to the room collection :)
    fetch("/chat", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(room)
    })
        .then(response => { })
        .then(data => {
            console.log("added new room")
            window.location.href = "/chat"
        })
})

// TODO: make all names "buttons" that triggers modal where you can se info about the user and set up a private chat. + go their profile page?
// move this to another script
fetch("/users")
    .then(response => response.json())
    .then(users => {
        let usersContainer = document.getElementById("users")
        for (let user of users) {
            console.log(user)
            let userElement = `<div>${user.username}</div>`
            usersContainer.innerHTML += userElement;
        }
    })