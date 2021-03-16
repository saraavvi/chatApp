// TODO: make all names "buttons" that triggers modal where you can se info about the user and set up a private chat. + go their profile page?

fetch("/users")
    .then(response => response.json())
    .then(users => {
        let usersContainer = document.getElementById("users")
        for (let user of users) {
            let userElement = `<div> <button type="button" data-toggle="modal" data-target="#userModal">${user.username}</button> </div>`
            usersContainer.innerHTML += userElement;
        }
    })