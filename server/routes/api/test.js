const router = require('express').Router();
const auth = require('../auth');
const { db } = require('../../utils/firebase');

router.get('/getuser/:id', auth.required, (req, res) => {
    const { id } = req.params;

    if (db) {
        db.collection('ultraskor_test_user')
            .doc(id)
            .get()
            .then(doc => {
                if (doc.exists) {
                    res.send(doc.data());
                } else {
                    res.send('nothing found');
                }
            });
    }
});

router.post('/create', (req, res) => {
    const { name, lastname, phone, address, password, password2 } = req.body;

    if (!name) {
        res.status(400).send('name can not be blank');
    }
    if (password !== password2) {
        res.status(400).send('password not matched');
    } else if (db) {
        db.collection('ultraskor_test_user')
            .add({
                name,
                lastname,
                phone,
                address,
                password,
                password2
            })
            .then(ref => {
                res.send(`success! with id: ${ref.id}`);
            });
    } else {
        res.send('db not found');
    }
});

router.put('/update', (req, res) => {
    const { id, name, lastname, phone, address, password, password2 } = req.body;

    if (!id) {
        res.send('id can not be empty');
        return false;
    }
    if (db) {
        if (name || lastname || phone || address || password) {
            db.collection('ultraskor_test_user')
                .doc(id)
                .update({
                    ...(name && { name }),
                    ...(lastname && { lastname }),
                    ...(phone && { phone }),
                    ...(address && { address }),
                    ...(password && { password }),
                    ...(password2 && { password2 })
                });
            res.send('updated!');
        } else {
            res.send('nothing to update');
        }
    } else {
        res.send('db not found');
    }
});

module.exports = router;
