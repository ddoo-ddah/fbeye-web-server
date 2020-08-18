const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.email) {
        res.send('exams');
    } else {
        res.redirect('/');
    }
});

module.exports = router;
