// Importowanie modułów
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
let users = {}; //użytkownicy
let rooms = {};

let temp_name;

// serwowanie plików statycznych z katalogu 'public'
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
        // sprawdzenie czy użytkownik o podanej nazwie już istnieje
        if(users[username]){
            // wysłanie informacji o błędzie
            io.to(socket.id).emit("wrong-username", username)
            console.log("Użytkownik o nazwie " + username + " już istnieje")
        }
        else {
            // dodanie użytkownika do listy
            users[username] = {
                id:socket.id,
                room: "public",
            }

            // wysłanie informacji o poprawnym zalogowaniu
            io.to(socket.id).emit("correct-username", username)
        }
    });

    // dołączanie do pokoju
    socket.on("join-room",(clientroom, username)=>{


        // dołączenie do pokoju
        socket.join(clientroom)

        // dodanie użytkownika do listy
        if (!rooms[clientroom]) {
            rooms[clientroom] = []
        }
        rooms[clientroom].push(username)
        if (users[username]) {
            users[username].room = clientroom
        }


        socket.to(clientroom).emit("send-message", "Użytkownik dołączył do pokoju")
        io.to(clientroom).emit("room-list",rooms[clientroom])

        console.log("Użytkownik " + username + " dołączył do pokoju " + clientroom)})


    socket.on("leave-room" , (room,username)=>{
        if(rooms[room].includes(username)){
            // opuszczenie pokoju
            rooms[room] = rooms[room].filter(user => user !== username)
            console.log("Użytkownik " + username + " opuścił pokój " + room)
            // wysłanie nowej listy uzytkowników w pokoju
            io.to(room).emit("room-list",rooms[room])
        }
    })

    // wysyłanie wiadomości
    socket.on("send-message", (message, username,room) => {
        // wysłanie wiadomości do wszystkich połączonych użytkowników oprócz osoby która wysyła.
        socket.broadcast.to(room).emit("message", message, username)
    })

    // wysyłanie informacji o pisaniu
    socket.on("user-is-typing", (username, room)=>{
        socket.to(room).emit("user-is-typing-display",username)
    })

    socket.on("user-stopped-typing" ,(username,room)=>{
        socket.to(room).emit("user-stopped-typing-display",username)
    })

    // rozłączenie użytkownika
    socket.on("disconnect", () => {
        // usunięcie użytkownika z listy
        for (let name in users) {
            if (users[name].id === socket.id) {
                temp_name = name;
                // opuszczenie pokoju
                rooms[users[name].room] = rooms[users[name].room].filter(user => user !== name)
                io.to(users[name].room).emit("room-list",rooms[users[name].room])
                // wysłanie informacji o rozłączeniu
                delete users[name];
                break;
            }
        }
    })
}))


// uruchomienie serwera na porcie 3000
server.listen(3000, () => {
    console.log("Serwer uruchomiony na http://localhost:3000");
})
