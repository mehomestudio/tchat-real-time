const {Server} = require("socket.io");
const datas = new (require('../datas'))();
(async () => {
    const PORT = process.env.PORT || 8003;

    exports.datas = datas;

    exports.io = new Server(parseInt(PORT), {
        cors: {
            origin: "https://localhost:8000",
            methods: ["GET"]
        }
    });

    require('../listeners');
})();