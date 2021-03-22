
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
            window.location.href = "/chat"
        })
})

let deleteRoomBtn = document.getElementsByClassName("delete_btn")
console.log(deleteRoomBtn)
for (let btn of deleteRoomBtn) {
    btn.addEventListener("click", (e) => {
        e.preventDefault()
        let deletedRoom = btn.name
        fetch(`/chat/${deletedRoom}`, {
            method: "DELETE"
        })
            .then(response => { })
            .then(data => {
                window.location.href = "/chat"
            })
    })
}




// fetch("/users")
//     .then(response => response.json())
//     .then(users => {
//         let usersContainer = document.getElementById("users")
//         for (let user of users) {
//             let userElement = `<div>${user.username}</div>`
//             usersContainer.innerHTML += userElement;
//         }
//     })