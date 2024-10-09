// Połącz z serwerem na porcie 3000
const socket = io("http://localhost:3000");

// inicjacja bloków z HTML
const warning = document.getElementById("warning");
const message_input = document.getElementById("message");
const chatDiv = document.getElementById("chat");
const user_info = document.getElementById("user-info");
const user_name_input = document.getElementById("nickName");
const room_input = document.getElementById("room");
const room_code_span = document.getElementById("room-code");
const notification_on_user_disconnect = document.getElementById("notification-disconnect");
const html_users_in_room_display = document.getElementById("users-list");
const html_send_menu = document.getElementById("send-menu")
let messageWidth;
let username; // nazwa użytkownika
let room = "public";

let isLogged = false;
let isJoined = false;


let isTyping = false;

// po połączeniu z serverem.
socket.on('connect' , ()=>{
    console.log(`Connected as: ${socket.id}`)
})
//SOCKET.ON

// odebranie listy pokoi
socket.on("room-list", (list)=>{
    html_users_in_room_display.innerHTML = "";
    list.forEach(user=>{
        const p = document.createElement("div")
        html_users_in_room_display.append(p)
        p.classList.add("list-username")
        p.textContent = user
    })
})

//zejęta nazwa użytkownika
socket.on("wrong-username" ,(username)=>{
    warning.textContent = "Nazwa użytkownika już istnieje"
    user_name_input.value = ""
    isLogged = false;
    isJoined = false;
})

//dobra nazwa użytkownika
socket.on("correct-username", ()=>{
    isLogged = true;
    socket.emit("join-room",room,username)
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

    // dodanie klas
    h.classList.add("message-holder")
    d.classList.add("displayed-message")
    n.classList.add("showName")

    n.textContent = username
    d.textContent = msg
    n.textContent = username

    //automatyczne przewijanie suwaka do osttaniej wiadomosci
    chatDiv.scrollTop = chatDiv.scrollHeight;
})

// powiadomienie o rozłączeniu użytkownika
socket.on("disconnected-user",()=>{
    notification_on_user_disconnect.textContent = `user ${name} disconnected`
    notification_on_user_disconnect.style.width = "100%"
    notification_on_user_disconnect.style.backgroundColor = "red"
})

socket.on("user-is-typing-display" , (username)=>{
    const m = document.createElement("div")
    html_send_menu.append(m);
    m.classList.add("isTyping")
    m.classList.add(username)
    m.textContent = username + " is typing"
})

socket.on("user-stopped-typing-display",(username)=>{
    document.getElementsByClassName(username)[0].remove();
})

// FUNCKJE

//ustawianie i zazpisywanie nazwy uzytkownika na serwerze
function LogIn() {
    username = user_name_input.value;
    if (!username) {
        username = "guest";
    }
    room = "public"
    room_input.value = room;
    room_code_span.textContent = room;
    isJoined = true;



    user_info.textContent = `Username: ${username}`;
    socket.emit("log-in", username);
}
//wyswietlanie id uzytkownika
// socket.on('display-id',(id)=>{
//     user_id.textContent += id;
// })


// funkcja dołączania do pokoju
function joinRoom(){
    if (!isLogged) {
        warning.textContent = "You are not logged in!"
        return
    }


    socket.emit("leave-room",room,username)
    room = room_input.value;
    socket.emit("join-room",room,username)
    isJoined = true;
    room_code_span.textContent = room;
}



// funkcja wysyłania wiadomości
function sendMessage() {
    const message = message_input.value

    // sprawdzenie czy użytkownik jest zalogowany
    if (!isLogged) {
        warning.textContent = "You are not logged in!"
        return
    }

    // sprawdzenie czy użytkownik jest w pokoju
    if (!isJoined) {
        warning.textContent = "You are not in any room!"
        return
    }

    // sprawdzenie czy wiadomość nie jest pusta
    if (!message) {
        warning.textContent = "Message is empty!"
        return
    }

    socket.emit("send-message", message, username, room);
    //wiadomosc
    const messageDiv = document.createElement("div")
    // nazwa
    const nameDiv = document.createElement("div")
    // kontener
    const containerDiv = document.createElement("div")


    // dodanie elementów do HTML
    chatDiv.append(containerDiv)
    containerDiv.append(nameDiv)
    containerDiv.append(messageDiv)

    // dodanie klas
    containerDiv.classList.add("message-holder")
    messageDiv.classList.add("displayed-message")
    nameDiv.classList.add("showName")

    // ustawienie stylów
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

    // czyszczenie inputa
    message_input.value = "";
}

// sprawdzanie czy message_input jest aktywny
message_input.addEventListener("focus", () => {
    isTyping = true;
    socket.emit("user-is-typing" ,username, room)
})

// sprawdzanie czy message_input jest nieaktywny
message_input.addEventListener("blur", () => {
    isTyping = false;
    socket.emit("user-stopped-typing",username,room)
})

// bind enter do wysyłania wiadomości.
message_input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && isTyping) {
        sendMessage()
    }
})

room_input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && isTyping) {
        sendMessage()
    }
})