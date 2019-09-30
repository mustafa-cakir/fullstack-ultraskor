const tor = require('tor-request');
const request = require('request-promise-native');
const { isTorDisabled } = require('../helper');

tor.TorControlPort.password = 'muztafultra';

module.exports = (options, resolve, reject) => {
    const onSuccess = response => resolve(response);
    const onError = () => reject(Error('501'));

    if (isTorDisabled) {
        request(options)
            .then(onSuccess)
            .catch(onError);
    } else {
        tor.request(options, (err, status, res) => {
            if (!err && status.statusCode === 200) {
                onSuccess(res);
            } else {
                onError(err);
            }
        });
    }
};
