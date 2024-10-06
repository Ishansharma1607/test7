
const express = require('express');
const session = require('express-session');

const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user === 'admin') {
    return next();
  } else {
    return res.redirect('/login');
  }
};

const loginHandler = (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '12345') {
    req.session.user = 'admin';
    return res.redirect('/app');
  } else {
    return res.redirect('/login');
  }
};

const logoutHandler = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

module.exports = { authMiddleware, loginHandler, logoutHandler };
