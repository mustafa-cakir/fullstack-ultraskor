const fetchSofaScore = require('./sofascore');
const fetchSportRadar = require('./sportradar');
const fetchOley = require('./oley');
const { mergeHomepageData } = require('../helper');

module.exports = date =>
    new Promise((resolve, reject) => {
        fetchSofaScore(`/football//${date}/json`)
            .then(sofa => {
                fetchSportRadar(date)
                    .then(radar => {
                        fetchOley(date)
                            .then(oley => {
                                const merged = mergeHomepageData(sofa, radar, oley);
                                if (!merged) throw Error('error');
                                resolve(merged);
                            })
                            .catch(err => {
                                console.log(err);
                                reject(Error('502'));
                            });
                    })
                    .catch(err => {
                        console.log(err);
                        reject(Error('501'));
                    });
            })
            .catch(() => {
                reject(Error('500'));
            });
    });
