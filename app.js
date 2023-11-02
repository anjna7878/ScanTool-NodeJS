const express = require('express');
const app = express();
app.use(express.json());
const session = require('express-session');
app.use(express.urlencoded({
	extended: true
}));
let mongoose = require('mongoose');
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

app.use(function (req, res, next) {
	res.locals.user = req.session;
	next();
});

const axios = require('axios');


app.use(express.static(__dirname + '/public'));
var Meta = require('html-metadata-parser');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: 'SECRET'
}));

require('dotenv').config()

var passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

let dbConfig = require('./database/db');
 
console.log('====================================');
mongoose.connect(dbConfig.db);
console.log('====================================');

let userSchema = require('./Models/user');
mongoose.connection.on('open', function (ref) {
	console.log('____________Connected to mongo server.____________________');

});
mongoose.connection.on('error', function (err) {
	console.log('____________Could not connect to mongo server!.________________________');
	console.log(err);
});


app.get('/success', (req, res) => {
	console.log('USER::', userProfile);
	res.render('pages/success', { user: userProfile });
});
app.get('/error', (req, res) => res.send("error logging in"));

// app.get('/here', (req, res) => {
// 	console.log('JSON');
// 	Meta.parser('https://www.youtube.com/watch?v=GN2nFJ9Ku6Q', function (err, result) {

// 		console.log(JSON.stringify(result, null, 3));
// 		return res.json(JSON.stringify(result, null, 3));

// 	})
// })

passport.serializeUser(function (user, cb) {
	cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
	cb(null, obj);
});


/*  Google AUTH  */
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: "/auth/google/callback"
},
	function (accessToken, refreshToken, profile, done) {
		userProfile = profile;
		return done(null, userProfile);
	}
));

app.get('/auth/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/error' }),
	async function (req, res) {
		// Successful authentication, redirect success.
		const user = req.user._json;
		console.log(user)
		// console.log("ID: " + user.sub); // Don't send this directly to your server!
		// console.log('Full Name: ' + user.name);
		// console.log('Given Name: ' + user.given_name);
		// console.log('Family Name: ' + user.family_name);
		// console.log("Image URL: " + user.picture);
		// console.log("Email: " + user.email);

		const exist_user = await userSchema.findOne({ email: user.email });
		if (exist_user) {
			req.session.user = exist_user;
			return res.redirect('/dashboard');
		} else {
			const new_user = await userSchema.create({
				"first_name": user.given_name,
				"last_name": user.family_name,
				"email": user.email,
				"google_id": user.sub,
				"image": user.picture,
				"status": 'active',
			});
			req.session.user = new_user;
			return res.redirect('/dashboard');
		}
	}
);

const routes = require('./routes/web');
app.use('/', routes);

// set up a route to redirect http to https
// app.get('*', function (req, res) {
// 	res.redirect('https://' + req.headers.host + req.url);

// 	// Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
// 	// res.redirect('https://example.com' + req.url);
// })


app.listen('8000', () => {
	console.log('Server is running on port: 8000')
})