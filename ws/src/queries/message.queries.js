const { db } = require('../database');
const Message = require('../models/message.models');

exports.getAllMessages = () => {
    return new Promise((resolve) => {
        db.query("SELECT user.pseudo, message.content, message.created_at "
                +"FROM message "
                +"LEFT JOIN user "
                +"ON message.author_id = user.id "
                +"ORDER BY created_at ASC",
            (err, result) => {
                if (err) resolve([]);
                const messages = [];
                if (result && result.length > 0) {
                    result.forEach((message) => {
                        messages.push((new Message())
                            .setAuthor(message['pseudo'])
                            .setContent(message['content'])
                            .setCreatedAt(message['created_at'])
                        );
                    });
                }
                resolve(messages);
            }
        );
    });
};