const request = require('request-promise-native');
const cacheService = require('../../cache.service');
const firebase = require('../firebase');
const tor = require('../tor');
const { cacheDuration, isTorDisabled, userDisconnected } = require('../../helper');
const { db } = require('../firebase/db');

const socketHandler = (socket, io) => {
    socket.emit('heyooo', 'mesg heyoo');

    socket.on('get-updates-homepage', () => {
        const cachedData = cacheService.instance().get('fullData');
        socket.emit('return-updates-homepage', cachedData || null);
    });

    socket.on('get-flashcore-changes', () => {
        const cachedData = cacheService.instance().get('changes');
        socket.emit('return-flashcore-changes', cachedData || null);
    });

    /**
     * @param firebase.firestore
     * @param firebase.firestore.FieldValue
     * @param firebase.firestore.FieldValue.arrayUnion
     */
    socket.on('forum-post-new', data => {
        if (db) {
            db.collection('ultraskor_forum')
                .doc(String(data.topicId))
                .update(
                    {
                        messages: firebase.firestore.FieldValue.arrayUnion(data)
                    },
                    { merge: true }
                );
        }
        io.sockets.emit('forum-new-submission', data);
    });

    socket.on('forum-get-all-by-id', topicId => {
        console.log(topicId);
        socket.emit('forum-get-all-by-id-result', []);
        if (db) {
            db.collection('ultraskor_forum')
                .doc(String(topicId))
                .get()
                .then(doc => {
                    if (doc.exists) {
                        socket.emit('forum-get-all-by-id-result', doc.data().messages);
                    } else {
                        socket.emit('forum-get-all-by-id-result', []);
                    }
                });
        } else {
            socket.emit('forum-get-all-by-id-result', []);
        }
    });

    socket.on('get-updates-details', api => {
        const cacheKey = `mainData-${api}-eventdetails`;
        const initRemoteRequests = () => {
            const sofaOptions = {
                method: 'GET',
                uri: `https://www.sofascore.com${api}?_=${Math.floor(Math.random() * 10e8)}`,
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    Origin: 'https://www.sofascore.com',
                    referer: 'https://www.sofascore.com/',
                    'x-requested-with': 'XMLHttpRequest'
                },
                timeout: 10000
            };

            function onSuccess(res) {
                cacheService.instance().set(cacheKey, res, cacheDuration.main.eventdetails || 10);
                socket.emit('return-updates-details', res);
            }

            function onError() {
                socket.emit('return-error-updates', 'Error while retrieving information from server');
            }

            if (isTorDisabled) {
                request(sofaOptions)
                    .then(onSuccess)
                    .catch(onError);
            } else {
                tor.request(sofaOptions, (err, status, res) => {
                    if (!err && status.statusCode === 200) {
                        onSuccess(res);
                    } else {
                        onError(err);
                    }
                });
            }
        };

        const cachedData = cacheService.instance().get(cacheKey);
        if (typeof cachedData !== 'undefined') {
            // Cache is found, serve the data from cache
            socket.emit('return-updates-details', cachedData);
        } else {
            initRemoteRequests();
        }
    });

    socket.on('disconnect', () => {
        userDisconnected();
    });
};

exports.socketHandler = socketHandler;
