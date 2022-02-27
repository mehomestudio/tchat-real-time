const { db } = require('../database');
const Message = require('../models/message.models');
const {getAllUsers} = require("./user.queries");
const {generateToken} = require("../consts/Functions");

exports.getAllMessages = () => {
    return new Promise((resolve) => {
        db.query("SELECT user.pseudo, user.avatar, message.id, message.content, message.created_at, message.token "
                +"FROM message "
                +"LEFT JOIN user "
                +"ON message.author_id = user.id "
                +"ORDER BY created_at ASC",
            async (err, result) => {
                if (err) resolve([]);
                const messages = [];
                if (result && result.length > 0) {
                    const generateToken = await this.saveUpdateMessages(result, false, "token", "id");

                    if (generateToken.status) {
                        generateToken.result.elements.forEach((message) => {
                            messages.push(new Message()
                                .setAuthor(message['pseudo'], message['avatar'])
                                .setContent(message['content'])
                                .setCreatedAt(message['created_at'])
                                .setTokenActions(message['token'])
                            );
                        });
                    }
                }
                resolve(messages);
            }
        );
    });
};

exports.saveNewMessages = (newMessage) => {
    return new Promise(async (resolve) => {
        const users = await getAllUsers();
        let sql = "INSERT INTO message (author_id, content, created_at, token) VALUES ";
        const result = {
            status: true,
            result: {
                code: "[Synchronisation des nouveaux messages]",
                message: "La sauvegarde s'est déroulée avec succès"
            }
        };

        newMessage.forEach((message, index) => {
            const user = users.find((user) => user["pseudo"] === message.getAuthor().pseudo);

            if (!user) {
                result.status = false;
                result.result.code = "[Synchronisation échouée]"
                result.result.message = "L'utilisateur " + message.getAuthor().pseudo + " n'a pas été trouvé dans "
                    + "la base de données. L'opération n'a pu synchroniser les données des nouveaux messages avec la base de données.";
                resolve(result);
            }

            sql += `(${db.escape(user['id'])}, 
                    ${db.escape(message.getContent())}, 
                    ${db.escape(message.getCreatedAt())},
                    ${db.escape(message.getTokenActions())})`;
            if (index < (newMessage.length-1)) {
                sql += ', ';
            } else {
                sql += ';';
            }
        });

        db.query(sql, (err, res) => {
            if (err) {
                console.log(err);
                result.status = false;
                result.result.code = "[Synchronisation échouée]";
                result.result.message = "Une erreur s'est produite lors de l'enregistrement des données dans la "
                + "base de données. L'opération n'a pu synchroniser les données des nouveaux messages avec la base de données. " + err;
                resolve(result);
            }
            resolve(result);
        });
    });
};

exports.saveUpdateMessages = (updateMessages, isClassMessage, column = "content", by = "token") => {
    return new Promise((resolve) => {
        const result = {
            status: true,
            result: {
                code: "[Synchronisation des messages édités]",
                message: "La sauvegarde s'est déroulée avec succès",
                elements: null
            }
        };

        let sql = `UPDATE message SET ${column} = (case `;
        let arrayWhere = `WHERE ${by} in (`;
        let messages = [];

        updateMessages.forEach((item, index) => {
            let m = item;
            if (isClassMessage) {
                m = {
                    content: item.getContent(),
                    token: item.getTokenActions()
                }
            } else {
                let token = generateToken();
                while (updateMessages.find((msg) => msg['token'] === token)) {
                    token = generateToken();
                }
                m['token'] = token;
                messages.push(m);
            }
            sql += `when ${by} = ${db.escape(m[by])} then ${db.escape(m[column])} `
            arrayWhere += `${db.escape(m[by])}`;
            if (index < (updateMessages.length - 1)) {
                arrayWhere += `, `;
            }
        });

        sql += `end) ${arrayWhere});`;

        db.query(sql, (err) => {
            if (err) {
                result.status = false;
                result.result.message = "La modification des données a échoué.";
            }
            result.result.elements = messages;
            resolve(result);
        });
    });
}