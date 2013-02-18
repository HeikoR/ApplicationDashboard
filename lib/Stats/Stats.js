// ====================================================================================================================
// Description		: Stats module. Use it to collect application stats like logins, games played, 
//					: min, max, average times to execute a function or task.
//					: Stats module can be queried on a configured port for stats summary snapshot. Summary is
//					: retured as JSON data.
// Author			: Heiko Risser
// Date Created		: 2013-02-15
// ====================================================================================================================
// TODO				: Later improvement would be to send summary data gzipped. But currently we aren't sending large 
//					: volumes of data.

// --------------------------------------------------------------------------------------------------------------------
// Example
// --------------------------------------------------------------------------------------------------------------------
// 		var stats = require('ApplicationDashboard').stats.createServer(9090);
// 		var numLogins = stats.addCounter('numLogins');
// 		numLogins.inc();
// 		stats.print();			// get summary

var http = require('http');
var Counter = require('./Counter');
var Timer = require('./Timer');


var stats = null;


function Stats() {
	this.server = null;
	this.stats = {};
}

Stats.prototype.addCounter = function(name, label) {
	if (this.stats[name])
		return null;
	this.stats[name] = new Counter(label);
	return this.stats[name];
}

Stats.prototype.addTimer = function(name, label) {
	if (this.stats[name])
		return null;
	this.stats[name] = new Timer(label);
	return this.stats[name];
}

Stats.prototype.createServer = function(port) {
	var self = this;
	if (self.server)
		return self;

	self.server = http.createServer(function (req, res) {
		console.log(self.print());
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(self.print()));
	}).listen(port);
	return self;
}

Stats.prototype.print = function(withLabels) {
	var statsSummary = {};
	for (name in this.stats) {
		statsSummary[name] = this.stats[name].print(withLabels);
	}
	return statsSummary;
}

module.exports = (function() {
	if (!stats)
		stats = new Stats();
	return stats;
})();



















