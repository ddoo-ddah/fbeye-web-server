const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.session.email) {
    res.render('index', {
      title: 'FBEye',
      email: req.session.email
    });
  } else {
    res.redirect('/users/signin');
  }
});

module.exports = router;
