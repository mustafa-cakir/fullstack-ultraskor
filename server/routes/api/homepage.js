const moment = require('moment');
const router = require('express').Router();
const cacheService = require('../../services/cache.service');
const { cacheDuration } = require('../../utils');
const auth = require('../auth');
const { isEmpty, isDev } = require('../../utils');
const { fetchHomepage } = require('../../fetch/homepage');

router.get('/:date', auth.optional, (req, res) => {
    const { date } = req.params; // YYYY-MM-DD
    const isToday = moment(date, 'YYYY-MM-DD').isSame(moment(), 'day');
    const cacheKey = `homepageListData-${date}`;

    const remoteRequest = () => {
        fetchHomepage(date)
            .then((data) => {
                if (!isEmpty(data)) {
                    cacheService.instance().set(cacheKey, data, cacheDuration.homepageList);
                }
                res.send(data);
            })
            .catch(() => {
                res.sendStatus(501);
            });
    };

    // if (isToday) {
    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        if (isDev) console.log('homepageListData is served from cached!');
        res.send(cachedData);
    } else {
        remoteRequest();
    }
    // } else {
    //     remoteRequest();
    // }
});

module.exports = router;
