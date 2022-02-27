const {Notify} = require("../../../components/_notify");

const statusKeyPress = {
    "Shift": false,
    "Enter": false
}

let statusValue = false;

exports.sendMessage = (socket, chat, event, actions, token = null) => {
    if (event.type === "keydown") {
        statusKeyPress.Shift = (event.key === "Shift") ? true : statusKeyPress.Shift ;
        statusKeyPress.Enter = (event.key === "Enter") ? true : statusKeyPress.Enter;
    } else if (event.type === "keyup")
    {
        statusKeyPress.Shift = (event.key === "Shift") ? false : statusKeyPress.Shift;
        statusKeyPress.Enter = (event.key === "Enter") ? false : statusKeyPress.Enter;
        if (statusValue) {
            if (actions === "add") {
                event.currentTarget.value = "";
            } else if(actions === "update") {
                event.currentTarget.blur();
            }
            statusValue = false;
        }
    }
    if ((!statusKeyPress.Shift && statusKeyPress.Enter) && event.currentTarget.value.trim() !== "") {
        const message = chat.sendMessage(event.currentTarget.value.trim(), actions, token);
        if (message) {
            socket.emit('action-message', message, actions);
        }
        statusValue = true;
    }
};

exports.showInputEditMessage = (socket, chat, input) => {
    const token = input.parentElement.dataset.token;

    if (token) {
        chat.createEditMessageDOM(token, (response) => {
            if (response.status) {
                const chatMessagesBodyElement = input.parentElement.parentElement.querySelector('.chat-messages-body');
                const chatMessagesBodyTextElement = chatMessagesBodyElement.querySelector('.chat-messages-body-text');
                chatMessagesBodyTextElement.style.display = "none";
                chatMessagesBodyElement.prepend(response.result.element);
                const inputEditMessage = response.result.element.firstChild;
                inputEditMessage.focus();

                inputEditMessage.addEventListener('blur', (e) => {
                    response.result.element.remove();
                    chatMessagesBodyTextElement.style.display = "flex";
                });

                inputEditMessage.addEventListener('keyup', (e) => {
                    this.sendMessage(null, null, e, "update", token);
                });

                inputEditMessage.addEventListener('keydown', (e) => {
                    this.sendMessage(socket, chat, e, "update", token);
                });
            } else {
                Notify.error(response.result.error.message);
            }
        });
    }

};

exports.inputDeleteMessage = (socket, chat, input) => {
    const token = input.parentElement.dataset.token;
    const message = chat.sendMessage('Message supprimé.', 'deleted', token);

    if (message) {
        socket.emit('action-message', message, 'deleted');
    }
};
