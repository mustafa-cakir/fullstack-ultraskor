const moment = require('moment');
const cacheService = require('./cache.service');
const firebaseService = require('./firebase.service');
const { fetchSofaScore } = require('../fetch/sofascore');

const { db, firebase } = firebaseService;

exports.init = (socket, io) => {
    socket.on('get-updates-homepage', () => {
        const cacheKey = `homepageListData-${moment().format('YYYY-MM-DD')}`;
        const cachedData = cacheService.instance().get(cacheKey);
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
            fetchSofaScore(api, 10)
                .then(res => {
                    socket.emit('return-updates-details', res);
                })
                .catch(() => {
                    socket.emit('return-error-updates', 'Error while retrieving information from server');
                });

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
        //
    });
};
