const NodeCache = require('node-cache');
const { isDev } = require('../utils');

let cache = null;
exports.init = done => {
    if (isDev) console.log('## cache service started');
    if (cache) return done();
    cache = new NodeCache();
    return false;
};

exports.instance = () => {
    return cache;
};
const cacheService = () => {
    return cache;
};

exports.cacheService = cacheService;
