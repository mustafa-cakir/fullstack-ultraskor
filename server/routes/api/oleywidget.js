const router = require('express').Router();
const request = require('request-promise-native');
const tor = require('tor-request');
const cacheService = require('../../services/cache.service');
const { cacheDuration } = require('../../utils');
const auth = require('../auth');
const { db } = require('../../services/firebase.service');

tor.TorControlPort.password = 'muztafultra';

router.get('/:type/:matchid', auth.optional, (req, res) => {
    const { type } = req.params;
    const { matchid } = req.params;
    const cacheKey = `helperData-${matchid}-${type}`;
    const initRemoteRequests = () => {
        const oleyOptions = {
            method: 'GET',
            uri: `https://widget.oley.com/match/${type}/1/${matchid}`,
            json: true,
            timeout: 10000
        };
        request(oleyOptions)
            .then(response => {
                if (response) {
                    cacheService.instance().set(cacheKey, response, cacheDuration.oley[type] || 60);

                    if (db)
                        db.collection('ultraskor_helper2_widget')
                            .doc(`${matchid}_${type}`)
                            .set(response);
                    res.send(response);
                } else {
                    res.status(501).send('Something went wrong!');
                }
            })
            .catch(() => {
                res.status(500).send('Something went wrong!');
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_helper2_widget').doc(`${matchid}_${type}`);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.oley[type] || 60);
                    res.send(doc.data());
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                initRemoteRequests();
            });
    } else {
        initRemoteRequests();
    }
});

module.exports = router;
