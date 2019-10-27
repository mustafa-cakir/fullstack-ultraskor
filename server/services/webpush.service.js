const { firebase } = require('./firebase.service');
const cacheService = require('./cache.service');
const { isDev, t } = require('../utils');

exports.initWebPushByWebSocket = data => {
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
                click_action: `https://www.ultraskor.com/eventdetails/${data.event.id}`
            },
            fcm_options: {
                link: `https://www.ultraskor.com/eventdetails/${data.event.id}`
            }
        },
        topic: `match_${data.event.id}`
    };

    const homeTeamName = t(data.event.teams.home.name);
    const awayTeamName = t(data.event.teams.away.name);
    const teamNames = `${homeTeamName} - ${awayTeamName}`;
    const teamNamesWithScore = `${homeTeamName} ${data.event.scores.home} - ${data.event.scores.away} ${awayTeamName}`;

    if (data.type === 'status_update') {
        if (data.event.status.code === 6) {
            // game started
            message.webpush.notification.title = `Maç Başladı`;
            message.webpush.notification.body = teamNames;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/start.mp3';
        } else if (data.event.status.code === 31) {
            // half time result
            message.webpush.notification.title = `İlk Yarı Sonucu`;
            message.webpush.notification.body = teamNamesWithScore;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/half-time.mp3';
        } else if (data.event.status.code === 7) {
            // 2nd half started
            message.webpush.notification.title = `İkinci Yarı Başladı`;
            message.webpush.notification.body = teamNamesWithScore;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/half-time.mp3';
        } else if (data.event.status.code === 100) {
            // full time result
            message.webpush.notification.title = `Maç Sonucu`;
            message.webpush.notification.body = teamNamesWithScore;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/finish.mp3';
        } else if (data.event.status.code === 60) {
            // game postponed
            message.webpush.notification.title = `Maç Ertelendi`;
            message.webpush.notification.body = teamNames;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/cancel.mp3';
        } else if (data.event.status.code === 70) {
            // game cancelled
            message.webpush.notification.title = `Maç İptal Edildi`;
            message.webpush.notification.body = teamNames;
            message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/cancel.mp3';
        }
    } else if (data.type === 'away_redcard' || data.type === 'home_redcard') {
        // red card
        message.webpush.notification.title = `KIRMIZI KART ${data.event.statusBoxContent}' ${
            data.type === 'home_redcard' ? homeTeamName : awayTeamName
        }`;
        message.webpush.notification.body = teamNamesWithScore;
        message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${
            data.type === 'home_redcard' ? data.event.teams.home.id : data.event.teams.away.id
        }.png`;
        message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/red-card.mp3';
    } else if (data.type === 'home_scored' || data.type === 'away_scored') {
        //  goal scored
        message.webpush.notification.title = `GOL ${data.event.statusBoxContent}' ${
            data.type === 'home_scored' ? homeTeamName : awayTeamName
        }`;
        message.webpush.notification.body = teamNamesWithScore;
        message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${
            data.type === 'home_scored' ? data.event.teams.home.id : data.event.teams.away.id
        }.png`;
        message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/goal.mp3';
    } else if (data.type === 'home_scored_cancel' || data.type === 'away_scored_cancel') {
        // goal scored cancelled
        message.webpush.notification.title = `GOL İPTAL ${
            data.type === 'home_scored_cancel' ? homeTeamName : awayTeamName
        }`;
        message.webpush.notification.body = teamNamesWithScore;
        message.webpush.notification.icon = `https://www.ultraskor.com/images/team-logo/football_${
            data.type === 'home_scored_cancel' ? data.event.teams.home.id : data.event.teams.away.id
        }.png`;
        message.webpush.notification.sound = 'https://www.ultraskor.com/static/media/sound/cancel.mp3';
    }

    if (message.webpush.notification.title) {
        const cacheKey = `/topics/match_${data.event.id}`;
        cacheService.instance().get(cacheKey, (err, cachedData) => {
            if (typeof cachedData !== 'undefined') {
                // subscription found for this topic, send notification
                console.log('subscription found, send the push for ', data.event.id);
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
                    `Subscription not found, no push for ${homeTeamName} - ${awayTeamName}, ${data.event.id}. The incident was ${data.type}`
                );
            }
        });
    }
};
