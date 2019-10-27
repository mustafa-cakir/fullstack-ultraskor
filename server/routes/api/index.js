const router = require('express').Router();
router.use('/', require('./sofascore'));
router.use('/homepage/list', require('./homepage'));
router.use('/Eventdetails', require('./eventdetails'));
router.use('/tournament', require('./tournament'));
router.use('/u-tournament', require('./u-tournament'));
router.use('/webpush', require('./webpush'));
router.use('/helper1', require('./sportradar'));
router.use('/helper2', require('./oley'));
router.use('/helper2/widget', require('./oleywidget'));
router.use('/helper4', require('./sportradarapi'));
router.use('/iddaa', require('./iddaa'));
router.use('/sitemap', require('./sitemap'));
router.use('/logerrors', require('./logerrors'));
router.use('/tor', require('./tor'));
router.use('/partial', require('./partial'));
router.use('/test', require('./test'));

router.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(422).json({
            errors: Object.keys(err.errors).reduce((errors, key) => {
                errors[key] = err.errors[key].message;
                return errors;
            }, {})
        });
    }
    return next(err);
});
module.exports = router;
