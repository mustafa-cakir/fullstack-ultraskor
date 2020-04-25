const router = require('express').Router();
const tor = require('tor-request');

tor.TorControlPort.password = 'muztafultra';

router.get('/', (req, res) => {
    tor.request('https://api.ipify.org', (err, status, response) => {
        if (!err && status.statusCode === 200) {
            res.send(response);
        }
    });
});

router.get('/new', (req, res) => {
    tor.newTorSession((err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(response);
        }
    });
});

module.exports = router;
