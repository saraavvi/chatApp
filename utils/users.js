//keeps track of all users in chat rooms so the user list is always updated.
const joinedUsers = []
function userJoins(data) {
    joinedUsers.push(data)
    return joinedUsers;
}

function userLeaves(data) {
    let index;
    for (let i = 0; i < joinedUsers.length; i++) {
        if (joinedUsers[i].username == data.username) {
            index = i;
        }
    }
    joinedUsers.splice(index, 1);
    return joinedUsers
}

function getUsers(roomname) {
    return joinedUsers.filter(user => user.roomname === roomname)
}

module.exports = {
    userJoins,
    userLeaves,
    getUsers
}
