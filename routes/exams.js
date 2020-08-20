const express = require('express');
const db = require('../lib/db');
const crypto = require('../lib/crypto');
const router = express.Router();

router.get('/', async (req, res, next) => {
    if (req.session.email) {
        const client = await db.getClient();
        const doc = await client.db().collection('admin').findOne({ // 관리자 계정 정보 가져오기
            email: req.session.email
        });
        const collection = client.db().collection('exams');
        const exams = [];
        if (doc.exams) {
            doc.exams.forEach(async e => {
                exams.push(await collection.findOne({ // 연결된 시험 정보 가져오기
                    _id: e
                }));
            });
        }
        await client.close();
        res.render('exams/index', {
            exams
        });
    } else {
        res.redirect('/');
    }
});

router.get('/exam/:id', async (req, res, next) => {
    const id = req.params.id;
    if (req.session.email) {
        const client = await db.getClient();
        const doc = await client.db().collection('exams').findOne({
            accessCode: id
        });
        res.render('exams/exam', {
            exam: doc
        });
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
    if (req.session.email && title && startTime && endTime && accessCode) {
        const client = await db.getClient();
        const result1 = await client.db().collection('exams').insertOne({ // 시험 생성
            accessCode,
            status: 0,
            title,
            startTime,
            endTime
        });
        const result2 = await client.db().collection('admin').updateOne({ // 관리자 계정에 연결
            email: req.session.email
        }, {
            $addToSet: {
                exams: result1.insertedId
            }
        });
        await client.close();
        res.redirect('/exams');
    }
});

router.get('/users/:id', async (req, res, next) => {
    const id = req.params.id;
    if (req.session.email) {
        const client = await db.getClient();
        const doc = await client.db().collection('exams').findOne({
            accessCode: id
        });
        await client.close();
        res.render('exams/users/index', {
            id,
            users: doc.users ? doc.users : []
        });
    } else {
        res.redirect('/');
    }
});

router.get('/users/new/:id', async (req, res, next) => {
    const id = req.params.id;
    if (req.session.email) {
        const accessCode = (await crypto.randomBytes(6)).toString('base64');
        res.render('exams/users/new', {
            id,
            accessCode
        });
    } else {
        res.redirect('/');
    }
});

router.post('/users/new/:id', async (req, res, next) => {
    const id = req.params.id;
    const email = req.body['email'];
    const name = req.body['name'];
    const accessCode = req.body['access-code'];
    if (req.session.email && id && email && name && accessCode) {
        const client = await db.getClient();
        const result = await client.db().collection('exams').updateOne({
            accessCode: id
        }, {
            $addToSet: {
                users: {
                    _id: new db.objectId(),
                    email,
                    name,
                    accessCode
                }
            }
        });
        res.redirect(`/exams/users/${id}`);
    }
});

module.exports = router;
