const {
    onLoad,
    onDisconnect,
    onActionMessage
} = require("../../controllers/global");

exports.global = (socket) => {
    socket.on('load', async (token) => {
        await onLoad(token, socket);
    });

    socket.on('action-message', onActionMessage);

    socket.on("disconnect", () => {
        onDisconnect(socket);
    });
};
