const express = require('express');
const db = require('../lib/db');
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

router.post('/new', async (req, res, next) => {
    const title = req.body["title"];
    const startTime = req.body["start-time"];
    const endTime = req.body["end-time"];
    const accessCode = req.body["access-code"];
    if (title && startTime && endTime) {
        const client = await db.getClient();
        const result1 = await client.db().collection('exams').insertOne({
            accessCode,
            status: 0,
            title,
            startTime,
            endTime
        });
        const result2 = await client.db().collection('admin').updateOne({
            email: req.session.email
        }, {
            $push: {
                exams: result1.insertedId_id
            }
        })
        await client.close();
        res.redirect('/exams');
    }
})

module.exports = router;
