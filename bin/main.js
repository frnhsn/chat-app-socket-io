const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const filterWords = require('bad-words');
const {generateMessage, generateLocationMessage} = require('../utils/messages');
const {addUser, removeUser, getUser, getUserInRoom} = require('../utils/users')

const app = express();
const server = http.createServer(app); 
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

io.on('connection', (socket) => {

    socket.on('join', ({username, room}, callback) => {

        let {error, user} = addUser({id: socket.id, username:username, room:room});

        if (error) return callback(error);
        
        socket.join(room);

        // Send welcome message to new joiner

        socket.emit('roomData', {name: room, users: getUserInRoom(user.room)});
        socket.emit('message', generateMessage(user.username,'Welcome ' + username));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${username} has joined!`));
        callback()

    }) 

    // Send message broadcast
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new filterWords();

        if (filter.isProfane(message)) {
            callback('Profane is not allowed!');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback('Message was delivered');

    });

    // Send location broadcast
    socket.on('sendLocation', (loc, callback) => {
        const user = getUser(socket.id);
        let url = `https://google.com/maps?q=${loc.latitude},${loc.longitude}`;
        io.to(user.room).emit("broadcastLocation", generateLocationMessage(user.username, url));
        callback('Location was delivered');
    })

    socket.on('disconnect', () => {
        let {error, user} = removeUser(socket.id);
        if(!error) io.to(user.room).emit('message', generateMessage(`${user.username} has left chat!`));
    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});


