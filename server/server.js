const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const cacheService = require('./services/cache.service');
const { isTorDisabled } = require('./utils');
require('./services/firebase.service');
const corsService = require('./services/cors.service');
const cronService = require('./services/cronjob.service');
const newTorSessionService = require('./services/newTorSession.service');
const websocketService = require('./services/websocket.service');
const socketService = require('./services/socket.service');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

console.log('Tor Enabled : ', !isTorDisabled);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(corsService.init());
app.use(require('./routes'));

cacheService.init();
cronService.init();
newTorSessionService.init();
// websocketService.init(io);

io.on('connection', (socket) => {
    socketService.init(socket, io);
});

server.listen(5001, () => console.log(`Listening on port ${5001}`));
