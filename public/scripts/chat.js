let newRoom = document.getElementById("new_room")
let addRoomBtn = document.getElementById("add_room")
addRoomBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let room = { name: newRoom.value }
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
