const {
    onLoad,
    onDisconnect,
    onActionMessage,
    onUpdateAvatar
} = require("../../controllers/global");

exports.global = (socket) => {
    socket.on('load', async (token) => {
        await onLoad(token, socket);
    });

    socket.on('action-message', onActionMessage);

    socket.on('avatar-update', onUpdateAvatar);

    socket.on("disconnect", () => {
        onDisconnect(socket);
    });
};
