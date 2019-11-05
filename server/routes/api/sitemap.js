const router = require("express").Router();
const request = require("request-promise-native");
const moment = require("moment");
const tor = require("tor-request");
const auth = require("../auth");
const { t, generateSlug } = require("../../utils");

tor.TorControlPort.password = "muztafultra";

router.get("/:lang/:sport/:type/:by/:date", auth.optional, (req, res) => {
    const { lang, sport, type, by, date } = req.params;

    if (type === "index") {
        res.header("Content-Type", "application/xml");
        let xmlString =
            '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        if (by === "year") {
            for (let i = 1; i <= 12; i += 1) {
                xmlString += `<sitemap><loc>https://www.ultraskor.com/sitemap/${lang}/${sport}/index/month/${date}-${
                    i < 10 ? `0${i}` : i
                }</loc></sitemap>`;
            }
        } else if (by === "month") {
            const daysInMonth = moment(date, "YYYY-MM").daysInMonth();
            for (let i = 1; i <= daysInMonth; i += 1) {
                xmlString += `<sitemap><loc>https://www.ultraskor.com/sitemap/${lang}/${sport}/list/day/${date}-${
                    i < 10 ? `0${i}` : i
                }</loc></sitemap>`;
            }
        }
        xmlString += "</sitemapindex>";
        res.send(xmlString);
    } else if (type === "daily") {
        // Sample: /sitemap/tr/football/daily/day/2019-03
        res.header("Content-Type", "text/plain");
        const days = [];
        const daysInMonth = moment(date, "YYYY-MM").daysInMonth();
        for (let i = 1; i <= daysInMonth; i += 1) {
            days.push(
                `https://www.ultraskor.com${lang === "tr" ? "/maclar/tarih" : "/en/matches/date"}-${date}-${
                    i < 10 ? `0${i}` : i
                }`
            );
        }
        res.send(days.join("\r"));
    } else if (type === "list" && by === "day") {
        const configUltraSkorGetByDate = {
            method: "GET",
            uri: `https://www.ultraskor.com/api/?query=/${sport}//${date}/json`,
            json: true,
            headers: {
                "Content-Type": "application/json",
                Origin: "https://www.ultraskor.com",
                referer: "https://www.ultraskor.com/",
                "x-requested-with": "XMLHttpRequest"
            },
            timeout: 10000
        };
        res.header("Content-Type", "text/plain");

        request(configUltraSkorGetByDate)
            .then(mainData => {
                if (mainData && mainData.sportItem && mainData.sportItem.tournaments.length > 0) {
                    const tournaments = mainData.sportItem.tournaments.reduce((whole, tournament) => {
                        tournament.events = tournament.events.filter(event => {
                            return moment(event.startTimestamp).format("YYYY-MM-DD") === date;
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
                                `https://www.ultraskor.com${lang === "tr" ? "/mac/" : "/en/match/"}${generateSlug(
                                    `${t(event.homeTeam.name)}-${t(event.awayTeam.name)}`
                                )}-${lang === "tr" ? "canli-skor" : "live-score"}-${event.id}`
                            );
                        });
                    });
                    res.send(urls.join("\r"));
                } else {
                    res.status(500).send("Error");
                }
            })
            .catch(() => {
                res.status(500).send("Error");
            });
    }
});

router.get("/matches/:year", (req, res) => {
    const { year } = req.params;

    res.header("Content-Type", "application/xml");
    let xmlString =
        '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    const thisMonth = parseFloat(moment().format("MM"));

    for (let month = 12; month > 0; month -= 1) {
        if (year === "2019" && month > 4 && month <= thisMonth) {
            let day = moment(`${year}-${month}`, "YYYY-MM")
                .add(1, "months")
                .subtract(1, "days")
                .format("DD");
            let modifiedDate = moment(`${year}-${month}-${day} 23:59`)
                .utcOffset("+0300")
                .format();
            if (month === thisMonth) {
                day = moment().format("DD");
                modifiedDate = moment()
                    .utcOffset("+0300")
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
    xmlString += "</sitemapindex>";
    res.send(xmlString);
    // }
});

router.get("/matches/:year/:month", (req, res) => {
    const { year, month } = req.params;
    res.header("Content-Type", "application/xml");
    let xmlString =
        '<?xml version="1.0" encoding="utf-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const thisMonth = parseFloat(moment().format("MM"));
    const toDay = parseFloat(moment().format("D"));
    const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

    for (let day = daysInMonth; day > 0; day -= 1) {
        if (parseFloat(month) === thisMonth && day > toDay + 7) {
            // do nothing...
        } else {
            // let day = moment(year + '-' + month, 'YYYY-MM').add(1, 'months').subtract(1, 'days').format('DD');
            let modifiedDate = moment(`${year}-${month}-${day < 10 ? `0${day}` : day} 23:59`)
                .utcOffset("+0300")
                .format();

            if (parseFloat(month) === thisMonth && day === toDay) {
                modifiedDate = moment()
                    .utcOffset("+0300")
                    .format();
            }

            xmlString += `
				<sitemap>
					<loc>https://www.ultraskor.com/api/sitemap/matches/${year}/${month}/${day < 10 ? `0${day}` : day}</loc>
					<lastmod>${modifiedDate}</lastmod>
				</sitemap>
			`;
        }
    }
    xmlString += "</sitemapindex>";
    res.send(xmlString);
    // }
});

router.get("/matches/:year/:month/:day", (req, res) => {
    const { year, month, day } = req.params;
    // const lang = 'tr';
    res.header("Content-Type", "application/xml");
    let xmlString =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

    // const thisMonth = parseFloat(moment().format('MM'));
    // const toDay = parseFloat(moment().format('D'));
    // const daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();

    const configUltraSkorGetByDate = {
        method: "GET",
        uri: `https://www.ultraskor.com/api/homepage/list/${year}-${month}-${day}`,
        json: true,
        headers: {
            "Content-Type": "application/json",
            Origin: "https://www.ultraskor.com",
            referer: "https://www.ultraskor.com/",
            "x-requested-with": "XMLHttpRequest"
        },
        timeout: 10000
    };

    request(configUltraSkorGetByDate)
        .then(data => {
            /**
             * @param mainData object
             * @param mainData.sportItem
             * */
            const { tournaments } = data;
            // res.send(tournaments);
            if (tournaments && tournaments.length > 0) {
                // let urls = [];
                tournaments.forEach(tournament => {
                    tournament.events.forEach(event => {
                        // let startTime = moment.unix(event.startTimestamp).utc().utcOffset('+0300').format();
                        const finishTimeUTC = moment
                            .unix(event.startTimestamp)
                            .utc()
                            .utcOffset("+0300")
                            .add(90, "minutes")
                            .format();

                        const notStartedYet = event.status.type !== 100;
                        const differenceDays = Math.abs(
                            moment(moment().unix(), "X").diff(moment(event.startTimestamp / 1000, "X"), "days")
                        );

                        let stringChangeFreq = "";
                        let stringPriority = "";

                        if (differenceDays < 3) {
                            // within + or - 10 days
                            stringPriority = "<priority>1.0</priority>";
                            stringChangeFreq = "<changefreq>always</changefreq>";
                        } else if (differenceDays < 7) {
                            stringChangeFreq = "<changefreq>hourly</changefreq>";
                            stringPriority = "<priority>0.9</priority>";
                        } else if (differenceDays < 14) {
                            stringChangeFreq = "<changefreq>daily</changefreq>";
                            stringPriority = "<priority>0.8</priority>";
                        } else if (differenceDays < 20) {
                            stringChangeFreq = "<changefreq>weekly</changefreq>";
                            stringPriority = "<priority>0.7</priority>";
                        } else if (differenceDays < 30) {
                            stringChangeFreq = "<changefreq>monthly</changefreq>";
                            stringPriority = "<priority>0.6</priority>";
                        } else {
                            stringChangeFreq = "<changefreq>yearly</changefreq>";
                            stringPriority = "<priority>0.5</priority>";
                        }

                        let stringLastModified = `<lastmod>${finishTimeUTC}</lastmod>`;
                        if (notStartedYet) {
                            stringLastModified = `<lastmod>${moment()
                                .utcOffset("+0300")
                                .format()}</lastmod>`;
                        }

                        xmlString += `
								<url>
									<loc>${`https://www.ultraskor.com/mac/${generateSlug(
                                        `${t(event.teams.home.name)}-${t(event.teams.away.name)}`
                                    )}-canli-skor-${event.id}`}</loc>
									${stringLastModified}
									${stringChangeFreq}
									${stringPriority}
									<xhtml:link rel="alternate" hreflang="tr" href="${`https://www.ultraskor.com/mac/${generateSlug(
                                        `${t(event.teams.home.name)}-${t(event.teams.away.name)}`
                                    )}-canli-skor-${event.id}`}"/>
						            <xhtml:link rel="alternate" hreflang="en" href="${`https://www.ultraskor.com/en/match/${generateSlug(
                                        `${event.teams.home.name}-${event.teams.away.name}`
                                    )}-live-score-${event.id}`}"/>   
								</url>
								<url>
									<loc>${`https://www.ultraskor.com/en/match/${generateSlug(
                                        `${event.teams.home.name}-${event.teams.away.name}`
                                    )}-live-score-${event.id}`}</loc>
									${stringLastModified}
									${stringChangeFreq}
									${stringPriority}
									<xhtml:link rel="alternate" hreflang="tr" href="${`https://www.ultraskor.com/mac/${generateSlug(
                                        `${t(event.teams.home.name)}-${t(event.teams.away.name)}`
                                    )}-canli-skor-${event.id}`}"/>
						            <xhtml:link rel="alternate" hreflang="en" href="${`https://www.ultraskor.com/en/match/${generateSlug(
                                        `${event.teams.home.name}-${event.teams.away.name}`
                                    )}-live-score-${event.id}`}"/>   
								</url>`;
                    });
                });
                xmlString += "\n</urlset>";
                res.send(xmlString);
            } else {
                res.status(500).send("Error 2");
            }
        })
        .catch(err => {
            res.status(500).send(`Error 1${err}`);
        });
});

router.get("/:lang/football-todaysmatches.txt", (req, res) => {
    res.redirect(`/sitemap/${req.params.lang}/football/list/day/${moment().format("YYYY-MM-DD")}`);
});

module.exports = router;
