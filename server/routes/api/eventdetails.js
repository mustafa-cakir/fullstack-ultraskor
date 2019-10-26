const router = require('express').Router();
const cacheService = require('../../services/cache.service');
const auth = require('../auth');
const { isDev, cacheDuration, isEmpty } = require('../../utils');
const { fetchEventDetails } = require('../../fetch/eventdetails');

router.get('/:eventId/:language', auth.optional, (req, res) => {
    const { eventId, language } = req.params; // YYYY-MM-DD
    const cacheKey = `eventdetails-${eventId}-${language}`;

    const remoteRequest = () => {
        fetchEventDetails(eventId, language)
            .then(data => {
                if (!isEmpty(data)) {
                    cacheService.instance().set(cacheKey, data, cacheDuration.min30);
                }
                res.send(data);
            })
            .catch(err => {
                res.status(500).send(isDev ? err : 'Can not retrieve information from server');
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        if (isDev) console.log('eventdetails is served from cached!');
        res.send(cachedData);
    } else {
        remoteRequest();
    }
});

module.exports = router;
