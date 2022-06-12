const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
// const io = new Server(server);
const io = new Server(server, {
    maxHttpBufferSize: 5e6 // 5MB
});
let last_100 = [];
let current_users = [];

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', (socket) => {
    // console.log('a user connected');

    socket.on('disconnect', () => {
        for (let i = 0; i < current_users.length; i++) {
            current_users = [];
        }
        io.emit('actives');
        // console.log('user disconnected');
    });
    socket.on('update username', (username, id) => {
        io.emit('update username', username, id)
    })
    socket.on('users', (usr, id) => {
        current_users.push({id: id, username: usr});
        io.emit('users', current_users);
    })
    socket.on('prev messages', (id) => {
        if (last_100.length > 0) {
            for (let i = 0; i < last_100.length; i++) {
                io.emit('prev messages', last_100[i].msg, last_100[i].file, last_100[i].usr, last_100[i].id, last_100[i].time, id, last_100[i].type);
            }
        }
    })
    socket.on('chat image', (file, msg, usr, id) => {
        let time = (new Date).getTime();
        if (last_100.length > 100) {
            last_100.splice(1, 1)
            let aux = JSON.stringify(last_100);
            last_100 = JSON.parse(aux);
        }
        last_100.push({file: file, msg: msg, usr: usr, id: id, time: time, type: "image"});
        io.emit('chat message', msg, file, usr, id, time, "image");
    })
    socket.on('chat message', (msg, usr, id) => {
        let time = (new Date).getTime();
        if (last_100.length > 100) {
            last_100.splice(1, 1)
            let aux = JSON.stringify(last_100);
            last_100 = JSON.parse(aux);
        }
        last_100.push({file: null, msg: msg, usr: usr, id: id, time: time, type: "message"});

        io.emit('chat message', msg, null, usr, id, time, "message");
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});