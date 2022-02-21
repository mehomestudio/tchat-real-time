const { onLoad, onDisconnect } = require("../../controllers/global");

exports.global = (socket) => {
    socket.on('load', async (token) => {
        await onLoad(token, socket);
    });

    socket.on("disconnect", () => {
        onDisconnect(socket);
    });
};
