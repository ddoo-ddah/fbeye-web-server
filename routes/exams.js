const express = require('express');
const crypto = require('../lib/crypto');
const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.email) {
        res.send('exams');
    } else {
        res.redirect('/');
    }
});

router.get('/new', async (req, res, next) => {
    if (req.session.email) {
        const accessCode = (await crypto.randomBytes(6)).toString('base64');
        res.render('exams/new', {
            admin: req.session.email,
            accessCode
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
