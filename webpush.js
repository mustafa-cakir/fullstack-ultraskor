const helper = require('./helper');

const firebaseAdmin = require('firebase-admin');
const cacheService = require('./cache.service');

const FireBaseServiceAccount = require("./livescores-firebase-adminsdk-l00mx-232f16f146");

exports.init = () => {
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(FireBaseServiceAccount),
		databaseURL: "https://livescores-54cdf.firebaseio.com"
	});
};

exports.initWebPushByWebSocket = (data) => {
	let message = {
		webpush: {
			notification: {
				title: '',
				body: '',
				icon: 'https://www.ultraskor.com/apple-touch-icon.png',
				click_action: `https://www.ultraskor.com/eventdetails/${data.event.id}`
			}
		},
		topic: `match_${data.event.id}`
	};

	let homeTeamName = helper.t(data.event.homeTeam.name);
	let awayTeamName = helper.t(data.event.awayTeam.name);
	let teamNames = `${homeTeamName} - ${awayTeamName}`;
	let teamNamesWithScore = `${homeTeamName} ${data.event.homeScore.current} - ${data.event.awayScore.current} ${awayTeamName}`

	if (data.type === "status_update") {
		if (data.event.status.code === 6) {
			// game started
			message.webpush.notification.title = `Maç Başladı`;
			message.webpush.notification.body = teamNames;

		} else if (data.event.status.code === 31) {
			// half time result
			message.webpush.notification.title = `İlk Yarı Sonucu`;
			message.webpush.notification.body = teamNamesWithScore;

		} else if (data.event.status.code === 7) {
			// 2nd half started
			message.webpush.notification.title = `İkinci Yarı Başladı`;
			message.webpush.notification.body = teamNamesWithScore;

		} else if (data.event.status.code === 100) {
			// full time result
			message.webpush.notification.title = `Maç Sonucu`;
			message.webpush.notification.body = teamNamesWithScore;

		} else if (data.event.status.code === 60) {
			// game postponed
			message.webpush.notification.title = `Maç Ertelendi`;
			message.webpush.notification.body = teamNames;

		} else if (data.event.status.code === 70) {
			// game cancelled
			message.webpush.notification.title = `Maç İptal Edildi`;
			message.webpush.notification.body = teamNames;

		}
	} else if (data.type === "away_redcard" || data.type === "home_redcard") {
		// red card
		message.webpush.notification.title = `KIRMIZI KART ${data.event.statusDescription}' ${data.type === "home_redcard" ? homeTeamName : awayTeamName}`;
		message.webpush.notification.body = teamNamesWithScore;
		message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${data.type === "home_redcard" ? data.event.homeTeam.id : data.event.awayTeam.id}.png`;

	} else if (data.type === "home_scored" || data.type === "away_scored") {
		//  goal scored
		message.webpush.notification.title = `GOL ${data.event.statusDescription}' ${data.type === "home_scored" ? homeTeamName : awayTeamName}`;
		message.webpush.notification.body = teamNamesWithScore;
		message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${data.type === "home_scored" ? data.event.homeTeam.id : data.event.awayTeam.id}.png`;

	} else if (data.type === "home_scored_cancel" || data.type === "away_scored_cancel") {
		// goal scored cancelled
		message.webpush.notification.title = `GOL İPTAL ${data.type === "home_scored_cancel" ? homeTeamName : awayTeamName}`;
		message.webpush.notification.body = teamNamesWithScore;
		message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${data.type === "home_scored_cancel" ? data.event.homeTeam.id : data.event.awayTeam.id}.png`;
	}

	if (message.webpush.notification.title) {
		const cacheKey = `/topics/match_${data.event.id}`;
		cacheService.instance().get(cacheKey, (err, cachedData) => {
			if (typeof cachedData !== "undefined") { // subscription found for this topic, send notification
				console.log('subscription found, send the push for ', data.event.id);
				firebaseAdmin.messaging().send(message)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
					})
					.catch((error) => {
						console.log('Error sending message:', error);
					});
			} else { // Cache is not found, no one is subscribe to this topic.
				if (helper.isDev) console.log(`Subscription not found, no push for ${homeTeamName} - ${awayTeamName}, ${data.event.id}. The incident was ${data.type}`);
			}
		});
	}
};
