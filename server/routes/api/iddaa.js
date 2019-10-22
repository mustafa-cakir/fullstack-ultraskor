const moment = require('moment');
const router = require('express').Router();
const request = require('request-promise-native');
const tor = require('tor-request');
const cacheService = require('../../cache.service');
const { cacheDuration, simplifyIddaaHelperData, isTorDisabled } = require('../../helper');
const auth = require('../auth');
const { db } = require('../../utils/firebase');

tor.TorControlPort.password = 'muztafultra';

router.get('/list/:date', auth.optional, (req, res) => {
    const { date } = req.params;
    const targetDate = moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD');
    const cacheKey = `helperData-${targetDate}-iddaalist`;

    const initRemoteRequests = () => {
        const idaaHelperOptions = {
            method: 'POST',
            uri: `https://api.iddaa.com.tr/sportsprogram/1`,
            body: ['1_1', '2_87', '2_101_2.5', '2_89'],
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.iddaa.com.tr',
                Referer: 'https://www.iddaa.com.tr/futbol-programi',
                'Sec-Fetch-Mode': 'cors'
            }
        };

        const onSuccess = response => {
            const responseData = simplifyIddaaHelperData(response);
            const shouldCached = responseData.length > 200;
            const isToday = moment(date, 'DD.MM.YYYY').isSame(moment(), 'day');

            if (responseData) {
                if (shouldCached) {
                    cacheService.instance().set(cacheKey, responseData, cacheDuration.iddaaHelper);
                    if (db && isToday)
                        db.collection('ultraskor_iddaahelper')
                            .doc(targetDate)
                            .set(responseData);
                }
                res.send(responseData);
            } else {
                res.status(501).send('Something went wrong!');
            }
        };

        const onError = () => {
            res.status(500);
        };

        request(idaaHelperOptions)
            .then(onSuccess)
            .catch(onError);
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_iddaahelper').doc(targetDate);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.iddaaHelper);
                    res.send(doc.data());
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                console.error('iddaaHelper: failed to get data from db');
                initRemoteRequests();
            });
    } else {
        initRemoteRequests();
    }
});

router.get('/match/:id/:live?', (req, res) => {
    /**
     * @param req.params.live
     */
    const { id } = req.params;
    const isLive = req.params.live;
    const cacheKey = `helperData-${id}-iddaamatch`;
    const initRemoteRequests = () => {
        const idaaOddsOptions = {
            method: 'GET',
            uri: `https://api.iddaa.com.tr/sportsprogram/${isLive ? 'live/' : ''}markets/1/${id}`,
            json: true,
            timeout: 10000,
            headers: {
                Origin: 'https://www.iddaa.com.tr',
                Referer: 'https://www.iddaa.com.tr/canli-futbol-programi'
            }
        };

        const onSuccess = response => {
            const { data } = response;

            if (data) {
                cacheService.instance().set(cacheKey, data, cacheDuration.iddaaOdds);
                res.send(data);
            } else {
                res.sendStatus(501);
            }
        };

        const onError = () => {
            res.status(500);
        };

        if (isTorDisabled) {
            request(idaaOddsOptions)
                .then(onSuccess)
                .catch(onError);
        } else {
            tor.request(idaaOddsOptions, (err, status, response) => {
                if (!err && status.statusCode === 200) {
                    onSuccess(response);
                } else {
                    onError(err);
                }
            });
        }
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else {
        initRemoteRequests();
    }
});

module.exports = router;
