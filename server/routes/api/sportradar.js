const moment = require('moment');
const router = require('express').Router();
const request = require('request-promise-native');
const tor = require('tor-request');
const { preProcessSportRadarData, cacheDuration } = require('../../utils');
const auth = require('../auth');
const cacheService = require('../../services/cache.service');
const { db } = require('../../services/firebase.service');

tor.TorControlPort.password = 'muztafultra';

router.get('/:date', auth.optional, (req, res) => {
    const { date } = req.params;
    const targetDate = moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD'); // another date
    const cacheKey = `helperData-${targetDate}-provider1`;
    const isToday = moment(date, 'DD.MM.YYYY').isSame(moment(), 'day');
    const initRemoteRequests = () => {
        const provider1options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://ls.betradar.com',
                Referer: 'https://ls.betradar.com/ls/livescore/?/tempobet/en/page'
            },
            uri: `https://ls.fn.sportradar.com/tempobet/tr/Europe:Istanbul/gismo/sport_matches/1/${targetDate}/1`,
            json: true,
            timeout: 10000
        };

        request(provider1options)
            .then(response => {
                const matchList = preProcessSportRadarData(response);
                if (matchList && matchList.length > 0) {
                    if (isToday) {
                        cacheService.instance().set(cacheKey, matchList, cacheDuration.provider1);
                        if (db)
                            db.collection('ultraskor_helper1')
                                .doc(targetDate)
                                .set({ data: matchList })
                                .then(() => {
                                    // do nothing
                                });
                    }
                    res.send(matchList);
                } else {
                    res.status(501);
                }
            })
            .catch(() => {
                res.status(500);
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_helper1').doc(targetDate);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.provider1);
                    res.send(doc.data().data);
                    console.log('taken from firestore');
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                console.error('helper1: failed to get data from db');
                initRemoteRequests();
            });
    } else {
        initRemoteRequests();
    }
});

module.exports = router;
