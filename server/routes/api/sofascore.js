const router = require('express').Router();
const request = require('request-promise-native');
const tor = require('tor-request');
const cacheService = require('../../services/cache.service');
const { simplifyHomeData, cacheDuration } = require('../../utils');
const auth = require('../auth');

const { fetchSofaScore } = require('../../fetch/sofascore');

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
                res.status(500).send('Something went wrong!');
            });
    };

    const cachedData = cacheService
        .instance()
        .get(req.query.page === 'homepage' && req.query.today === '1' ? 'homepageListData' : cacheKey);
    if (typeof cachedData !== 'undefined') {
        // Cache is found, serve the data from cache
        res.send(cachedData);
    } else {
        initRemoteRequests();
    }
});

module.exports = router;
