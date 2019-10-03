const WebSocket = require('ws');
const SocksProxyAgent = require('socks-proxy-agent');
const { isTorDisabled, simplifyWebSocketData } = require('../../helper');
const { pushServiceChangesForWebPush } = require('../../cronjob');

let wsMaxRetry = 25;
const initWebSocket = io => {
    let swTimeout = null;
    const pushServiceUri = [
        'wss://ws.sofascore.com:10017',
        'wss://ws.sofascore.com:10011',
        'wss://ws.sofascore.com:10012',
        'wss://ws.sofascore.com:10014',
        'wss://ws.sofascore.com:10013',
        'wss://ws.sofascore.com:10016',
        'wss://ws.sofascore.com:10015',
        'wss://ws.sofascore.com:10010'
    ];

    const getPushServiceUri = pushServiceUri.sort(() => {
        return 0.5 - Math.random();
    })[0];

    console.log(getPushServiceUri);
    const ws = new WebSocket(`${getPushServiceUri}/ServicePush`, {
        origin: 'https://www.sofascore.com',
        rejectUnauthorized: false,
        ...(!isTorDisabled && { agent: new SocksProxyAgent('socks://127.0.0.1:9050') })
    });

    ws.on('error', err => {
        console.log('errored', err);
    });

    ws.on('open', () => {
        console.log('ws connected');
        ws.send(
            JSON.stringify({
                type: 0,
                data: ['subscribe', { id: 'event', events: ['sport_football'] }]
            }),
            undefined,
            undefined
        );
        swTimeout = setInterval(() => {
            ws.send(JSON.stringify(`primus::ping::${new Date().getTime()}`), undefined, undefined);
        }, 20000);
        wsMaxRetry = 25;
    });

    ws.on('close', err => {
        console.log('ws disconnected. ', err);
        if (wsMaxRetry > 0) initWebSocket();
        clearInterval(swTimeout);
        wsMaxRetry -= 1;
    });

    ws.on('pong', () => {
        // console.log('Ws pong ', data);
    });

    ws.on('message', res => {
        if (res.substr(0, 15).match('pong')) {
            // console.log('## pong recived', res);
        } else {
            if (!res) return false;
            // console.log(res);
            res = simplifyWebSocketData(res);
            pushServiceChangesForWebPush(res);
            io.sockets.emit('push-service', res);
        }
        return false;
    });
};

exports.initWebSocket = initWebSocket;
