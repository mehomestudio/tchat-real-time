exports.sendMessage = (socket, chat, event) => {
    if (event.key === "Enter" && event.currentTarget.value !== "") {
        const message = chat.sendMessage(event.currentTarget.value);
        event.currentTarget.value = "";
        socket.emit('add-message', message);
    }
}