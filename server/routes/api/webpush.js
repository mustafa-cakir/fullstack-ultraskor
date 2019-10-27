const router = require('express').Router();
const { firebase } = require('../../services/firebase.service');
const cacheService = require('../../services/cache.service');
const auth = require('../auth');
const { cacheDuration } = require('../../utils');

router.post('/', auth.optional, (req, res) => {
    const { method, token, topic } = req.body;
    const cacheKey = topic;
    firebase
        .messaging()
        [method](token, topic)
        .then(() => {
            cacheService.instance().set(cacheKey, 'true', cacheDuration.webpushtopic);
            res.send(`Successfully ${method} to topic`);
        })
        .catch(err => {
            res.status(500).send(`An error occurred while processing your request, err: ${err}`);
        });
});

module.exports = router;
