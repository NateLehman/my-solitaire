/* Copyright G. Hemingway, @2017 */


const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
const port = process.env.PORT ? process.env.PORT : 8080;


// Setup our Express pipeline
const app = express();
app.use(express.static(path.join(__dirname, '../../public')));
if (env !== 'test') app.use(logger('dev'));
app.engine('pug', require('pug').__express);

app.set('views', __dirname);
// Setup pipeline session support
const redisOptions = (env === 'production' ? { url: process.env.REDIS_URL } : {
  host: 'localhost',
  port: '32769',
});
app.use(session({
  name: 'session',
  store: new RedisStore(redisOptions),
  secret: 'ohhellyes',
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: '/',
    httpOnly: false,
    secure: false,
  },
}));
// Finish pipeline setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to mongoBD
const options = {
  useMongoClient: true,
};
const mongoURI = env === 'production'
  ? process.env.MONGODB_URI
  : 'mongodb://localhost:32768/lehmann';
mongoose.connect(mongoURI, options)
  .then(() => {
    console.log('\t MongoDB connected');

    // Import our Data Models
    app.models = {
      Game: require('./models/game'),
      User: require('./models/user'),
    };

    // Import our API Routes
    require('./api/v2/game')(app);
    require('./api/v1/user')(app);
    require('./api/v1/session')(app);

    // Give them the SPA base page
    app.get('*', (req, res) => {
      let preloadedState = req.session.user ? {
        username: req.session.user.username,
        primary_email: req.session.user.primary_email,
      } : {};
      preloadedState = JSON.stringify(preloadedState).replace(/</g, '\\u003c');
      res.render('base.pug', {
        state: preloadedState,
      });
    });
  }, (err) => {
    console.log(err);
  });


// Run the server itself
const server = app.listen(port, () => {
  console.log(`Assignment 5 app listening on ${server.address().port}`);
});
