const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const tor = require('tor-request');
const request = require('request-promise-native');
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

const options = {
    method: 'GET',
    uri: `https://www.sofascore.com/football//2019-10-22/json?_=${Math.floor(Math.random() * 10e8)}`,
    json: true,
    headers: {
        'Content-Type': 'application/json',
        Origin: 'https://www.sofascore.com',
        referer: 'https://www.sofascore.com/',
        'x-requested-with': 'XMLHttpRequest'
    },
    timeout: 10000
};
request(options)
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.log(err);
    });

initWebSocket(io);

io.on('connection', socket => {
    socketHandler(socket, io);
});

app.use(require('./routes'));
