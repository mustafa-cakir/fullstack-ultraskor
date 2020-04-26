const express = require("express");
const cloudscraper = require("cloudscraper");
const request = require("request");
const fs = require("fs");

const app = express();

app.get("/images/:type/:filename", (req, res) => {
    const { type, filename } = req.params;
    // console.log(type, filename);
    const sendFileOptions = {
        root: `./utils/images/${type}/`,
        dotfiles: "deny",
        headers: {
            "X-Powered-By": "ultraskor.com",
            "x-timestamp": Date.now(),
            "x-sent": true
        }
    };

    if (!fs.existsSync(sendFileOptions.root)) {
        fs.mkdirSync(sendFileOptions.root, err => {
            console.log(err);
        });
    }

    res.sendFile(filename, sendFileOptions, err => {
        if (err) {
            // file not exist
            let pathname = `/images/${type}/${filename}`;
            if (type === "u-tournament") {
                pathname = `/u-tournament/${filename.slice(0, -4)}/logo`;
            } else if (type === "manager") {
                pathname = `/api/v1/manager/${filename.slice(0, -4)}/image`;
            }
            const options = {
                url: `https://www.sofascore.com${pathname}`
            };
            request.head(options, (headErr, headRes) => {
                if (headRes && headRes.headers["content-type"].indexOf("image") > -1) {
                    const stream = request(options);
                    stream.on("error", () => {
                        console.log("## Image Error - 404");
                        res.status(404).send(404);
                    });
                    stream.on("response", response => {
                        if (response.headers["content-type"].indexOf("image") > -1) {
                            stream.pipe(fs.createWriteStream(sendFileOptions.root + filename));
                            stream.pipe(res);
                        } else {
                            console.log("## Image Error 2 - 404");
                            res.status(404).send("404");
                        }
                    });
                } else {
                    console.log("## Image Error 2 - 404");
                    res.status(404).send("404");
                }
            });
        }
    });
});

function pushDomain(body) {
    // console.log(body);
    // return body.replace("if(!1===i)u", 'i[0].domains.push("ultraskor.com",);if(!1===i)u');
    return body.replace("location.hostname", '"www.sportradar.com"');
}

app.get("/favicon.ico", (req, res) => {
    res.status(404).send("404");
});

// define a simple route
app.get("*", (req, res) => {
    const path = req.originalUrl;
    // path = path.substring(11, path.length);
    // console.log(path);

    const options = {
        url: `https://widgets.sir.sportradar.com/${path}`,
        headers: {
            Referer: "https://www.aspor.com.tr",
            Origin: "https://www.aspor.com.tr",
            "Access-Control-Allow-Origin": "*",
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
        },
        timeout: 1500
    };

    // console.log(options.url);
    cloudscraper(options, (error, response, body) => {
        res.header("Access-Control-Allow-Origin", "*");
        if (path.indexOf("translations") > -1) {
            res.header("Content-Type", "application/json; charset=utf-8");
        } else if (path.indexOf("licensing") > -1) {
            res.header("Content-Type", "text/plain; charset=utf-8");
        } else {
            res.header("Content-Type", "application/javascript; charset=utf-8");
        }
        if (path.indexOf("common_widgets") > -1) {
            body = pushDomain(body);
        }
        res.send(body);
    });
});

// listen for requests
app.listen(5002, () => {
    console.log("Server is listening on port 5002");
});
