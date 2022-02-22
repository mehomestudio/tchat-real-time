const Message = require("../../models/message.models");

exports.addMessageListener = (msg) => {
    return (new Message())
        .setAuthor(msg['_author'])
        .setContent(msg['_content'])
        .setCreatedAt(new Date(msg['_createdAt']));
}