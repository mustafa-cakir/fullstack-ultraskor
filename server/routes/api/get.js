const router = require('express').Router();
const { cacheDuration } = require('../../utils');
const auth = require('../auth');
const { fetchSportRadarS5 } = require('../../fetch/sportradar');

router.get('/:language/**', auth.optional, (req, res) => {
    const { language = 'en' } = req.params;
    const cacheDur = cacheDuration.main[req.query.page] || 5;
    fetchSportRadarS5(language, req.params[0], cacheDur, false)
        .then((response) => {
            res.send(response.doc[0].data);
        })
        .catch(() => {
            res.status(500).send('Something went wrong!');
        });
});

module.exports = router;
