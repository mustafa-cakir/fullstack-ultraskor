const tor = require('tor-request');

tor.TorControlPort.password = 'muztafultra';

exports.init = () => {
    setInterval(() => {
        tor.newTorSession((err, success) => {
            if (!err) {
                console.log(success, new Date());
                tor.request('https://api.ipify.org', (err, status, response) => {
                    if (!err && status.statusCode === 200) {
                        console.log('TOR request completed, IP: ', response);
                    }
                });
            }
        });
    }, 1000 * 60 * 60 * 2); // 2 hours
};
