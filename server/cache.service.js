const NodeCache = require('node-cache');

let cache = null;
exports.start = done => {
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
