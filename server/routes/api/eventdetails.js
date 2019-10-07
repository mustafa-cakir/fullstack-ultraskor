const router = require('express').Router();
const cacheService = require('../../cache.service');
const auth = require('../auth');
const { fetchEventDetails } = require('../../fetch/eventdetails');

router.get('/:eventId/:language', auth.optional, (req, res) => {
    const { eventId, language } = req.params; // YYYY-MM-DD

    const remoteRequest = () => {
        fetchEventDetails(eventId, language)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.sendStatus(err);
            });
    };

    const cacheKey = `eventdetails-${eventId}`;
    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        console.log('eventdetails is served from cached!');
        res.send(cachedData);
    } else {
        remoteRequest();
    }
});

module.exports = router;
