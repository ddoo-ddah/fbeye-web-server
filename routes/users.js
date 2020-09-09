const express = require('express');
const userApp = require('../apps/user');
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
  const password = req.body["password"];
  if (!req.session.email && email && password) {
    const result = await userApp.signIn(email, password);
    if (result) { // 로그인 성공
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
  const email = req.body['email'];
  const password = req.body['password'];
  const passwordConfirm = req.body['password-confirm'];
  if (!req.session.email && email && password && passwordConfirm) {
    if (password === passwordConfirm) {
      const result = await userApp.signUp({
        email,
        password
      });
      if (result) {
        req.flash('success', '회원가입이 완료되었습니다. 로그인 하세요.');
        res.redirect('/users/signin');
      } else {
        req.flash('danger', '이미 등록된 이메일입니다.');
        res.redirect('/users/signup');
      }
    } else {
      req.flash('danger', '패스워드가 일치하지 않습니다.');
      res.redirect('/users/signup');
    }
  }
});

router.get('/escape', (req, res, next) => {
  if (req.session.email) {
    const flash = req.flash();
    res.render('users/escape', {
      flash
    });
  } else {
    res.redirect('/');
  }
});

router.post('/escape', async (req, res, next) => {
  const password = req.body['password'];
  if (req.session.email && password) {
    const result = await userApp.escape(req.session.email, password);
    if (result) {
      res.redirect('/users/signout'); // 로그아웃
    } else {
      req.flash('danger', '패스워드가 맞지 않습니다.');
      res.redirect('/users/escape');
    }
  }
});

module.exports = router;
