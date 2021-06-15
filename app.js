// SET Development mode or Production mode
// UNIX : export NODE_ENV=development
// Windows : set NODE_ENV=production

process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() === 'production'
    ? 'production'
    : 'development';
console.log('NODE_ENV => ', process.env.NODE_ENV);
console.log('NODE_APP_INSTANCE => ', process.env.NODE_APP_INSTANCE);
console.log('__dir => ', __dirname);

require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const assetsRouter = require('./routes/api/assets');
const btcRouter = require('./routes/api/btc');
const xlmRouter = require('./routes/api/xlm');
const ethRouter = require('./routes/api/eth');
const aaveRouter = require('./routes/api/aave');
const tronRouter = require('./routes/api/tron');
const atemRouter = require('./routes/api/atem');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// allow cors module
// app.use(cors({origin: '*'}));
app.use(cors({credentials: true, origin: true}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const version = '/v1';

app.use('/', indexRouter);
app.use(`${version}/assets`, assetsRouter);
app.use(`${version}/btc`, btcRouter);
app.use(`${version}/xlm`, xlmRouter);
app.use(`${version}/eth`, ethRouter);
app.use(`${version}/aave`, aaveRouter);
app.use(`${version}/tron`, tronRouter);
app.use(`${version}/atem`, atemRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
