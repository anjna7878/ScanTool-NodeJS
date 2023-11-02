const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));

app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');
require('dotenv').config()


const routes = require('./routes/web');
app.use('/', routes);


app.listen('8000', () => {
	console.log('Server is running on port: 8000')
})