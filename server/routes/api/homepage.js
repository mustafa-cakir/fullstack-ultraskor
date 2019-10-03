const moment = require('moment');
const router = require('express').Router();
const cacheService = require('../../cache.service');
const auth = require('../auth');
const fetchHomepage = require('../../fetch/homepage');

router.get('/:date', auth.optional, (req, res) => {
    const { date } = req.params; // YYYY-MM-DD
    const isToday = moment(date, 'YYYY-MM-DD').isSame(moment(), 'day');

    const remoteRequest = () => {
        fetchHomepage(date)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.sendStatus(err);
            });
    };

    if (isToday) {
        const cacheKey = `homepageListData-${moment().format('YYYY-MM-DD')}`;
        const cachedData = cacheService.instance().get(cacheKey);
        if (typeof cachedData !== 'undefined') {
            console.log('homepageListData is served from cached!');
            res.send(cachedData);
        } else {
            remoteRequest();
        }
    } else {
        remoteRequest();
    }
});

module.exports = router;
