const {
    onLoad,
    onDisconnect,
    onAddMessage
} = require("../../controllers/global");

exports.global = (socket) => {
    socket.on('load', async (token) => {
        await onLoad(token, socket);
    });

    socket.on('add-message', onAddMessage);

    socket.on("disconnect", () => {
        onDisconnect(socket);
    });
};
