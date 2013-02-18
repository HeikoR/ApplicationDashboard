// ====================================================================================================================
// Description		: Implementation of a collector that queries the stats server for updated snapshot of current
//					: stats values.
//					: The collector can be configured to repeatedly query the stats server at set intervals, and then
//					: call a custom callback function when new stats data has become available 
// Author			: Heiko Risser
// Date Created		: 2013-02-15
// ====================================================================================================================
// TODO				: Allow for multiple stats servers to be read by a single collector

// --------------------------------------------------------------------------------------------------------------------
// Example
// --------------------------------------------------------------------------------------------------------------------
// 		var Collector = require('ApplicationDashboard').Collector;
// 		var collector = new Collector();
// 		var requestInterval = 5000;						// request update from stats server every 5 seconds
// 		collector.maxRequests = 'unlimited';
// 		collector.collect(requestInterval, function(data) { console.log('Collector got data:\n', data); });

var http = require('http');
var util = require('util');

var defaultOptions = {
	hostname: 'localhost',
	port: 9090,
	path: '/',
	method: 'GET'
};

function Collector(options) {
	var self = this;
	console.log('----------------- init COLLECTOR ----');
	this.requests = 0;
	this.maxRequests = 'unlimited';
	this.requestInterval = 5000;
	this.httpOptions = util._extend(defaultOptions, options);
	this.collect = function(interval, callback) {
		// setInterval(this.readData.bind(this), interval);
		this.requestInterval = interval ? interval : this.requestInterval;
		this.onDataCB = typeof callback === 'function' ? callback : null;
		this.readData();
	}
	this.onData = function(data) {
		console.log('Got new data: ', data);
		self.onDataCB(data);
		self.requests += 1;
		if (self.maxRequests === 'unlimited' || self.requests < self.maxRequests)
			setTimeout(self.readData.bind(self), self.requestInterval);
	}
	this.readData = function() {
		var req = http.request(this.httpOptions, this.readResponse.bind(this));
		req.on('error', this.readError);
		// write data to request body
		req.write('data\n');
		req.write('data\n');
		req.end();
	}
	this.readResponse = function(res) {
		if (res.statusCode !== 200) {
			self.readError('Unexpected response: ' + res.statusCode);
			return;
		}
		res.setEncoding('utf8');
		res.on('data', this.onData);
	}
	this.readError = function(err) {
		console.log('Failed to read data from "' + self.httpOptions.hostname + '". ' + err);
	}
}


module.exports = Collector;























