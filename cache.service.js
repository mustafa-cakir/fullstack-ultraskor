let nodeCache = require('node-cache');
let cache = null;

exports.start = done => {
	if (cache) return done();
	cache = new nodeCache();
};

exports.instance = () => {
	return cache;
};
