const router = require('express').Router();
const request = require('request-promise-native');
const tor = require('tor-request');
const cacheService = require('../../cache.service');
const { simplifyHomeData, cacheDuration } = require('../../helper');
const auth = require('../auth');

const fetchSofaScore = require('../../fetch/sofascore');

tor.TorControlPort.password = 'muztafultra';

router.get('/', auth.optional, (req, res) => {
    const cacheKey = `mainData-${req.query.query}`;
    req.query.page = req.query.page || 'default';
    const initRemoteRequests = () => {
        fetchSofaScore(req.query.query)
            .then(response => {
                if (req.query.page === 'homepage') response = simplifyHomeData(response);
                if (response) {
                    cacheService.instance().set(cacheKey, response, cacheDuration.main[req.query.page] || 5);
                    res.send(response);
                }
            })
            .catch(() => {
                res.statusCode(500);
            });
    };

    const cachedData = cacheService
        .instance()
        .get(req.query.page === 'homepage' && req.query.today === '1' ? 'fullData' : cacheKey);
    if (typeof cachedData !== 'undefined') {
        // Cache is found, serve the data from cache
        res.send(cachedData);
    } else {
        initRemoteRequests();
    }
});

module.exports = router;
