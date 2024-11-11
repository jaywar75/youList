// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');

// Models
const User = require('./models/User'); // Ensure this path is correct

// Routers
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth'); // Your authentication routes

const app = express();

// MongoDB Connection with Retry Logic
const connectWithRetry = async (retries = 5, delay = 3000) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log('MongoDB connected');
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    if (retries > 0) {
      console.log(`Retrying connection in ${delay / 1000} seconds...`);
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts');
      process.exit(1); // Exit if retries are exhausted
    }
  }
};

// Call the retry function
connectWithRetry();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
// Middleware to set the theme
app.use((req, res, next) => {
  const theme = req.cookies.theme || 'light'; // Assuming you're using cookies
  res.locals.theme = theme + '-theme';
  next();
});


// Logging setup
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });
app.use(logger('combined', { stream: accessLogStream }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy for User Authentication
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Make user available in templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/', authRouter); // Auth routes

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
