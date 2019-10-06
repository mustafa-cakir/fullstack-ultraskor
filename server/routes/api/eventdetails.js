const router = require('express').Router();
const cacheService = require('../../cache.service');
const auth = require('../auth');
const { fetchEventDetails } = require('../../fetch/eventdetails');

router.get('/:ids/:language', auth.optional, (req, res) => {
    const { ids, language } = req.params; // YYYY-MM-DD

    const remoteRequest = () => {
        fetchEventDetails(ids, language)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.sendStatus(err);
            });
    };

    const cacheKey = `eventdetails-${ids}`;
    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        console.log('eventdetails is served from cached!');
        res.send(cachedData);
    } else {
        remoteRequest();
    }
});

module.exports = router;
