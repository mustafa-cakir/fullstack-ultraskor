const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const cacheService = require('./cache.service');
const helper = require('./helper');
const cronjob = require('./cronjob');
const { socketHandler } = require('./utils/socket');
const { tor } = require('./utils/tor');
const { initWebSocket } = require('./utils/Websocket');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helper.initCors());

cacheService.start();
cronjob.start();

// refresh TOR session
setInterval(() => {
    tor.newTorSession((err, success) => {
        if (!err) console.log(success, new Date());
    });
}, 1000 * 60 * 60 * 6); // 6 hours

server.listen(5001, () => console.log(`Listening on port ${5001}`));

initWebSocket(io);

io.on('connection', socket => {
    socketHandler(socket, io);
});

app.use(require('./routes'));
