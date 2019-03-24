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

exports.initWebPush = (changes) => {
	changes.forEach(x => {
		x.forEach(change => {
			if (change.kind === "E" && change.event && change.event.id) {
				let message = {
					webpush: {
						notification: {
							title: '',
							body: '',
							icon: '',
							click_action: ''
						}
					},
					topic: `match_${change.event.id}`
				};

				if ((change.path[0] === "homeScore" || change.path[0] === "awayScore") && change.path[1] === "current") { // home or away scored!!
					if (parseInt(change.rhs) > parseInt(change.lhs)) {
						message.webpush.notification.title = `GOL ${change.event.statusDescription}' ${change.path[0] === "homeScore" ? helper.t(change.event.homeTeam.name) : helper.t(change.event.awayTeam.name)}`;
						message.webpush.notification.body = `${helper.t(change.event.homeTeam.name)} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${helper.t(change.event.awayTeam.name)}`;
						message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${change.path[0] === "homeScore" ? change.event.homeTeam.id : change.event.awayTeam.id}`;
						message.webpush.notification.click_action = `http://ultraskor.com/eventdetails/${change.event.id}`;
					} else {
						message.webpush.notification.title = `GOL İPTAL ${change.path[0] === "homeScore" ? helper.t(change.event.homeTeam.name) : helper.t(change.event.awayTeam.name)}`;
						message.webpush.notification.body = `${helper.t(change.event.homeTeam.name)} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${helper.t(change.event.awayTeam.name)}`;
						message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${change.path[0] === "homeScore" ? change.event.homeTeam.id : change.event.awayTeam.id}`;
						message.webpush.notification.click_action = `https://www.ultraskor.com/eventdetails/${change.event.id}`;
					}
				} else if (change.path[0] === "homeRedCards" || change.path[0] === "awayRedCards") {
					message.webpush.notification.title = `Kırmızı Kart ${change.event.statusDescription}' ${change.path[0] === "homeRedCards" ? helper.t(change.event.homeTeam.name) : helper.t(change.event.awayTeam.name)}`;
					message.webpush.notification.body = `${helper.t(change.event.homeTeam.name)} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${helper.t(change.event.awayTeam.name)}`;
					message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${change.path[0] === "homeRedCards" ? change.event.homeTeam.id : change.event.awayTeam.id}`;
					message.webpush.notification.click_action = `https://www.ultraskor.com/eventdetails/${change.event.id}`;
				} else if (change.path[0] === "status" && change.path[1] === "code") {
					if (change.lhs === 0 && change.rhs === 6) { // game started
						message.webpush.notification.title = `Maç Başladı`;
						message.webpush.notification.body = `${helper.t(change.event.homeTeam.name)} - ${helper.t(change.event.awayTeam.name)}`;
					} else if (change.lhs === 6 && change.rhs === 31) { // half time
						message.webpush.notification.title = `İlk Yarı Sonucu`;
						message.webpush.notification.body = `${helper.t(change.event.homeTeam.name)} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${helper.t(change.event.awayTeam.name)}`;
					} else if (change.lhs === 31 && change.rhs === 7) { // 2nd half started
						message.webpush.notification.title = `İkinci Yarı Başladı`;
						message.webpush.notification.body = `${helper.t(change.event.homeTeam.name)} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${helper.t(change.event.awayTeam.name)}`;
					} else if (change.rhs === 100) { // full time
						message.webpush.notification.title = `Maç Sonucu`;
						message.webpush.notification.body = `${helper.t(change.event.homeTeam.name)} ${change.event.homeScore.current} - ${change.event.awayScore.current} ${helper.t(change.event.awayTeam.name)}`;
					}
					message.webpush.notification.icon = `https://www.ultraskor.com/apple-touch-icon.png`;
					message.webpush.notification.click_action = `https://www.ultraskor.com/eventdetails/${change.event.id}`;
				}

				if (message.webpush.notification.title) {
					const cacheKey = `/topics/match_${change.event.id}`;
					cacheService.instance().get(cacheKey, (err, cachedData) => {
						if (typeof cachedData !== "undefined") { // subscription found for this topic, send notification
							console.log('subscription found, send the push for ', change.event.id);
							firebaseAdmin.messaging().send(message)
								.then((response) => {
									// Response is a message ID string.
									console.log('Successfully sent message:', response);
								})
								.catch((error) => {
									console.log('Error sending message:', error);
								});
						} else { // Cache is not found, no one is subscribe to this topic.
							console.log('subscription not found, dont send any push for ', change.event.id);
						}
					});
				}
			}
		});
	});
};
