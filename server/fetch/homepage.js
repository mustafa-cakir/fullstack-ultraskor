const { fetchSportRadar } = require('./sportradar');
const { simplifyRadarHomepage } = require('../utils');

const fetchHomepage = (date, language) =>
    new Promise((resolve, reject) => {
        fetchSportRadar(`/${language}/Europe:Istanbul/gismo/sport_matches/1/${date}/1`, 20)
            .then(res => {
            	const result = simplifyRadarHomepage(res);
                // const { realcategories } = res.doc[0].data.sport;
                resolve(result);
            })
            .catch(err => reject(err));
    });
exports.fetchHomepage = fetchHomepage;
