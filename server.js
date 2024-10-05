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

    // dodanie użytkownika
    socket.on("log-in", (username) => {
        if(users[username]){
            // wysłanie informacji o błędzie
            socket.to(socket.id).emit("wrong-username", username)
        }
        else {
            // dodanie użytkownika do listy
            users[username] = {
                id:socket.id
            }

            // wysłanie informacji o poprawnym zalogowaniu
            socket.to(socket.id).emit("correct-username", username)
        }
    });

    // dołączanie do pokoju
    socket.on("join-room",room=>{

        // dołączenie do pokoju
        socket.join(room)
        //socket.to(room).emit("send-message", "Użytkownik dołączył do pokoju")
    })

    // wysyłanie wiadomości
    socket.on("send-message", (message, username,room) => {
        // wysłanie wiadomości do wszystkich połączonych użytkowników oprócz osoby która wysyła.
        socket.broadcast.to(room).emit("message", message, username)
    })


}))


// start servera
server.listen(3000, () => {
    console.log("Serwer uruchomiony na http://localhost:3000");
})