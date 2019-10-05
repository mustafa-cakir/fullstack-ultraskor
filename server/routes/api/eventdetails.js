const moment = require('moment');
const router = require('express').Router();
const auth = require('../auth');
const { getEventIds } = require('../../fetch/getEventIds');

router.get('/:date/:eventid', auth.optional, (req, res) => {
    const { date, eventid } = req.params; // YYYY-MM-DD

    getEventIds(date).then(eventIds => {
        res.send(eventIds);
    });
});

module.exports = router;
