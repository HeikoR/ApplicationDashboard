
// This creates a stats server 
require('./create-simple-stats-server');

var Webserver = require('../')
	.WebServer()
	.startCollector();



