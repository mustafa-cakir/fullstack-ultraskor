const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchBroadage } = require('./broadage');
const { mergeHomepageData, cacheDuration } = require('../utils');

const fetchHomepage = date =>
    new Promise((resolve, reject) => {
        const pAll = [
            fetchSofaScore(`/football//${date}/json`, cacheDuration.min30).catch(err => console.log(err)),
            fetchSportRadar(`/tr/Europe:Istanbul/gismo/sport_matches/1/${date}/1`, cacheDuration.hour24).catch(
                () => null
            ),
            fetchBroadage(date, cacheDuration.hour24).catch(() => null)
        ];
        Promise.all(pAll)
            .then(responses => {
                mergeHomepageData(responses[0], responses[1], responses[2])
                    .then(data => {
                        resolve(data);
                    })
                    .catch(err => {
                        reject(err);
                    });
            })
            .catch(err => reject(err));
    });
exports.fetchHomepage = fetchHomepage;
