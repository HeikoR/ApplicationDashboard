
var Collector = require('../').Collector;

// This creates a demo stats server with some data
require('./create-simple-stats-server');

// Create new collector.
// If no options are specified, it will use default options (hostname = localhost, port = 9090)
var collector = new Collector();
collector.maxRequests = 10;
collector.collect(5000, function(data) {
	// new data available from stats server
	console.log('Collector got data:\n', data);
	// io.sockets.emit('collector-data', data);	
});


