// ====================================================================================================================
// Description		: Socket.io webserver that listen to collector updates and hosts a dashboard website.
//					: Dashboard is updated by socket.io broadcast events
// Author			: Heiko Risser
// Date Created		: 2013-02-15
// ====================================================================================================================
// TODO				: Make this configurable from the outside .. via exports ...
//					: configure listening ports, stats server url, collector requestInterval

var express = require('express');
var http = require('http');
var io = require('socket.io');
var app = express();
var path = require('path');

// var port = process.argv[2] || 7080;

var server = http.createServer(app);
var io = io.listen(server);
io.set('log level', 1); 	


app.configure(function() {
	app.set('port', process.env.WWW_PORT || 7080);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(express.logger({ format: ':method, :url'}));	// add connect middleware -> connect.logger
															//   express exports connect middleware so we can use
															//   express.logger instead
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	app.use(express.errorHandler());
});

app.get('/', function (req, res) { res.sendfile(__dirname + '\\public\\dashboard.html'); });



// --------------------------------------------------------------------------------------------------------------------
var options = {
	hostname: 'localhost',
	port: 9090,
	path: '/',
	method: 'GET'
};


io.sockets.on('connection', function(socket) {
	console.log('GOT SOCKET IO CONNECTION');
	// socket.emit('collector-data', 'test data ...');
});


// TODO: Move this into a separate function ***** and allow us to call this from exports .. 
var Collector = require('../Collector');
var collector = new Collector(options);
collector.maxRequests = 'unlimited';
collector.collect(5000, function(data) {
	io.sockets.emit('collector-data', data);
});

// --------------------------------------------------------------------------------------------------------------------
// Let's start the server
server.listen(app.get('port'), function() {
	console.log("Webserver listening on port " + app.get('port') + '. Html home directory = ' + __dirname);
});

