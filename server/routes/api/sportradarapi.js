const router = require('express').Router();
const request = require('request-promise-native');
const tor = require('tor-request');
const cacheService = require('../../services/cache.service');
const { cacheDuration } = require('../../utils');
const auth = require('../auth');
const { db } = require('../../services/firebase.service');

tor.TorControlPort.password = 'muztafultra';

router.get('/:lang/:type/:id', auth.optional, (req, res) => {
    const { type, id, lang } = req.params;
    const cacheKey = `helperData-${type}-${lang}-${id}-provider4`;
    const apiKey = [
        {
            region: 'eu',
            key: 'wshgqxxcvr7uptt3yetu3b8s' // sporarena - Europe
        },
        {
            region: 'intl',
            key: 'efrefsb22mebrc54gbu78ves' // sporarena - Intl
        },
        {
            region: 'other',
            key: 'v4j6ksqubsne2ur9aexuawt7' // sporarena - Other
        },
        {
            region: 'eu',
            key: '3a97ydredjbxvjghxjbzqz2g' // https://github.com/willisgram/master_thesis
        },
        {
            region: 'eu',
            key: 'j9xerbvc24veacrq3hpby6dk' // https://github.com/kberkeland/soccer-glance
        },
        {
            region: 'eu',
            key: 'a4nbj7zwu8r7dzgeaw8yr23t' // https://github.com/antoine-lizee/sportcal
        },
        {
            region: 'eu',
            key: 'ha3v5v65eexxag3av2hnuhwq' // https://github.com/salman90/Live_Scores
        }
    ];

    let path = null;
    if (type === 'teams') path = `teams/sr:competitor:${id}/profile.json`;
    else if (type === 'players') path = `players/sr:player:${id}/profile.json`;
    const initRemoteRequests = (keyIndex = 0) => {
        const provider4options = {
            method: 'GET',
            uri: `https://api.sportradar.us/soccer-xt3/${apiKey[keyIndex].region}/${lang}/${path}?api_key=${apiKey[keyIndex].key}`,
            json: true,
            timeout: 10000
        };
        request(provider4options)
            .then(response => {
                if (response) {
                    /**
                     * @param response.generated_at
                     */
                    if (response.generated_at) delete response.generated_at;
                    if (response.schema) delete response.schema;
                    cacheService.instance().set(cacheKey, response, cacheDuration.provider4[type] || 60);
                    if (db)
                        db.collection('ultraskor_helper4')
                            .doc(`${id}_${type}_${lang}`)
                            .set(response);
                    res.send(response);
                } else {
                    res.status(501).send('Something went wrong!');
                }
            })
            .catch(() => {
                if (keyIndex + 1 < apiKey.length) {
                    initRemoteRequests(keyIndex + 1);
                } else {
                    res.status(500).send('Something went wrong!');
                }
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_helper4').doc(`${id}_${type}_${lang}`);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.provider4[type] || 60);
                    res.send(doc.data());
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                initRemoteRequests();
            });
    } else {
        initRemoteRequests();
    }
});

module.exports = router;
