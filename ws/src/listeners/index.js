const { io } = require('../server/server');
const { global } = require('./global');

io.on('connection', global);