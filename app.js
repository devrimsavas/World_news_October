//dotenv
require("dotenv").config();

//swagger
//const swaggerUi=require("swagger-ui-express");
//const swaggerFile=require('./swagger-output.json');
const bodyParser = require("body-parser");

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/signup");
var loginRouter = require("./routes/login");
var myPageRouter = require("./routes/mypage");

const cors = require("cors");

//add redis
require("./redis");

var app = express();

app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//add auth middleware
const { auth } = require("express-openid-connect");
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

app.use(auth(config));
//middleware to make the 'user object' available in all templates
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

//use also client side caching if we want
/*
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge:60*60*1000 // 1 hour
}));
*/

app.use(express.static(path.join(__dirname, "public")));

//bootstrap and jquery
app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use(express.static(__dirname + "/node_modules/jquery/dist"));
//bootstrap icons
app.use(express.static(__dirname + "/node_modules/bootstrap-icons"));

//sweat alert
app.use(express.static(__dirname + "/node_modules/sweetalert2/dist"));

app.use("/", indexRouter);
app.use("/signup", usersRouter);
app.use("/login", loginRouter);
app.use("/mypage", myPageRouter);

//swagger
app.use(bodyParser.json());
//app.use('/doc',swaggerUi.serve,swaggerUi.setup(swaggerFile));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
