// Połącz z serwerem na porcie 3000
const socket = io("http://localhost:3000");

// inicjacja bloków z HTML
const input = document.getElementById("message");
const chatDiv = document.getElementById("chat");
const user_id = document.getElementById("user-id");
const user_name = document.getElementById("nickName");
const user_name_get = document.getElementById("setNickname");
let username; // nazwa użytkownika
let user = {

}//użytkownicy

// po połączeniu z serverem.
socket.on('connect' , ()=>{
    console.log(`Connected as: ${socket.id}`)
})

//ustawianie i zazpisywanie nazwy uzytkownika na serwerze
function addUser() {
    username = user_name.value;
    if (!username) {
        username = "guest";
    }
    user[socket.id] = {
        name:username
    }
    user_id.textContent += ` and name: ${user[socket.id].name}`;
    socket.emit("addUser", username,socket.id);
}


// odbieranie wiadomości z servera
socket.on("send-message", (msg,username)=> {
    const d = document.createElement("div")
    const n = document.createElement("div")
    const h = document.createElement("div")
    chatDiv.append(h)
    h.append(n)
    h.append(d)
    h.classList.add("message-holder")
    d.classList.add("displayed-message")
    n.classList.add("showName")
    d.textContent = msg
    n.textContent = username
})
//wyswietlanie id uzytkownika
socket.on('display-id',(id)=>{
    user_id.textContent += id;
})

// funkcja wysyłania wiadomości
function sendMessage(){
    const message = input.value
    socket.emit("send-message", message,user[socket.id].name);
    const d = document.createElement("div")
    const n = document.createElement("div")
    const h = document.createElement("div")
    chatDiv.append(h)
    h.append(n)
    h.append(d)
    h.classList.add("message-holder")
    d.classList.add("displayed-message")
    n.classList.add("showName")
    h.style.justifyContent = "right"
    d.textContent = message
    n.textContent = user[socket.id].name
}