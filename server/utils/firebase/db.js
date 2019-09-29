const { firebase } = require('./index.js');

const db = firebase.firestore();

exports.db = db;
