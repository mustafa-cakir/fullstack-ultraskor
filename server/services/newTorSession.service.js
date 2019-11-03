const tor = require("tor-request");
const { isDev } = require("../utils");

tor.TorControlPort.password = "muztafultra";

const newTor = () => {
    return new Promise((resolve, reject) => {
        tor.newTorSession(err => {
            if (!err) {
                if (isDev) console.log("Success: TOR session refreshed!");
                resolve("success");
            } else {
                if (isDev) console.log("Error: TOR session can not be refreshed!");
                reject(new Error("error"));
            }
        });
    });
};

const init = () => {
    setInterval(() => {
        newTor()
            .then(() => {
                tor.request("https://api.ipify.org", (error, status, response) => {
                    if (!error && status.statusCode === 200) {
                        console.log("TOR request completed, IP: ", response);
                    }
                });
            })
            .catch(() => {
                // do nothing
            });
    }, 1000 * 60 * 60 * 2); // 2 hours
};

module.exports = {
    init,
    newTor
};
