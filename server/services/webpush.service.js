const { firebase } = require('./firebase.service');
const cacheService = require('./cache.service');
const { isDev, t } = require('../utils');

exports.initWebPushByWebSocket = (oldEvent, newEvent) => {
    let type;
    if (newEvent.status.code !== oldEvent.status.code) type = 'status_update';
    if (newEvent.redCards.home > oldEvent.redCards.home) type = 'home_redcard';
    if (newEvent.redCards.away > oldEvent.redCards.away) type = 'away_redcard';
    if (newEvent.scores.home > oldEvent.scores.home) type = 'home_scored';
    if (newEvent.scores.home < oldEvent.scores.home) type = 'home_scored_cancel';
    if (newEvent.scores.away > oldEvent.scores.away) type = 'away_scored';
    if (newEvent.scores.away < oldEvent.scores.away) type = 'away_scored_cancel';
    if (!type) return false;

    const { teams, id, scores, status, statusBoxContent } = newEvent;
    const message = {
        webpush: {
            headers: {
                Urgency: 'high',
                TTL: '900'
            },
            notification: {
                title: '',
                body: '',
                badge: 'https://www.ultraskor.com/favicon-32x32.png',
                vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500],
                color: '#0857bf',
                icon: 'https://www.ultraskor.com/apple-touch-icon.png',
                click_action: `https://www.ultraskor.com/eventdetails/${id}`
            },
            fcm_options: {
                link: `https://www.ultraskor.com/eventdetails/${id}`
            }
        },
        topic: `match_${id}`
    };

    const homeTeamName = t(teams.home.name);
    const awayTeamName = t(teams.away.name);
    const teamNames = `${homeTeamName} - ${awayTeamName}`;
    const teamNamesWithScore = `${homeTeamName} ${scores.home} - ${scores.away} ${awayTeamName}`;

    if (type === 'status_update') {
        if (status.code === 6) {
            // game started
            message.webpush.notification.title = `Maç Başladı`;
            message.webpush.notification.body = teamNames;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/start.mp3';
        } else if (status.code === 31) {
            // half time result
            message.webpush.notification.title = `İlk Yarı Sonucu`;
            message.webpush.notification.body = teamNamesWithScore;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/half-time.mp3';
        } else if (status.code === 7) {
            // 2nd half started
            message.webpush.notification.title = `İkinci Yarı Başladı`;
            message.webpush.notification.body = teamNamesWithScore;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/half-time.mp3';
        } else if (status.code === 100) {
            // full time result
            message.webpush.notification.title = `Maç Sonucu`;
            message.webpush.notification.body = teamNamesWithScore;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/finish.mp3';
        } else if (status.code === 60) {
            // game postponed
            message.webpush.notification.title = `Maç Ertelendi`;
            message.webpush.notification.body = teamNames;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/cancel.mp3';
        } else if (status.code === 70) {
            // game cancelled
            message.webpush.notification.title = `Maç İptal Edildi`;
            message.webpush.notification.body = teamNames;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/cancel.mp3';
        }
    } else if (type === 'away_redcard' || type === 'home_redcard') {
        // red card
        message.webpush.notification.title = `KIRMIZI KART ${statusBoxContent}' ${
            type === 'home_redcard' ? homeTeamName : awayTeamName
        }`;
        message.webpush.notification.body = teamNamesWithScore;
        message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${
            type === 'home_redcard' ? teams.home.id : teams.away.id
        }.png`;
        message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/red-card.mp3';
    } else if (type === 'home_scored' || type === 'away_scored') {
        //  goal scored
        message.webpush.notification.title = `GOL ${statusBoxContent}' ${
            type === 'home_scored' ? homeTeamName : awayTeamName
        }`;
        message.webpush.notification.body = teamNamesWithScore;
        message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${
            type === 'home_scored' ? teams.home.id : teams.away.id
        }.png`;
        message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/goal.mp3';
    } else if (type === 'home_scored_cancel' || type === 'away_scored_cancel') {
        // goal scored cancelled
        message.webpush.notification.title = `GOL İPTAL ${type === 'home_scored_cancel' ? homeTeamName : awayTeamName}`;
        message.webpush.notification.body = teamNamesWithScore;
        message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${
            type === 'home_scored_cancel' ? teams.home.id : teams.away.id
        }.png`;
        message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/cancel.mp3';
    }

    if (message.webpush.notification.title) {
        const cacheKey = `/topics/match_${id}`;
        const cachedData = cacheService.instance().get(cacheKey);
        if (typeof cachedData !== 'undefined') {
            // subscription found for this topic, send notification
            console.log('subscription found, send the push for ', id);
            firebase
                .messaging()
                .send(message)
                .then(response => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                })
                .catch(error => {
                    console.log('Error sending message:', error);
                });
        } else if (isDev) {
            console.log(
                `Subscription not found, no push for ${homeTeamName} - ${awayTeamName}, ${id}. The incident was ${type}`
            );
        }
    }
    return false;
};
