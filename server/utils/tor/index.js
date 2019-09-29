
const torHandler = () => {
	const tor = require('tor-request');
	tor.TorControlPort.password = 'muztafultra';
	return tor;
};

exports.tor = torHandler;
