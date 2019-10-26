const router = require('express').Router();
const tor = require('tor-request');
const { isProd } = require('../../utils');
const auth = require('../auth');
const { db } = require('../../services/firebase.service');

tor.TorControlPort.password = 'muztafultra';

router.get('/', auth.optional, (req, res) => {
    if (isProd) {
        if (db) {
            db.collection('ultraskor_errors').add(req.body);
            res.sendStatus(200);
        } else {
            res.sendStatus(501);
        }
    } else res.sendStatus(204);
});

module.exports = router;
