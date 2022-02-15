const PORT = process.env.PORT || 8003;

const { Server } = require("socket.io");
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
})

const io = new Server(parseInt(PORT), {
    cors: {
        origin: "https://localhost:8000",
        methods: ["GET", "POST"]
    }
});

let onlines = [];

io.on("connect", (socket) => {
    socket.on("load", (token) => {
        db.query(`SELECT pseudo, token FROM user WHERE token = ${db.escape(token)}`, (err, result, fields) => {
            onlines.push(result[0]);
        });
    });

    socket.on("disconnect", (t) => {
        const index = onlines.indexOf(socket.id);
        onlines = onlines.filter((online) => online !== socket.id);
        socket.disconnect(true);
    });
});