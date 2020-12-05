const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
         user: process.env.email,
         pass: process.env.mail_password
     }
 });

 const mailOptions = {
  from: process.env.email, // sender address
  to: '', // list of receivers
  subject: 'Password reset', // Subject line
  html: ''// plain text body
};



// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: `/dashboard/${req.body.email}`,
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// Reset
router.get('/reset', (req, res) => {
  res.render('reset')
});

// Reset
router.post('/reset',async (req, res) => {
  console.log('i am in');
  var { email } = req.body;
  mailOptions.to=email;
  let errors = [];

  if (!email ) {
    errors.push({ msg: 'Please enter all fields' });
  }


  if (errors.length > 0) {
    res.render('reset', {
      errors,
      email,
    });
  } else {
    User.findOne({ email: email }).then(user => {
     
      if (user) {
        var hash=user.password;
      }
       else {
        errors.push({ msg: 'Email doesnt exists' });
      }
      })
        let sampleMail = '<p>Hi, </p>'
        +'<p>Please click on below link to reset password</p>'
        +`<a target="blank" href='localhost:5000/users/resethome/${hash}/${email}'>urlToBeReplaced</a>`
        +'<p>Regards</p>'
        mailOptions.html=sampleMail;
       


        console.log('hashed password', hash)
        // var email = localStorage.getItem("email");
        console.log('email in reset', email);
        await transporter.sendMail(mailOptions)
        res.status(200).json({
          message: "Verification mail sent"
        });
      
  }
});

router.post('/resethome/:pwd/:email', (req, res) => {
  console.log('i am in');
  const email=req.params.email;
  const pwd=req.params.pwd;
  const {password1, password2 } = req.body;
  let errors = [];

  

  if (!password1 || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password1 != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password2.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('reset', {
      errors,
      email,
      password1,
      password2
    });
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password1, salt, (err, hash) => {
        if (err) throw err;



        console.log('hashed password', hash)
        // var email = localStorage.getItem("email");
        console.log('email in reset', email)
        User.findOneAndUpdate({ email: req.body.email },
          { password: hash }, null, function (err, docs) {
            if (err) {
              console.log(err)
            }
            else {
              console.log("Original Doc : ", docs);
              req.flash(
                'success_msg',
                'Password reset successfull'
              );
              res.redirect('/users/login');
            }
          }).then(res => console.log('success'))
          .catch(err => console.log(err))
      })
    })
  }
});

module.exports = router;
