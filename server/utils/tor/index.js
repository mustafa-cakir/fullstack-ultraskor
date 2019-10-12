const tor = require('tor-request');

const torHandler = () => {
    tor.TorControlPort.password = 'muztafultra';
    return tor;
};

exports.tor = torHandler;
