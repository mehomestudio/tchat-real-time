const { io } = require("socket.io-client");
const socket = io("ws://localhost:8003");
const user = {};

fetch("/ws/token-ws/get", {
    method: "get"
}).then(async (response) => {
    if (response.ok) {
        const result = await response.json();
        user.token = result.tokenws;
        socket.emit("load", user.token);
    } else {
        console.log("Une erreur s'est produitre lors de la connexion au serveur.");
    }
});