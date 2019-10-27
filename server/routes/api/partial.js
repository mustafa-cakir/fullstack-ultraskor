const router = require('express').Router();
const cacheService = require('../../services/cache.service');
const auth = require('../auth');
const { preprocessEvents } = require('../../utils');
const { fetchSofaScore } = require('../../fetch/sofascore');
const { isDev, cacheDuration } = require('../../utils');

router.get('/footer/popularevents', auth.optional, (req, res) => {
    const cacheKey = `footer-popular-events`;

    const remoteRequest = () => {
        fetchSofaScore('/list/footer/events/popular/json')
            .then(data => {
                const { events } = data;
                const merged = preprocessEvents(events, true);
                if (merged.length > 0) {
                    cacheService.instance().set(cacheKey, merged, cacheDuration.popularFooterEvents);
                }
                res.send(merged);
            })
            .catch(err => {
                if (isDev) {
                    res.status(500).send(err);
                } else {
                    res.status(500).send('Can not retrieve information from server');
                }
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        if (isDev) console.log('Popular Event is served from cached!');
        res.send(cachedData);
    } else {
        remoteRequest();
    }
});

module.exports = router;
