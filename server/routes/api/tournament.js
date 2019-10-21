const router = require('express').Router();
const cacheService = require('../../cache.service');
const auth = require('../auth');
const { fetchSofaScore } = require('../../fetch/sofascore');
const { isDev, cacheDuration } = require('../../helper');

router.get('/standings/:tournamentId/:seasonId', auth.optional, (req, res) => {
    const { tournamentId, seasonId } = req.params; // YYYY-MM-DD
    const cacheKey = `tournament-standings-${tournamentId}-${seasonId}`;

    const remoteRequest = () => {
        fetchSofaScore(`/tournament/${tournamentId}/${seasonId}/standings/tables/json`)
            .then(data => {
                if (data && data.teamEvents) {
                    delete data.teamEvents;
                    cacheService.instance().set(cacheKey, data, cacheDuration.tournamentStandings);
                }
                res.send(data);
            })
            .catch(() => {
                res.status(500).send('Can not retrieve information from server');
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        if (isDev) console.log('Tournament standing is served from cached!');
        res.send(cachedData);
    } else {
        remoteRequest();
    }
});

module.exports = router;
