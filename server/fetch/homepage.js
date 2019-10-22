const { isDev } = require('../helper');
const { fetchSofaScore } = require('./sofascore');
const { fetchSportRadar } = require('./sportradar');
const { fetchBroadage } = require('./broadage');
const { mergeHomepageData } = require('../helper');

const fetchHomepage = date =>
    new Promise((resolve, reject) => {
        const isTor = true;
        fetchSofaScore(`/football//${date}/json`, null, isTor)
            .then(sofa => {
                fetchSportRadar(`/tr/Europe:Istanbul/gismo/sport_matches/1/${date}/1`, null, isTor)
                    .then(radar => {
                        fetchBroadage(date, null, isTor)
                            .then(broad => {
                                mergeHomepageData(sofa, radar, broad)
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
