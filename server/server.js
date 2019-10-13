const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const tor = require('tor-request');
// const shortid = require('shortid');
const cacheService = require('./cache.service');
const { isTorDisabled } = require('./helper');
// const { encryptThis, decryptThis } = require('./utils/encryption');
const { initCors } = require('./helper');
const { cronStart } = require('./cronjob');
const { socketHandler } = require('./utils/socket');
const { initWebSocket } = require('./utils/Websocket');

tor.TorControlPort.password = 'muztafultra';
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

console.log('Tor disabled? : ', isTorDisabled);
if (!isTorDisabled) {
    tor.request('https://api.ipify.org', (err, status, response) => {
        if (!err && status.statusCode === 200) {
            console.log('TOR request completed, IP: ', response);
        }
    });
}
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
