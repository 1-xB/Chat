// Połącz z serwerem na porcie 3000
const socket = io("http://localhost:3000");

// inicjacja bloków z HTML
const warning = document.getElementById("warning");
const input = document.getElementById("message");
const chatDiv = document.getElementById("chat");
const user_info = document.getElementById("user-info");
const user_name_input = document.getElementById("nickName");
const room_input = document.getElementById("room");
const room_code_span = document.getElementById("room-code");
const notification_on_user_disconnect = document.getElementById("notification-disconnect");
let messageWidth;
let username; // nazwa użytkownika
let room = "public";
socket.emit("join-room",room)

let isLogged = false;
let isJoined = false;

// po połączeniu z serverem.
socket.on('connect' , ()=>{
    console.log(`Connected as: ${socket.id}`)
})

//ustawianie i zazpisywanie nazwy uzytkownika na serwerze
function addUser() {
    username = user_name_input.value;
    if (!username) {
        username = "guest";
    }
    user_info.textContent = `Username: ${username}`;
    socket.emit("log-in", username);
}
//wyswietlanie id uzytkownika
// socket.on('display-id',(id)=>{
//     user_id.textContent += id;
// })

//zejęta nazwa użytkownika
socket.on("wrong-username" ,(username)=>{
    warning.textContent = "Nazwa użytkownika już istnieje"
    username = null
    user_name_input.value = ""
    isLogged = false;
    isJoined = false;
})
//dobra nazwa użytkownika
socket.on("correct-username", (username)=>{
    isLogged = true;
})

// odebranie wiadomości
socket.on("message", (msg,username) => {
    // wiadomość
    const d = document.createElement("div")
    // nazwa użytkownika
    const n = document.createElement("div")
    // kontener dla wiadomości
    const h = document.createElement("div")
    chatDiv.append(h)
    h.append(n)
    h.append(d)
    h.classList.add("message-holder")
    d.classList.add("displayed-message")
    n.classList.add("showName")
    n.textContent = username
    d.textContent = msg
    n.textContent = username

    //automatyczne przewijanie suwaka do osttaniej wiadomosci
    chatDiv.scrollTop = chatDiv.scrollHeight;
})

// funkcja dołączania do pokoju
function joinRoom(){
    if (!isLogged) {
        warning.textContent = "You are not logged in!"
        return
    }
    room = room_input.value;
    socket.emit("join-room",room)
    isJoined = true;
    room_code_span.textContent = room;
}
socket.on("disconnected",name=>{
    notification_on_user_disconnect.textContent = `user ${name} disconnected`
    notification_on_user_disconnect.style.width = "100%"
    notification_on_user_disconnect.style.backgroundColor = "red"
})

// funkcja wysyłania wiadomości
function sendMessage() {
    const message = input.value
    socket.emit("send-message", message, username, room);
    //wiadomosc
    const messageDiv = document.createElement("div")
    // nazwa
    const nameDiv = document.createElement("div")
    // kontener
    const containerDiv = document.createElement("div")

    chatDiv.append(containerDiv)
    containerDiv.append(nameDiv)
    containerDiv.append(messageDiv)

    containerDiv.classList.add("message-holder")
    messageDiv.classList.add("displayed-message")
    nameDiv.classList.add("showName")

    containerDiv.style.display = "flex";
    containerDiv.style.justifyContent = "right";
    messageDiv.style.backgroundColor = "#2ea3a3";
    messageDiv.textContent = message
    messageWidth = messageDiv.clientWidth;
    nameDiv.textContent = "You";
    nameDiv.style.left = messageWidth + "px";
    nameDiv.style.top = "-5px";

    //automatyczne przewijanie suwaka do osttaniej wiadomosci
    chatDiv.scrollTop = chatDiv.scrollHeight;

    message.value = "";
}