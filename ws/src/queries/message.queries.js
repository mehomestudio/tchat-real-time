const { db } = require('../database');
const Message = require('../models/message.models');
const {getAllUsers} = require("./user.queries");

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

exports.saveNewMessages = (newMessage) => {
    return new Promise(async (resolve) => {
        const users = await getAllUsers();
        let sql = "INSERT INTO message (author_id, content, created_at) VALUES ";
        const result = {
            status: true,
            result: {
                code: "[Synchronisation réussie]",
                message: "La sauvegarde s'est déroulée avec succès"
            }
        };

        newMessage.forEach((message, index) => {
            const user = users.find((user) => user["pseudo"] === message.getAuthor());

            if (!user) {
                result.status = false;
                result.result.code = "[Synchronisation échouée]"
                result.result.message = "L'utilisateur " + message.getAuthor() + " n'a pas été trouvé dans "
                    + "la base de données. L'opération n'a pu synchroniser les données avec la base de données.";
                resolve(result);
            }

            sql += `(${db.escape(user['id'])}, 
                    ${db.escape(message.getContent())}, 
                    ${db.escape(message.getCreatedAt())})`;
            if (index < (newMessage.length-1)) {
                sql += ', ';
            } else {
                sql += ';';
            }
        });

        db.query(sql, (err, res) => {
            if (err) {
                result.status = false;
                result.result.code = "[Synchronisation échouée]";
                result.result.message = "Une erreur s'est produite lors de l'enregistrement des données dans la "
                + "base de données. L'opération n'a pu synchroniser les données avec la base de données. " + err;
                resolve(result);
            }
            resolve(result);
        });
    });
}