const { fetchSportRadar } = require('./sportradar');
const { simplifyRadarHomepage } = require('../utils');

const fetchHomepage = (date, language) =>
    new Promise((resolve, reject) => {
        fetchSportRadar(`/${language}/Europe:Istanbul/gismo/sport_matches/1/${date}/1`)
            .then(res => {
                const radarHomepage = simplifyRadarHomepage(res);
                resolve(radarHomepage);
            })
            .catch(err => reject(err));
    });
exports.fetchHomepage = fetchHomepage;
