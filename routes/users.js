const express = require('express');
const db = require('../lib/db');
const crypto = require('../lib/crypto');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.get('/signin', (req, res, next) => {
  if (!req.session.email) {
    res.render('users/signin');
  } else { // 이미 로그인되어 있으면
    res.send('signed in.');
  }
});

router.post('/signin', async (req, res, next) => {
  const email = req.body["email"];
  const password = await crypto.scrypt(req.body["password"], 'my salt', 32);
  if (!req.session.email && email && password) {
    const client = await db.getClient();
    const doc = await client.db().collection('admin').findOne({
      email
    });
    await client.close();

    if (doc && (password.compare(doc.password.buffer) === 0)) { // 로그인 성공
      req.session.email = email;
      res.redirect('/');
    } else { // 로그인 실패
      res.send('wrong email or password.');
    }
  }
});

router.get('/signout', (req, res, next) => {
  if (req.session.email) {
    req.session.destroy(err => {
      console.error(err);
    });
    res.redirect('/users/signin');
  } else {
    res.send('signed out.');
  }
});

router.get('/signup', (req, res, next) => {
  if (!req.session.email) {
    res.render('users/signup');
  } else {
    res.send('signed in.');
  }
});

router.post('/signup', async (req, res, next) => {
  const email = req.body["email"];
  const password = await crypto.scrypt(req.body["password"], 'my salt', 32);
  if (!req.session.email && email && password) {
    if (req.body["password"] === req.body["password-confirm"]) {
      const client = await db.getClient();
      if (!await client.db().collection('admin').findOne({email: email})) {
        const result = await client.db().collection('admin').insertOne({
          email,
          password
        });
        await client.close();
        res.redirect('/users/signin');
      } else { // 이미 등록된 이메일이면
        res.send('this account is already registered.');
        await client.close();
      }
    } else {
      res.send('passwords do not match.');
    }
  }
});

module.exports = router;
