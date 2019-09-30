const moment = require('moment');
const router = require('express').Router();
const request = require('request-promise-native');
const tor = require('tor-request');
const cacheService = require('../../cache.service');
const { cacheDuration } = require('../../helper');
const auth = require('../auth');
const { db } = require('../../utils/firebase');

tor.TorControlPort.password = 'muztafultra';

router.get('/:date', auth.optional, (req, res) => {
    const { date } = req.params;
    const targetDate = moment(date, 'MM.DD.YYYY').format('YYYY-MM-DD');
    const cacheKey = `helperData-${date}-provider2`;

    const isToday = moment(date, 'MM.DD.YYYY').isSame(moment(), 'day');

    const initRemoteRequests = () => {
        const provider2options = {
            method: 'POST',
            uri: 'https://brdg-c1884f68-d545-4103-bee0-fbcf3d58c850.azureedge.net/livescore/matchlist',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.broadage.com'
            },
            body: JSON.stringify({
                coverageId: '6bf0cf44-e13a-44e1-8008-ff17ba6c2128',
                options: {
                    sportId: 1,
                    day: moment(targetDate, 'YYYY-MM-DD').format('MM/DD/YYYY'),
                    origin: 'broadage.com',
                    timeZone: 3
                }
            }),
            json: true,
            timeout: 10000
        };

        request(provider2options)
            .then(response => {
                /**
                 * @param response
                 * @param response.initialData
                 */

                if (response.initialData && response.initialData.length > 0) {
                    if (isToday) {
                        cacheService.instance().set(cacheKey, response, cacheDuration.provider2);
                        if (db)
                            db.collection('ultraskor_helper2')
                                .doc(targetDate)
                                .set(response);
                    }
                    res.send(response);
                } else {
                    res.statusCode(501);
                }
            })
            .catch(() => {
                res.statusCode(500);
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_helper2').doc(targetDate);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.provider1);
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
