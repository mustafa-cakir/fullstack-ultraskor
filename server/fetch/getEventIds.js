const { db } = require('../utils/firebase');
const cacheService = require('../cache.service');
const { cacheDuration } = require('../helper');

exports.getEventIds = date => {
    const cacheKey = `eventIdsByDate-${date}`;
    return new Promise((resolve, reject) => {
        const cachedData = cacheService.instance().get(cacheKey);
        if (cachedData) {
            resolve(cachedData);
        } else {
            const ref = db.collection('ultraskor_eventIds_by_date').doc(date);
            ref.get()
                .then(doc => {
                    if (doc.exists) {
                        cacheService.instance().set(cacheKey, doc.data(), cacheDuration.eventIdTable);
                        resolve(doc.data());
                    } else {
                        reject(Error('DB: not exist'));
                    }
                })
                .catch(() => {
                    reject(Error('DB: not connected'));
                });
        }
    });
};
