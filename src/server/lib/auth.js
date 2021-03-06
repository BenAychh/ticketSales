var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var knex = require('../db/knex');
var helpers = require('./helpers');
function Teachers() {
  return knex('teachers');
}
function Events() {
  return knex('events');
}

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(email, password, done) {
    Teachers().where('email_address', email).then(function(data) {
      if (!data.length) {
        return done('Incorrect email');
      }
      var user = data[0];
      if (helpers.comparePassword(password, user.password)) {
          return done(null, user);
        } else {
          return done('Incorrect password');
        }
    }).catch(function(err) {
      return done('Incorrect email and/or password');
    });
  }
));

// sets the user to 'req.user' and establishes a session via a cookie
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// used on subsequent requests to update 'req.user' and update session
passport.deserializeUser(function(id, done) {
  // find user and return by id
  Teachers().where('id', id)
  .then(function(user) {
    Events().where({school_id: user[0].school_id})
    .then(function(events) {
      var eventsArray = [];
      events.forEach(function(event) {
        eventsArray.push(event.id);
      })
      user[0]['events'] = eventsArray;
      return done(null, user[0]);
    })
  }).catch(function(err) {
    return done(err);
  });
});


module.exports = passport;
