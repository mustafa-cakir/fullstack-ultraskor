const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchBroadage } = require('./broadage');
const { mergeHomepageData } = require('../helper');

const fetchHomepage = date =>
    new Promise((resolve, reject) => {
        const pAll = [];
        const p1 = fetchSofaScore(`/football//${date}/json`).catch(() => {
            return null;
        });
        const p2 = fetchSportRadar(`/tr/Europe:Istanbul/gismo/sport_matches/1/${date}/1`).catch(() => {
            return null;
        });

        const p3 = fetchBroadage(date).catch(() => {
            return null;
        });

        pAll.push(p1, p2, p3);

        Promise.all(pAll)
            .then(values => {
                mergeHomepageData(values[0], values[1], values[2])
                    .then(data => {
                        resolve(data);
                    })
                    .catch(err => {
                        reject(err);
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
exports.fetchHomepage = fetchHomepage;
