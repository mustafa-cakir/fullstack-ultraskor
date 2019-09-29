const firebaseAdmin = require('firebase-admin');

const FireBaseServiceAccount = require('./corded-reality-254218-firebase-adminsdk-vso8i-a543d2b9c4');

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(FireBaseServiceAccount),
    databaseURL: 'https://livescores-54cdf.firebaseio.com'
});

exports.firebase = firebaseAdmin;
