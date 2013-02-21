// ====================================================================================================================
// Description		: Socket.io webserver that listen to collector updates and hosts a dashboard website.
//					: Dashboard is updated by socket.io broadcast events
// Author			: Heiko Risser
// Date Created		: 2013-02-15
// Date Modified	: 2013-02-21
// *** Examples ***	: See end of file ...
// ====================================================================================================================
// TODO				: Make this configurable from the outside .. via exports ...
//					: configure listening ports, stats server url, collector requestInterval
var express = require('express');
var http = require('http');
var sio = require('socket.io');
var path = require('path');
var util = require('util');

var Collector = require('../Collector');


function WebServer(webPort, publicFolder) {
	if (!(this instanceof WebServer)) 
		return new WebServer(webPort, publicFolder);

	var app = express();
	var server = http.createServer(app);

	// --------------------------------------------------------------------------------------------------------------------
	// Socket.io (Express 3 method of integration)
	var io = sio.listen(server);
	io.set('log level', 1); 	
	io.configure(function () {
		// use global authorization and reject all cross-domain connection attempts
		io.set('authorization', function (handshakeData, callback) {
			if (handshakeData.xdomain) {
				callback('Cross-domain connections are not allowed');
			} else {
				callback(null, true);
			}
		});
	});

	io.sockets.on('connection', this.onConnection.bind(this));

	// --------------------------------------------------------------------------------------------------------------------
	var webDir = publicFolder || path.join(__dirname, 'public');
	app.configure(function() {
		app.set('port', process.env.WWW_PORT || webPort || 7080);
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
		app.use(express.logger({ format: ':method, :url'}));	// add connect middleware -> connect.logger
																//   express exports connect middleware so we can use
																//   express.logger instead
		app.use(express.static(webDir));
	});

	app.configure('development', function() {
		app.use(express.errorHandler());
	});

	app.get('/', function (req, res) { res.sendfile(webDir + '\\dashboard.html'); });

	// --------------------------------------------------------------------------------------------------------------------
	// Let's start the server
	server.listen(app.get('port'), function() {
		console.log("Webserver listening on port " + app.get('port') + '. Html home directory = ' + webDir);
	});

	this.getIO = function() { return io; }
}


WebServer.prototype.createServer = function() {
  return new WebServer();
};

// requestInterval - how often to query stats server for new summary snapshot
// options 	- configure where there stats server is. e.g.
//			  { hostname: myStatsServerHost.com, port: 7777 }
// 			- default options = { hostname: localhost, port: 9090 }
WebServer.prototype.startCollector = function(requestInterval, options) {
	var self = this;
	var httpOptions = {
		hostname: 'localhost',
		port: 9090,
		path: '/',
		method: 'GET'
	};
	util._extend(httpOptions, options)

	var interval = requestInterval || 5000;
	var collector = new Collector(options);
	var io = self.getIO();
	collector.maxRequests = 'unlimited';
	collector.collect(5000, function(data) {
		io.sockets.emit('collector-data', data);
	});
	return self;
}

WebServer.prototype.onConnection = function(socket) {
	var self = this;
	console.log('NEW SOCKET.IO CONNECTION');
	if (self.bindings) {
		socket.emit('init-bindings', self.bindings);
	}
}

WebServer.prototype.setBindings = function(bindings) {
	console.log('WebServer setBindings: ' + JSON.stringify(bindings));
	var self = this;
	self.bindings = bindings;
	// broadcast new bindings to all connected socket.io clients
	if (self.bindings) {
		var io = self.getIO();
		io.sockets.emit('init-bindings', self.bindings);
	}
	return self;
}

// Dummy bindings to get us started
WebServer.prototype.bindings = {
                    numLogins:      { type: 'counter', newline: true },
                    loginTime:      { label: 'LoginTime', type: 'timer', show: ['count', 'min', 'max', 'ave', 'maxInfo'], newline: true},
                    counter:        { label: 'Slot Games Played', type: 'counter' },
                    gamesPlayed:    { label: 'Bingo Games Played', type: 'counter' }
                };

// --------------------------------------------------------------------------------------------------------------------
module.exports = WebServer;


// --------------------------------------------------------------------------------------------------------------------
// Example 1 (minimal)
//		require('ApplicationDashboard').WebServer().startCollector();
//		or
//		require('ApplicationDashboard').WebServer(8800).startCollector(5000);
//
// Example 2
//		var dash = require('ApplicationDashboard');
//		var webserver = dash.WebServer(8800);
//		webserver.startCollector(5000);
//
// Example 3
//		var dash = require('ApplicationDashboard');
//		var webserver = dash.WebServer;
//		webserver.createServer(8080);						// will start express and socket.io server
//		webserver.startCollector(5000);						// will start collecting information from stats server and emit via socket.io broadcast
//
// Example 4 (different webfolder)
//		var dash = require('ApplicationDashboard');
//		var webserver = dash.WebServer(8800, process.cwd() + '\\public');	// this will host webpages from current working folder + '\public'
//
// Example 5 (bindings)
//		var Webserver = require('ApplicationDashboard')
//			.WebServer()
//			.setBindings({
//       		numLogins:      { type: 'counter', newline: true }
//			})
//			.startCollector();
//
//		// re-set webserver bindings
//		Webserver.setBindings({
//		        numLogins:      { type: 'counter', newline: true },
//		        loginTime:      { label: 'LoginTime', type: 'timer', show: ['count', 'min', 'max', 'ave', 'maxInfo'], newline: true},
//		        counter:        { label: 'Slot Games Played', type: 'counter' },
//		        gamesPlayed:    { label: 'Bingo Games Played', type: 'counter' }
//		    });

