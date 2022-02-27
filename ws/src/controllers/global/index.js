const {globalLoadCurrentUser} = require("../../listeners/global/load.listeners");
const {actionMessageListener} = require("../../listeners/global/message.listeners");
const { datas, io } = require("../../server/server");
const StatusCode = require("../../consts/StatusCode");
const MessagesCode = require("../../consts/MessagesCode");

exports.onLoad = async (token, socket) => {
    const userResult = await globalLoadCurrentUser(token, socket.id);

    if (userResult.error.status === StatusCode.STEP_STATUS_SUCCESS) {
        datas.addUserOnline(userResult.currentUser);
        socket.emit('load', {
            status: StatusCode.STEP_STATUS_SUCCESS.message,
            result: {
                currentUser: userResult.currentUser,
                onlineUsers: datas.getUsersOnline(),
                messages: datas.getMessages(),
                rooms: [
                    'Général'
                ]
            }
        });
        io.sockets.except(socket.id).emit("user-login", userResult.currentUser);
    } else {
        if (userResult.error.message.idWs){
            io.to(userResult.error.message.idWs).emit('error', {
                result: userResult.error.message.message
            });

            socket.emit('error', {
                result: MessagesCode.USER_ALREADY_CONNECTED
            });
        } else {
            socket.emit('error', {
                result: userResult.error.message
            });
        }
    }
};

exports.onActionMessage = (msg, action) => {
    let message = actionMessageListener(msg, action);
    datas.actionMessage(message, action);
    io.emit("action-message", message, action);
};

exports.onUpdateAvatar = (currentUser) => {
    let messages = datas.updateAvatar(currentUser);
    io.emit("update-avatar", currentUser, messages);
};

exports.onDisconnect = (socket) => {
    socket.disconnect(true);
    io.sockets.emit("user-logout", socket.id);
    datas.removeUserOnline(socket.id);
};