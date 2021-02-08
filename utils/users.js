const users = []

var addUser = ({id, username, room}) => {
    // Clean the data 
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: "Username and room are required!",
        }
    }

    // Check existing user
    const existingUser = users.find(user => {
        return user.room === room && user.username === username;
    })

    // Validate username
    if (existingUser) return {
        error: "Username already taken",
    };

    // Store user
    users.push({id, username, room});
    return {
        user: {id, username, room},
    };

}

var removeUser = (id) => {
    let index = users.findIndex(user => user.id === id);    
    if (index !== -1) return {user: users.splice(index, 1)};
    return {
        error: "User not found",
    }
}

var getUser = (id) => {    
    return users.find(user => user.id === id);
}

var getUserInRoom = (room) => {
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom,
}