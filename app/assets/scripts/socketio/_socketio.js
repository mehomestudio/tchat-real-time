let socket = null;

setTimeout(() => {
    const { io } = require("socket.io-client");
    const { loadListenersGlobals } = require("./listeners");
    socket = io("ws://localhost:8003");

    fetch("/ws/token-ws/get", {
        method: "get"
    }).then(async (response) => {
        if (response.ok) {
            const result = await response.json();
            loadListenersGlobals(socket);
            socket.emit("load", result['tokenws'])
        } else {
            window.location = '/se-deconnecter';
        }
    });
}, 1000);

export default {socket};

