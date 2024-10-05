// Importowanie modułów
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {}; //użytkownicy

app.use(express.static('public'));


// ustawienie strony głównej
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
})


// po połączeniu z serwerem
io.on("connection", (socket => {
        socket.emit('display-id', socket.id);

        socket.on("log-in", (username) => {
            if(users[username]){
                socket.emit("wrong-username", username)
            }
            else {
                users[username] = {
                    id:socket.id
                }
                socket.emit("correct-username", username)
            }
        });
    // wysyłanie wiadomości
    socket.on("send-message", (message,username) => {
        // wysłanie wiadomości do wszystkich połączonych użytkowników oprócz osoby która wysyła.
        socket.broadcast.emit("send-message", message,username);
    })
}))


// start servera
server.listen(3000, () => {
    console.log("Serwer uruchomiony na http://localhost:3000");
})
