const moment = require('moment');
const cacheService = require('./cache.service');
const firebaseService = require('./firebase.service');
const { fetchEventDetails } = require('../fetch/eventdetails');

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
                .update({ messages: firebase.firestore.FieldValue.arrayUnion(data) }, { merge: true });
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

    socket.on('get-updates-eventdetails', params => {
        const { eventId, language } = params; // YYYY-MM-DD
        fetchEventDetails(eventId, language)
            .then(data => {
                socket.emit('return-updates-eventdetails', data);
            })
            .catch(() => {
                socket.emit('return-updates-eventdetails', null);
            });
    });

    socket.on('disconnect', () => {
        //
    });
};
