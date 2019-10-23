exports.isDev = process.env.NODE_ENV === 'dev';
exports.isProd = process.env.NODE_ENV !== 'dev';
exports.isTorDisabled = process.env.TOR_DISABLED === 'true';
