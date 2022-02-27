const { db } = require('../database');
const User = require("../models/user.models");

exports.getUserByToken = (token) => {
    return new Promise((resolve) => {
        db.query(`SELECT pseudo, token, avatar FROM user WHERE token = ${db.escape(token)}`, (err, result) => {
            if (err) resolve(null);

            let user = null;
            if (result && result.length > 0) {
                user = new User()
                    .setPseudo(result[0]["pseudo"])
                    .setToken(result[0]["token"])
                    .setAvatar(result[0]["avatar"]);
            }
            resolve(user);
        });
    });
};

exports.getAllUsers = () => {
    return new Promise((resolve) => {
        db.query("SELECT id, pseudo, avatar FROM user", (err, result) => {
            if (err) resolve(null);

            resolve(result);
        });
    });
};