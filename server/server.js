const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const request = require('request-promise-native');
const bodyParser = require('body-parser');
const moment = require('moment');
const cacheService = require('./cache.service');
const helper = require('./helper');
const { cacheDuration } = require('./helper');
const cronjob = require('./cronjob');
const { socketHandler } = require('./utils/socket');
const { firebase } = require('./utils/firebase');
const { db } = require('./utils/firebase');
const { tor } = require('./utils/tor');
const { initWebSocket } = require('./utils/Websocket');
// const { sofascoreApi } = require('./routes/api/sofascore');
// const { webpushApi } = require('./routes/api/webpush');
// const db = firebase.firestore();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helper.initCors());

cacheService.start();
cronjob.start();

// refresh TOR session
setInterval(() => {
    tor.newTorSession((err, success) => {
        if (err) {
            console.log(err, new Date());
        } else {
            console.log(success, new Date());
        }
    });
}, 1000 * 60 * 60 * 6); // 6 hours

server.listen(5001, () => console.log(`Listening on port ${5001}`));

// Connect to an external socket for gathering the changes

initWebSocket(io);
/**
 * @namespace io.on
 * */

io.on('connection', socket => {
    socketHandler(socket, io);
});

/**
 * @namespace app.get
 * */

app.use(require('./routes'));

//
// app.get('/api/', (req, res) => {
// 	sofascoreApi(req, res)
// });
//
// app.post('/api/webpush', (req, res) => {
// 	webpushApi((req, res))
// });

app.get('/api/helper1/:date', (req, res) => {
    const { date } = req.params;
    const targetDate = moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD'); // another date
    const cacheKey = `helperData-${targetDate}-provider1`;
    const isToday = moment(date, 'DD.MM.YYYY').isSame(moment(), 'day');
    const initRemoteRequests = () => {
        const provider1options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://ls.betradar.com',
                Referer: 'https://ls.betradar.com/ls/livescore/?/tempobet/en/page'
            },
            uri: `https://ls.fn.sportradar.com/tempobet/tr/Europe:Istanbul/gismo/sport_matches/1/${targetDate}/1`,
            json: true,
            timeout: 10000
        };

        request(provider1options)
            .then(response => {
                const matchList = helper.preProcessHelper1Data(response);
                if (matchList && matchList.length > 0) {
                    if (isToday) {
                        cacheService.instance().set(cacheKey, matchList, cacheDuration.provider1);
                        if (db)
                            db.collection('ultraskor_helper1')
                                .doc(targetDate)
                                .set({ data: matchList });
                    }
                    res.send(matchList);
                } else {
                    res.statusCode(501);
                }
            })
            .catch(() => {
                res.status(500);
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_helper1').doc(targetDate);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.provider1);
                    res.send(doc.data().data);
                    console.log('taken from firestore');
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                console.error('helper1: failed to get data from db');
                initRemoteRequests();
            });
    } else {
        initRemoteRequests();
    }
});

app.get('/api/helper2/:date', (req, res) => {
    const { date } = req.params;
    const targetDate = moment(date, 'MM.DD.YYYY').format('YYYY-MM-DD');
    const cacheKey = `helperData-${date}-provider2`;

    const isToday = moment(date, 'MM.DD.YYYY').isSame(moment(), 'day');

    const initRemoteRequests = () => {
        const provider2options = {
            method: 'POST',
            uri: 'https://brdg-c1884f68-d545-4103-bee0-fbcf3d58c850.azureedge.net/livescore/matchlist',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.broadage.com'
            },
            body: JSON.stringify({
                coverageId: '6bf0cf44-e13a-44e1-8008-ff17ba6c2128',
                options: {
                    sportId: 1,
                    day: moment(targetDate, 'YYYY-MM-DD').format('MM/DD/YYYY'),
                    origin: 'broadage.com',
                    timeZone: 3
                }
            }),
            json: true,
            timeout: 10000
        };

        request(provider2options)
            .then(response => {
                /**
                 * @param response
                 * @param response.initialData
                 */

                if (response.initialData && response.initialData.length > 0) {
                    if (isToday) {
                        cacheService.instance().set(cacheKey, response, cacheDuration.provider2);
                        if (db)
                            db.collection('ultraskor_helper2')
                                .doc(targetDate)
                                .set(response);
                    }
                    res.send(response);
                } else {
                    res.statusCode(501);
                }
            })
            .catch(() => {
                res.statusCode(500);
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_helper2').doc(targetDate);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.provider1);
                    res.send(doc.data());
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                initRemoteRequests();
            });
    } else {
        initRemoteRequests();
    }
});

app.get('/api/iddaaHelper/:date', (req, res) => {
    const { date } = req.params;
    const targetDate = moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD');
    const cacheKey = `helperData-${targetDate}-iddaahelper`;

    const initRemoteRequests = () => {
        const idaaHelperOptions = {
            method: 'POST',
            uri: `https://api.iddaa.com.tr/sportsprogram/1`,
            body: ['1_1', '2_87', '2_101_2.5', '2_89'],
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.iddaa.com.tr',
                Referer: 'https://www.iddaa.com.tr/futbol-programi',
                'Sec-Fetch-Mode': 'cors'
            }
        };

        const onSuccess = response => {
            const responseData = helper.simplifyIddaaHelperData(response);
            const shouldCached = responseData.length > 200;
            const isToday = moment(date, 'DD.MM.YYYY').isSame(moment(), 'day');

            if (responseData) {
                if (shouldCached) {
                    cacheService.instance().set(cacheKey, responseData, cacheDuration.iddaaHelper);
                    if (db && isToday)
                        db.collection('ultraskor_iddaahelper')
                            .doc(targetDate)
                            .set(responseData);
                }
                res.send(responseData);
            } else {
                res.statusCode(501);
            }
        };

        const onError = () => {
            res.status(500);
        };

        request(idaaHelperOptions)
            .then(onSuccess)
            .catch(onError);
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        // Cache is found, serve the data from cache
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_iddaahelper').doc(targetDate);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.iddaaHelper);
                    res.send(doc.data());
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                console.error('iddaaHelper: failed to get data from db');
                initRemoteRequests();
            });
    } else {
        initRemoteRequests();
    }
});

app.get('/api/iddaaOdds/:id/:live?', (req, res) => {
    /**
     * @param req.params.live
     */

    const { id } = req.params;
    const isLive = req.params.live;
    const cacheKey = `helperData-iddaaOdds-${id}`;

    const initRemoteRequests = () => {
        const idaaOddsOptions = {
            method: 'GET',
            uri: `https://api.iddaa.com.tr/sportsprogram/${isLive ? 'live/' : ''}markets/1/${id}`,
            json: true,
            timeout: 10000,
            headers: {
                Origin: 'https://www.iddaa.com.tr',
                Referer: 'https://www.iddaa.com.tr/canli-futbol-programi'
            }
        };

        const onSuccess = response => {
            const { data } = response;

            if (data) {
                cacheService.instance().set(cacheKey, data, cacheDuration.iddaaOdds);
                res.send(data);
            } else {
                res.sendStatus(501);
            }
        };

        const onError = () => {
            res.status(500);
        };

        if (helper.isTorDisabled) {
            request(idaaOddsOptions)
                .then(onSuccess)
                .catch(onError);
        } else {
            tor.request(idaaOddsOptions, (err, status, response) => {
                if (!err && status.statusCode === 200) {
                    onSuccess(response);
                } else {
                    onError(err);
                }
            });
        }
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        // Cache is found, serve the data from cache
        res.send(cachedData);
    } else {
        initRemoteRequests(); // db is not initalized, get data from remote servers
    }
});

app.get('/api/helper4/:lang/:type/:id', (req, res) => {
    const { type, id, lang } = req.params;

    const cacheKey = `helperData-${type}-${lang}-${id}-provider4`;
    const apiKey = [
        {
            region: 'eu',
            key: 'wshgqxxcvr7uptt3yetu3b8s' // sporarena - Europe
        },
        {
            region: 'intl',
            key: 'efrefsb22mebrc54gbu78ves' // sporarena - Intl
        },
        {
            region: 'other',
            key: 'v4j6ksqubsne2ur9aexuawt7' // sporarena - Other
        },
        {
            region: 'eu',
            key: '3a97ydredjbxvjghxjbzqz2g' // https://github.com/willisgram/master_thesis
        },
        {
            region: 'eu',
            key: 'j9xerbvc24veacrq3hpby6dk' // https://github.com/kberkeland/soccer-glance
        },
        {
            region: 'eu',
            key: 'a4nbj7zwu8r7dzgeaw8yr23t' // https://github.com/antoine-lizee/sportcal
        },
        {
            region: 'eu',
            key: 'ha3v5v65eexxag3av2hnuhwq' // https://github.com/salman90/Live_Scores
        }
    ];

    let path = null;

    if (type === 'teams') path = `teams/sr:competitor:${id}/profile.json`;
    else if (type === 'players') path = `players/sr:player:${id}/profile.json`;

    const initRemoteRequests = (keyIndex = 0) => {
        const provider4options = {
            method: 'GET',
            uri: `https://api.sportradar.us/soccer-xt3/${apiKey[keyIndex].region}/${lang}/${path}?api_key=${apiKey[keyIndex].key}`,
            json: true,
            timeout: 10000
        };
        request(provider4options)
            .then(response => {
                if (response) {
                    /**
                     * @param response.generated_at
                     */
                    if (response.generated_at) delete response.generated_at;
                    if (response.schema) delete response.schema;
                    cacheService.instance().set(cacheKey, response, cacheDuration.provider4[type] || 60);
                    if (db)
                        db.collection('ultraskor_helper4')
                            .doc(`${id}_${type}_${lang}`)
                            .set(response);
                    res.send(response);
                } else {
                    res.statusCode(501);
                }
            })
            .catch(() => {
                if (keyIndex + 1 < apiKey.length) {
                    initRemoteRequests(keyIndex + 1);
                } else {
                    res.statusCode(500);
                }
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        // Cache is found, serve the data from cache
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_helper4').doc(`${id}_${type}_${lang}`);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.provider4[type] || 60);
                    res.send(doc.data());
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                initRemoteRequests();
            });
    } else {
        initRemoteRequests(); // db is not initalized, get data from remote servers
    }
});

app.get('/api/helper2/widget/:type/:matchid', (req, res) => {
    const { type } = req.params;
    const { matchid } = req.params;
    const cacheKey = `helperData-${matchid}-${type}`;
    const initRemoteRequests = () => {
        const oleyOptions = {
            method: 'GET',
            uri: `https://widget.oley.com/match/${type}/1/${matchid}`,
            json: true,
            timeout: 10000
        };
        request(oleyOptions)
            .then(response => {
                if (response) {
                    cacheService.instance().set(cacheKey, response, cacheDuration.oley[type] || 60);

                    if (db)
                        db.collection('ultraskor_helper2_widget')
                            .doc(`${matchid}_${type}`)
                            .set(response);
                    res.send(response);
                } else {
                    res.statusCode(501);
                }
            })
            .catch(() => {
                res.statusCode(500);
            });
    };

    const cachedData = cacheService.instance().get(cacheKey);
    if (typeof cachedData !== 'undefined') {
        res.send(cachedData);
    } else if (db) {
        const ref = db.collection('ultraskor_helper2_widget').doc(`${matchid}_${type}`);
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    cacheService.instance().set(cacheKey, doc.data(), cacheDuration.oley[type] || 60);
                    res.send(doc.data());
                } else {
                    initRemoteRequests();
                }
            })
            .catch(() => {
                initRemoteRequests();
            });
    } else {
        initRemoteRequests();
    }
});

app.get('/sitemap/:lang/:sport/:type/:by/:date', (req, res) => {
    const { lang, sport, type, by, date } = req.params;

    if (type === 'index') {
        res.header('Content-Type', 'application/xml');
        let xmlString =
            '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        if (by === 'year') {
            for (let i = 1; i <= 12; i += 1) {
                xmlString += `<sitemap><loc>https://www.ultraskor.com/sitemap/${lang}/${sport}/index/month/${date}-${
                    i < 10 ? `0${i}` : i
                }</loc></sitemap>`;
            }
        } else if (by === 'month') {
            const daysInMonth = moment(date, 'YYYY-MM').daysInMonth();
            for (let i = 1; i <= daysInMonth; i += 1) {
                xmlString += `<sitemap><loc>https://www.ultraskor.com/sitemap/${lang}/${sport}/list/day/${date}-${
                    i < 10 ? `0${i}` : i
                }</loc></sitemap>`;
            }
        }
        xmlString += '</sitemapindex>';
        res.send(xmlString);
    } else if (type === 'daily') {
        // Sample: /sitemap/tr/football/daily/day/2019-03
        res.header('Content-Type', 'text/plain');
        const days = [];
        const daysInMonth = moment(date, 'YYYY-MM').daysInMonth();
        for (let i = 1; i <= daysInMonth; i += 1) {
            days.push(
                `https://www.ultraskor.com${lang === 'tr' ? '/maclar/tarih' : '/en/matches/date'}-${date}-${
                    i < 10 ? `0${i}` : i
                }`
            );
        }
        res.send(days.join('\r'));
    } else if (type === 'list' && by === 'day') {
        const configUltraSkorGetByDate = {
            method: 'GET',
            uri: `https://www.ultraskor.com/api/?query=/${sport}//${date}/json`,
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.ultraskor.com',
                referer: 'https://www.ultraskor.com/',
                'x-requested-with': 'XMLHttpRequest'
            },
            timeout: 10000
        };
        res.header('Content-Type', 'text/plain');

        request(configUltraSkorGetByDate)
            .then(mainData => {
                if (mainData && mainData.sportItem && mainData.sportItem.tournaments.length > 0) {
                    const tournaments = mainData.sportItem.tournaments.reduce((whole, tournament) => {
                        tournament.events = tournament.events.filter(event => {
                            return moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === date;
                        });
                        tournament.events.forEach(() => {
                            if (whole.indexOf(tournament) < 0) whole.push(tournament);
                        });
                        return whole;
                    }, []);

                    const urls = [];
                    tournaments.forEach(tournament => {
                        tournament.events.forEach(event => {
                            urls.push(
                                `https://www.ultraskor.com${
                                    lang === 'tr' ? '/mac/' : '/en/match/'
                                }${helper.generateSlug(
                                    `${helper.t(event.homeTeam.name)}-${helper.t(event.awayTeam.name)}`
                                )}-${lang === 'tr' ? 'canli-skor' : 'live-score'}-${event.id}`
                            );
                        });
                    });
                    res.send(urls.join('\r'));
                } else {
                    res.status(500).send('Error');
                }
            })
            .catch(() => {
                res.status(500).send('Error');
            });
    }
});

app.get('/sitemap/matches/:year', (req, res) => {
    const { year } = req.params;

    res.header('Content-Type', 'application/xml');
    let xmlString =
        '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    const thisMonth = parseFloat(moment().format('MM'));

    for (let month = 12; month > 0; month -= 1) {
        if (year === '2019' && month > 4 && month <= thisMonth) {
            let day = moment(`${year}-${month}`, 'YYYY-MM')
                .add(1, 'months')
                .subtract(1, 'days')
                .format('DD');
            let modifiedDate = moment(`${year}-${month}-${day} 23:59`)
                .utcOffset('+0300')
                .format();
            if (month === thisMonth) {
                day = moment().format('DD');
                modifiedDate = moment()
                    .utcOffset('+0300')
                    .format();
            }
            xmlString += `
				<sitemap>
					<loc>https://www.ultraskor.com/sitemap/matches/${year}/${month < 10 ? `0${month}` : month}</loc>
					<lastmod>${modifiedDate}</lastmod>
				</sitemap>
			`;
        }
    }
    xmlString += '</sitemapindex>';
    res.send(xmlString);
    // }
});

app.get('/sitemap/matches/:year/:month', (req, res) => {
    const { year, month } = req.params;
    res.header('Content-Type', 'application/xml');
    let xmlString =
        '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const thisMonth = parseFloat(moment().format('MM'));
    const toDay = parseFloat(moment().format('D'));
    const daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();

    for (let day = daysInMonth; day > 0; day -= 1) {
        if (parseFloat(month) === thisMonth && day > toDay) {
            // do nothing...
        } else {
            // let day = moment(year + '-' + month, 'YYYY-MM').add(1, 'months').subtract(1, 'days').format('DD');
            let modifiedDate = moment(`${year}-${month}-${day < 10 ? `0${day}` : day} 23:59`)
                .utcOffset('+0300')
                .format();

            if (parseFloat(month) === thisMonth && day === toDay) {
                modifiedDate = moment()
                    .utcOffset('+0300')
                    .format();
            }

            xmlString += `
				<sitemap>
					<loc>https://www.ultraskor.com/sitemap/matches/${year}/${month}/${day < 10 ? `0${day}` : day}</loc>
					<lastmod>${modifiedDate}</lastmod>
				</sitemap>
			`;
        }
    }
    xmlString += '</sitemapindex>';
    res.send(xmlString);
    // }
});

app.get('/sitemap/matches/:year/:month/:day', (req, res) => {
    const { year, month, day } = req.params;
    // const lang = 'tr';
    res.header('Content-Type', 'application/xml');
    let xmlString =
        '<?xml version="1.0" encoding="UTF-8"?> <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

    // const thisMonth = parseFloat(moment().format('MM'));
    // const toDay = parseFloat(moment().format('D'));
    // const daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();

    const configUltraSkorGetByDate = {
        method: 'GET',
        uri: `https://www.ultraskor.com/api/?query=/football//${year}-${month}-${day}/json`,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            Origin: 'https://www.ultraskor.com',
            referer: 'https://www.ultraskor.com/',
            'x-requested-with': 'XMLHttpRequest'
        },
        timeout: 10000
    };

    request(configUltraSkorGetByDate)
        .then(mainData => {
            /**
             * @param mainData object
             * @param mainData.sportItem
             * */

            if (mainData && mainData.sportItem && mainData.sportItem.tournaments.length > 0) {
                const tournaments = mainData.sportItem.tournaments.reduce((whole, tournament) => {
                    tournament.events = tournament.events.filter(event => {
                        return moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === `${year}-${month}-${day}`;
                    });
                    tournament.events.forEach(() => {
                        if (whole.indexOf(tournament) < 0) whole.push(tournament);
                    });
                    return whole;
                }, []);

                // let urls = [];
                tournaments.forEach(tournament => {
                    tournament.events.forEach(event => {
                        // let startTime = moment.unix(event.startTimestamp).utc().utcOffset('+0300').format();
                        const finishTimeUTC = moment
                            .unix(event.startTimestamp)
                            .utc()
                            .utcOffset('+0300')
                            .add(90, 'minutes')
                            .format();

                        const notStartedYet = event.startTimestamp > moment().unix();
                        const differenceDays = Math.abs(
                            moment(moment().unix(), 'X').diff(moment(event.startTimestamp, 'X'), 'days')
                        );

                        let stringChangeFreq = '';
                        let stringPriority = '';

                        if (differenceDays < 3) {
                            // within + or - 10 days
                            stringPriority = '<priority>1.0</priority>';
                            stringChangeFreq = '<changefreq>always</changefreq>';
                        } else if (differenceDays < 7) {
                            stringChangeFreq = '<changefreq>hourly</changefreq>';
                            stringPriority = '<priority>0.9</priority>';
                        } else if (differenceDays < 14) {
                            stringChangeFreq = '<changefreq>daily</changefreq>';
                            stringPriority = '<priority>0.8</priority>';
                        } else if (differenceDays < 20) {
                            stringChangeFreq = '<changefreq>weekly</changefreq>';
                            stringPriority = '<priority>0.7</priority>';
                        } else if (differenceDays < 30) {
                            stringChangeFreq = '<changefreq>monthly</changefreq>';
                            stringPriority = '<priority>0.6</priority>';
                        } else {
                            stringChangeFreq = '<changefreq>yearly</changefreq>';
                            stringPriority = '<priority>0.5</priority>';
                        }

                        let stringLastModified = `<lastmod>${finishTimeUTC}</lastmod>`;
                        if (notStartedYet) {
                            stringLastModified = `<lastmod>${moment()
                                .utcOffset('+0300')
                                .format()}</lastmod>`;
                        }

                        xmlString += `
								<url>
									<loc>${`https://www.ultraskor.com/mac/${helper.generateSlug(
                                        `${helper.t(event.homeTeam.name)}-${helper.t(event.awayTeam.name)}`
                                    )}-canli-skor-${event.id}`}</loc>
									${stringLastModified}
									${stringChangeFreq}
									${stringPriority}
									<xhtml:link rel="alternate" hreflang="tr" href="${`https://www.ultraskor.com/mac/${helper.generateSlug(
                                        `${helper.t(event.homeTeam.name)}-${helper.t(event.awayTeam.name)}`
                                    )}-canli-skor-${event.id}`}"/>
						            <xhtml:link rel="alternate" hreflang="en" href="${`https://www.ultraskor.com/en/match/${helper.generateSlug(
                                        `${event.homeTeam.name}-${event.awayTeam.name}`
                                    )}-live-score-${event.id}`}"/>   
								</url>
								<url>
									<loc>${`https://www.ultraskor.com/en/match/${helper.generateSlug(
                                        `${event.homeTeam.name}-${event.awayTeam.name}`
                                    )}-live-score-${event.id}`}</loc>
									${stringLastModified}
									${stringChangeFreq}
									${stringPriority}
									<xhtml:link rel="alternate" hreflang="tr" href="${`https://www.ultraskor.com/mac/${helper.generateSlug(
                                        `${helper.t(event.homeTeam.name)}-${helper.t(event.awayTeam.name)}`
                                    )}-canli-skor-${event.id}`}"/>
						            <xhtml:link rel="alternate" hreflang="en" href="${`https://www.ultraskor.com/en/match/${helper.generateSlug(
                                        `${event.homeTeam.name}-${event.awayTeam.name}`
                                    )}-live-score-${event.id}`}"/>   
								</url>`;
                    });
                });
                xmlString += '</urlset>';
                res.send(xmlString);
            } else {
                res.status(500).send('Error 2');
            }
        })
        .catch(err => {
            res.status(500).send(`Error 1${err}`);
        });
});

app.get('/sitemap/:lang/football-todaysmatches.txt', (req, res) => {
    res.redirect(`/sitemap/${req.params.lang}/football/list/day/${moment().format('YYYY-MM-DD')}`);
});

// Log Console Errors
app.post('/api/logerrors', (req, res) => {
    if (helper.isProd) {
        if (db) {
            db.collection('ultraskor_errors').add(req.body);
            res.sendStatus(200);
        } else {
            res.sendStatus(501);
        }
    } else res.sendStatus(204);
});

app.get('/api/tor', (req, res) => {
    tor.request('https://api.ipify.org', (err, status, response) => {
        if (!err && status.statusCode === 200) {
            res.send(response);
        }
    });
});

app.get('/api/tor/new', (req, res) => {
    tor.newTorSession((err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(response);
        }
    });
});
