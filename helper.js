const _ = require('lodash');
const cors = require('cors');

exports.preProcessHelper1Data = data => {
	let result = null;
	if (data.doc && data.doc.length > 0 && data.doc[0].data && data.doc[0].data) {
		result = data.doc[0].data.sport.realcategories.reduce((all, current) => {
			if (current.tournaments && current.tournaments.length > 0) {
				current.tournaments.forEach(tournament => {
					if (tournament.matches && tournament.matches.length > 0) {
						tournament.matches.forEach(match => {
							let tempMatch = {};
							tempMatch.id = match._id || null;
							tempMatch.homeTeam = match.teams.home || null;
							tempMatch.awayTeam = match.teams.away || null;
							tempMatch.date = match._dt.date || null;
							tempMatch.startTime = match._dt.time || null;
							tempMatch.startTimestamp = match._dt.uts || null;
							all.push(tempMatch);
						});
					}
				});
			}
			return all;
		}, []);
	}
	return result;
};

exports.replaceDotWithUnderscore = obj => {
	_.forOwn(obj, (value, key) => {

		// if key has a period, replace all occurences with an underscore
		if (_.includes(key, '.')) {
			const cleanKey = _.replace(key, /\./g, '_');
			obj[cleanKey] = value;
			delete obj[key];
		}

		// continue recursively looping through if we have an object or array
		if (_.isObject(value)) {
			return this.replaceDotWithUnderscore(value);
		}
	});
	return obj;
};

exports.simplifyIddaaHelperData = response => {
const data = response && response.bulletin && response.bulletin.Soccer
	&& response.bulletin.Soccer.eventList
	&& response.bulletin.Soccer.eventList.length > 0 ? response.bulletin.Soccer.eventList : null;

	data.forEach(item => {
		delete item.helperInfo;
		delete item.mappingMarket
	});
	return data;
};

exports.simplifyHomeData = res => {
	if (res && res.sportItem && res.sportItem.tournaments) {
		let eventIgnoredProperties = [
			'changes', 'confirmedLineups', 'customId', 'hasAggregatedScore', 'hasDraw', 'hasEventPlayerHeatMap',
			'hasEventPlayerStatistics', 'hasFirstToServe', 'hasOdds', 'hasGlobalHighlights', 'hasHighlights',
			'hasHighlightsStream', 'hasLineups', 'hasLineupsList', 'hasLiveForm', 'hasLiveOdds', 'hasStatistics',
			'hasSubScore', 'hasTime', 'isAwarded', 'isSyncable', 'roundInfo', 'sport', 'votingEnabled', 'odds'];

		res.sportItem.tournaments = res.sportItem.tournaments.reduce((whole, item) => {
			//const property = item.season ? "season" : "tournament";
			//if (item[property].name.indexOf('Friendly') < 0 && item[property].name.indexOf('Women') < 0) {
			item.events.map(event => {
				for (let i = 0; i < eventIgnoredProperties.length; i++) {
					delete event[eventIgnoredProperties[i]]
				}
				return event
			});
			whole.push(item);
			//}
			return whole;
		}, []);


		// res.sportItem.tournaments = res.sportItem.tournaments.filter(tournament => {
		//     return !(tournament.tournament.name.indexOf('Friendly') > -1 || tournament.tournament.name.indexOf('Women') > -1);
		// });
		//
		// res.sportItem.tournaments.forEach((tournament, index) => {
		// 	// if (tournament.tournament.name.indexOf('Friendly') > -1 || tournament.tournament.name.indexOf('Women') > -1) {
		//     //     console.log('deleted, index:', index);
		// 	// 	res.sportItem.tournaments.splice(index, 1);
		//     // } else {
		//         tournament.events.map(event => {
		// 	        for (let i = 0; i < eventIgnoredProperties.length; i++) {
		// 		        delete event[eventIgnoredProperties[i]]
		// 	        }
		// 	        return event
		//         });
		//     //}
		// });
	}
	return res;
};

exports.cacheDuration = () => {
	return {
		provider1: 60 * 60 * 24, // 24 hours
		provider2: 60 * 60 * 24, // 24 hours
		provider3: 60 * 60 * 24, // 24 hours
		iddaaHelper: 60 * 60 * 24, // 24 hours
		iddaaOdds: 1, // 15 seconds
		webpushtopic: 60 * 60 * 24 * 7, // 7 days
		oley: {
			missings: 60 * 60 * 6, // 6 hours
			teamstats: 60 * 60 * 24, // 24 hours
		},
		provider4: {
			teams: 60 * 60 * 24, // 24 hours
			//funfacts:  60 * 60 * 24, // 24 hours
		},
		main: {
			default: 60, // 1 min.
			homepage: 20, // 20 seconds
			eventdetails: 10, // 10 seconds
			lineup: 60 * 5, // 5 min,
			h2h: 60 * 30, // 30 min
			standing: 60 * 3, // 3 min.
			teamoftheweek: 60 * 60 * 24,  // 24 hours
			leaguedetails: 60 * 3,  // 3 min
			leaguedetailsFixture: 60 * 60 * 24,  // 24 hours
			popularevents: 60 * 60 * 6 // 6 hours
		}
	}
};

exports.generateSlug = text => {
	const a = 'çıüğöşàáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
	const b = 'ciugosaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
	const p = new RegExp(a.split('').join('|'), 'g');

	return text.toString().toLowerCase()
		.replace(/\s+/g, '-')           // Replace spaces with -
		.replace(p, c =>
			b.charAt(a.indexOf(c)))     // Replace special chars
		.replace(/&/g, '-and-')         // Replace & with 'and'
		.replace(/[^\w-]+/g, '')       // Remove all non-word chars
		.replace(/--+/g, '-')         // Replace multiple - with single -
		.replace(/^-+/, '')             // Trim - from start of text
		.replace(/-+$/, '')             // Trim - from end of text
};

exports.t = text => {
	const languageJson = require('./client/src/languages/tr.json');
	if (languageJson[text]) {
		return languageJson[text]
	} else return text;
};

exports.mongoOptions = () => {
	return {
		useNewUrlParser: true,
		keepAlive: 1,
		connectTimeoutMS: 1000,
		socketTimeoutMS: 1000,
	}
};

const whitelist = [
	'http://localhost:5000',
	'http://localhost:5001',
	'http://localhost:3000',
	'https://www.ultraskor.com',
];

const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true)
		} else {
			console.log(origin);
			callback(new Error('Not allowed by CORS'));
		}
	}
};
let activeUser = 0;
exports.userConnected = () => {
	activeUser += 1;
};

exports.userDisconnected = () => {
	activeUser -= 1;
};

exports.isDev = process.env.NODE_ENV === "dev";
exports.isProd = process.env.NODE_ENV !== "dev";
exports.isTorDisabled = process.env.TOR_DISABLED === "true";
// exports.isTorDisabled = false

exports.userCount = () => {
	return activeUser;
};

exports.initCors = () => {
	return cors(corsOptions)
};

exports.simplifyWebSocketData = (res) => {
	let result = {};
	res = JSON.parse(res);
	if (res.data.length > 0 && res.data[1]) {
		res = res.data[1];
		result = {
			info: {
				id: parseInt(res.emits[0].split('_')[1]),
				type: res.emits[1].split('_')[1],
				tournament: parseInt(res.emits[2].split('_')[1]),
				homeTeam: parseInt(res.emits[3].split('_')[1]),
				awayTeam: parseInt(res.emits[4].split('_')[1]),
			},
			...(res.data.changesData && {changesData: res.data.changesData}),
			awayScore: res.data.awayScore,
			homeScore: res.data.homeScore,
			homeTeam: res.data.homeTeam,
			awayTeam: res.data.awayTeam,
			status: res.data.status,
			statusDescription: res.data.statusDescription,
			...(res.data.homeRedCards && {homeRedCards: res.data.homeRedCards}),
			...(res.data.awayRedCards && {awayRedCards: res.data.awayRedCards}),
		}
	}

	return result;
};
