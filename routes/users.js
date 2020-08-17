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
  } else {
    res.send('signed in.');
  }
});

router.post('/signin', async (req, res, next) => {
  const email = req.body["email"];
  const password = await crypto.scrypt(req.body["password"], 'my salt', 32);
  if (email && password) {
    const client = await db.getClient();
    const doc = client.db().collection('admin').findOne({
      email
    });
    await client.close();
    const result = doc && (doc.password === password);
    if (result) {
      req.session.email = email;
    }
    res.send(result);
  }
});

router.get('/signout', (req, res, next) => {
  if (req.session.email) {
    req.session.destroy(err => {
      console.error(err);
    })
  } else {
    res.send('signed out.');
  }
});

module.exports = router;
