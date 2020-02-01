const moment = require('moment');
const router = require('express').Router();
const cacheService = require('../../services/cache.service');
const { cacheDuration } = require('../../utils');
const auth = require('../auth');
const { isEmpty, isDev } = require('../../utils');
const { fetchHomepage } = require('../../fetch/homepage');

router.get('/:date/:language', auth.optional, (req, res) => {
    const { date, language } = req.params; // YYYY-MM-DD
    const cacheKey = `homepageListData-${date}`;

    const remoteRequest = () => {
        fetchHomepage(date, language)
            .then(data => {
                if (!isEmpty(data)) {
                    cacheService.instance().set(cacheKey, data, cacheDuration.homepageList);
                }
                res.send(data);
            })
            .catch(() => {
                res.sendStatus(501);
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        if (isDev) console.log('homepageListData is served from cached!');
        res.send(cachedData);
    } else {
        remoteRequest();
    }
});

module.exports = router;
