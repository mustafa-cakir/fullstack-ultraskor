const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const cacheService = require('./cache.service');
// const { encryptThis, decryptThis } = require('./utils/encryption');
const { initCors } = require('./helper');
const { cronStart } = require('./cronjob');
const { socketHandler } = require('./utils/socket');
const { tor } = require('./utils/tor');
const { initWebSocket } = require('./utils/Websocket');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// console.log('encrypted: ', encryptThis('18427666_8243475_123123'));
// console.log('dencrypted: ', decryptThis('YNiBNJUaem6l'));
console.log(shortid.generate());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(initCors());

cacheService.start();

setTimeout(() => {
    cronStart();
}, 2000);

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
