const express = require('express');
var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
router.get('/reset', forwardAuthenticated, (req, res) => res.render('reset'));
// Dashboard
router.get('/dashboard/:email', ensureAuthenticated, (req, res) => {
  //console.log('email id', req)
  if (typeof (req.params.email) !== "undefined") {
    // Store
    localStorage.setItem("email", req.params.email);
  } else {
    alert("Sorry, your browser does not support Web Storage...");
  }
  // localStorage.setItem('email', req.params.email);
  // window.localStorage.setItem("email", req.params.email);
  // Retrieve
  res.render('dashboard', {
    user: req.user
  })
}

);

module.exports = router;
