const router = require('express').Router();
const cacheService = require('../../services/cache.service');
const auth = require('../auth');
const { fetchSportRadar } = require('../../fetch/sportradar');
const { fetchSofaScore } = require('../../fetch/sofascore');
const { isDev, cacheDuration, mergeTeamData } = require('../../utils');

router.get('/info/:language/:teamId', auth.optional, (req, res) => {
    const { teamId, language } = req.params; // YYYY-MM-DD
    const cacheKey = `team-info-${language}-${teamId}`;
    const remoteRequest = () => {
        fetchSportRadar(`/${language}/Europe:Istanbul/gismo/stats_team_info/${teamId}`)
            .then(data => {
                if (data && data.doc && data.doc[0] && data.doc[0].data) {
                    cacheService.instance().set(cacheKey, data.doc[0].data, cacheDuration.day7);
                    res.send(data.doc[0].data);
                } else {
                    throw Error('500');
                }
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

router.get('/:teamId/:offset/:nav', auth.optional, (req, res) => {
    const { teamId, offset, nav } = req.params; // YYYY-MM-DD
    const cacheKey = `team-${teamId}-${offset}-${nav}`;
    const remoteRequest = () => {
        fetchSofaScore(`/team/${teamId}/events/${offset}/${nav}`)
            .then(data => {
                if (data.tournaments) {
                    const merged = mergeTeamData(data.tournaments, true);
                    cacheService.instance().set(cacheKey, merged, cacheDuration.hour24);
                    res.send(merged);
                } else {
                    res.send('');
                }
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

router.get('/:teamId', auth.optional, (req, res) => {
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
