// const moment = require('moment');
const router = require('express').Router();
// const cacheService = require('../../cache.service');
const auth = require('../auth');
const fetchSofaScore = require('../../fetch/sofascore');
const fetchSportRadar = require('../../fetch/sportradar');
const { mergeSofaAndRadar } = require('../../helper');

router.get('/:date', auth.optional, (req, res) => {
    const { date } = req.params; // YYYY-MM-DD
    // const isToday = moment(date, 'YYYY-MM-DD').isSame(moment(), 'day');
    // const cacheKey = isToday ? "fullData" : `mainData-${date}-homepage`;

    fetchSofaScore(`/football//${date}/json`)
        .then(sofa => {
            fetchSportRadar(date)
                .then(radar => {
                    const merged = mergeSofaAndRadar(sofa, radar);
                    if (!merged) throw Error('error');
                    res.send(merged);
                })
                .catch(err => {
                    console.log(err);
                    res.sendStatus(501);
                });
        })
        .catch(() => {
            res.sendStatus(500);
        });
});

module.exports = router;
