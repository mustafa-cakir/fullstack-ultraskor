const router = require('express').Router();
const cacheService = require('../../services/cache.service');
const auth = require('../auth');
const { fetchSofaScore } = require('../../fetch/sofascore');
const { isDev, cacheDuration, mergeTeamData } = require('../../utils');

router.get('/:teamId', auth.optional, (req, res) => {
    console.log('## teamId');
    const { teamId } = req.params; // YYYY-MM-DD
    const cacheKey = `team-${teamId}`;

    const remoteRequest = () => {
        fetchSofaScore(`/team/${teamId}/events/json`)
            .then(data => {
                const merged = mergeTeamData(data.tournaments, true);
                cacheService.instance().set(cacheKey, merged, cacheDuration.hour24);
                res.send(merged);
            })
            .catch(err => {
                res.status(500).send(isDev ? err : 'Can not retrieve information from server');
            });
    };
    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        if (isDev) console.log('Team data is served from cached!');
        res.send(cachedData);
    } else {
        remoteRequest();
    }
});

module.exports = router;
