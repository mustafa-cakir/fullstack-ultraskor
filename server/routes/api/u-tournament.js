const router = require('express').Router();
const cacheService = require('../../cache.service');
const auth = require('../auth');
const { mergeUTournamentRoundsData } = require('../../helper');
const { mergeUTournamentData } = require('../../helper');
const { fetchSofaScore } = require('../../fetch/sofascore');
const { isDev, cacheDuration } = require('../../helper');

router.get('/:leagueid/:seasonid', auth.optional, (req, res) => {
    const { leagueid, seasonid } = req.params; // YYYY-MM-DD
    const cacheKey = `u-tournament-${leagueid}-${seasonid}`;

    const remoteRequest = () => {
        fetchSofaScore(`/u-tournament/${leagueid}/season/${seasonid}/json`)
            .then(data => {
                const merged = mergeUTournamentData(data);
                cacheService.instance().set(cacheKey, merged, cacheDuration.uTournamentStandings);
                res.send(merged); //
            })
            .catch(err => {
                res.status(500).send(isDev ? err : 'Can not retrieve information from server');
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

router.get('/:leagueid/:seasonid/matches/round/:round/:name?', auth.optional, (req, res) => {
    const { leagueid, seasonid, round, name } = req.params; // YYYY-MM-DD
    const cacheKey = `u-tournament-${leagueid}-${seasonid}-${round}-${name}`;

    const remoteRequest = () => {
        fetchSofaScore(`/u-tournament/${leagueid}/season/${seasonid}/matches/round/${round}${name ? `/${name}` : ''}`)
            .then(data => {
                const merged = mergeUTournamentRoundsData(data);
                cacheService.instance().set(cacheKey, merged, cacheDuration.uTournamentStandingsRounds);
                res.send(merged);
            })
            .catch(err => {
                res.status(500).send(isDev ? err : 'Can not retrieve information from server');
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
