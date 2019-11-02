const router = require('express').Router();
const cacheService = require('../../services/cache.service');
const auth = require('../auth');
const { processSofaH2hData } = require('../../utils');
const { convertToSofaScoreID } = require('../../utils');
const { fetchSofaScore } = require('../../fetch/sofascore');
const { isDev, cacheDuration, isEmpty } = require('../../utils');
const { fetchEventDetails } = require('../../fetch/eventdetails');

router.get('/:eventId/lineups', auth.optional, (req, res) => {
    const { eventId } = req.params;
    const id = convertToSofaScoreID(eventId);

    fetchSofaScore(`/event/${id}/lineups/json`, cacheDuration.min10)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(isDev ? err : 'Can not retrieve information from server');
        });
});

router.get('/:eventId/matches', auth.optional, (req, res) => {
    const { eventId } = req.params;
    const id = convertToSofaScoreID(eventId);

    fetchSofaScore(`/event/${id}/matches/json`, cacheDuration.min10)
        .then(data => {
            const processed = processSofaH2hData(data);
            res.send(processed);
        })
        .catch(err => {
            res.status(500).send(isDev ? err : 'Can not retrieve information from server');
        });
});

router.get('/:eventId/:language', auth.optional, (req, res) => {
    const { eventId, language } = req.params; // YYYY-MM-DD
    fetchEventDetails(eventId, language)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(isDev ? err : 'Can not retrieve information from server');
        });
});

module.exports = router;
