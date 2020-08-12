
require('dotenv').config();

var express 			  = require('express'),
	bodyParser 			  = require('body-parser'),
	mongoose 			  = require('mongoose'),
	passport 			  = require('passport'),
	LocalStrategy 		  = require('passport-local'),
	passportLocalMongoose = require('passport-local-mongoose'),
	expressSession		  = require('express-session'),
	methodOverride		  = require('method-override'),
	flash				  = require('connect-flash'),
	User 				  = require('./models/users'),
	Campground 			  = require('./models/campgrounds'),
	seedDB 				  = require("./models/seeds"),
	Comment 			  = require('./models/comments'),
	app 				  = express();

var comments    = require('./routes/comments'),
	campgrounds = require('./routes/campgrounds'),
	index       = require('./routes/index');

mongoose.connect(process.env.DB_LOCAL_URL, { useNewUrlParser: true, useUnifiedTopology: true });

//console.log(process.env.DB_LOCAL_URL);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment'); // Dynamivc time

//seedDB(); // seed the data

app.use(expressSession({
	secret: 'Aniket Pathak is great',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use(index);
app.use('/campground',campgrounds);
app.use('/campground/:id/comments',comments);

// app.listen(process.env.PORT,process.env.IP,function(){
// 	console.log("Yelcamp server has started");
// });

app.listen(3000,function(){
	console.log("Yelcamp server has started");
});







