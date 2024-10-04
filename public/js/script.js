// Połącz z serwerem na porcie 3000
const socket = io("http://localhost:3000");

// inicjacja bloków z HTML
const input = document.getElementById("message");
const chatDiv = document.getElementById("chat")

// po połączeniu z serverem.
socket.on('connect' , ()=>{
    console.log(`You are connected as ${socket.id}`)
})

// odbieranie wiadomości z servera
socket.on("send-message", (msg)=> {
    const d = document.createElement("div")
    chatDiv.append(d)
    d.id = "displayed-message"
    d.textContent = msg
})

// funkcja wysyłania wiadomości
function sendMessage(){
    const message = input.value
    socket.emit("send-message", message)
    const d = document.createElement("div")
    chatDiv.append(d)
    d.textContent = message
    d.classList.add("displayed-message")
    d.style.textAlign = "right"
}