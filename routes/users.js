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
    const flash = req.flash();
    res.render('users/signin', {
      flash
    });
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
    } else { // 로그인 실패
      req.flash('danger', '이메일 또는 패스워드가 맞지 않습니다.');
    }
    res.redirect('/');
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
    const flash = req.flash();
    res.render('users/signup', {
      flash
    });
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
        req.flash('success', '회원가입이 완료되었습니다. 로그인 하세요.');
        res.redirect('/users/signin');
      } else {
        res.send('이미 등록된 계정입니다.');
        await client.close();
      }
    } else {
      req.flash('danger', '패스워드가 일치하지 않습니다.');
      res.redirect('/users/signup');
    }
  }
});

module.exports = router;
