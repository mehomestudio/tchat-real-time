const fastify = require('fastify')({ logger: false });

fastify.register(require('fastify-websocket'), {
    options: {
        maxPayload: 1048576,
        clientTracking: true,
    },
});

fastify.get('/', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (data) => {
        try {
            fastify.websocketServer.clients.forEach((client) => {
                if (client.readyState === 1) {
                    client.send('Connecté au serveur');
                }
            })
        } catch (error) {
            console.error(error);
        }
    });
});

const start = async() => {
    try {
        const PORT = process.env.PORT || 8003;
        await fastify.listen(PORT);
        console.log('Connecting in port '+PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();