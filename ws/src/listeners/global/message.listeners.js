const Message = require("../../models/message.models");
const { datas } = require("../../server/server");
const {generateToken} = require("../../consts/Functions");

exports.actionMessageListener = (msg, action) => {
    if (action === "add") {
        msg['_tokenActions'] = generateToken();
        while(datas.getMessages().find((m) => m.getTokenActions() === msg['_tokenActions'])) {
            msg['_tokenActions'] = generateToken();
        }
    }

    return new Message()
        .setAuthor(msg['_author'].pseudo, msg['_author'].avatar)
        .setContent(msg['_content'])
        .setCreatedAt(new Date(msg['_createdAt']))
        .setTokenActions(msg['_tokenActions']);
}