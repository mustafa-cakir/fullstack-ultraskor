const cors = require('cors');

const whitelist = [
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:3000',
    'https://www.ultraskor.com'
];

const corsOptions = {
    origin(origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log(origin);
            callback(new Error('Not allowed by CORS'));
        }
    }
};

exports.init = () => {
    return cors(corsOptions);
};
