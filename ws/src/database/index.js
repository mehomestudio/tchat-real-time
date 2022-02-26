const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    port: 8001,
    user: "root",
    password: "password",
    database: "db_dev"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});

exports.db = db;

