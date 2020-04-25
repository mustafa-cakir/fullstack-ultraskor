const router = require("express").Router();
const auth = require("../auth");
const { mergeHead2HeadDatas } = require("../../utils");
const { convertToSofaScoreID } = require("../../utils");
const { fetchSofaScore } = require("../../fetch/sofascore");
const { isDev, cacheDuration } = require("../../utils");
const { fetchEventDetails } = require("../../fetch/eventdetails");

router.get("/:eventId/lineups", auth.optional, (req, res) => {
    const { eventId } = req.params;
    const id = convertToSofaScoreID(eventId);

    fetchSofaScore(`/event/${id}/lineups/json`, cacheDuration.min10)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(isDev ? err : "Can not retrieve information from server");
        });
});

router.get("/:eventId/head2head/:homeTeamId/:awayTeamId", auth.optional, (req, res) => {
    const { eventId, homeTeamId, awayTeamId } = req.params;
    const id = convertToSofaScoreID(eventId);

    const pAll = [fetchSofaScore(`/mobile/v4/event/${id}/head2head`, cacheDuration.min10).catch(() => null)];
    pAll.push(fetchSofaScore(`/mobile/v4/team/${homeTeamId}/lastnext`, cacheDuration.min10).catch(() => null));
    pAll.push(fetchSofaScore(`/mobile/v4/team/${awayTeamId}/lastnext`, cacheDuration.min10).catch(() => null));

    Promise.all(pAll)
        .then(responses => {
            const h2h = responses[0];
            const home = responses[1];
            const away = responses[2];
            const merged = mergeHead2HeadDatas(h2h, home, away);
            res.send(merged);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(isDev ? err : "Can not retrieve information from server");
        });
});

router.get("/:eventId/:language", auth.optional, (req, res) => {
    const { eventId, language } = req.params; // YYYY-MM-DD
    fetchEventDetails(eventId, language)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(isDev ? err : "Can not retrieve information from server");
        });
});

module.exports = router;
