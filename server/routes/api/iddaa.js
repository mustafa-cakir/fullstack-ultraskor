const router = require("express").Router();
const { cacheDuration } = require("../../utils");
const auth = require("../auth");
const { fetchIddaaFull } = require("../../fetch/iddaa");
const { fetchIddaaMatch } = require("../../fetch/iddaaMatch");

router.get("/list/:date", auth.optional, (req, res) => {
    const { date } = req.params; // YYYY-MM-DD

    fetchIddaaFull(date, cacheDuration.day7)
        .then(response => {
            res.send(response);
        })
        .catch(() => {
            res.status(501).send("Error");
        });
});

router.get("/match/:iddaaId/:live?", auth.optional, (req, res) => {
    const { iddaaId } = req.params;
    const isLive = req.params.live;
    fetchIddaaMatch(isLive, iddaaId)
        .then(response => {
            res.send(response.data ? response.data.m : []);
        })
        .catch(() => {
            res.status(501).send("Error");
        });
});

module.exports = router;
