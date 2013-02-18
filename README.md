
# ApplicationDashboard

Weekend project which will hopefully receive some more attention in due time. 

Intent was to write a simple stats application that can be used to profile our load-testing applications and provide external feedback on performance.
This can be done by either querying the _stats_ server directly (e.g. with curl piped to JSON formatter, or by using the _dashboard_, or alternately by creating a simple _console application_).

I've found some inspiration from [statusdashboard](https://github.com/obazoud/statusdashboard/) and the node.js [metrics](https://github.com/mikejihbe/metrics) module. Unfortunately they both weren't exactly what I needed. Additionally most dashboards that I looked at only ran on _\*nix_ machines and required _graphite_ which looks awsome, but doesn't run on windows.

__ApplicationDashboard__ is made up of 3 modules: `Stats`, `Collector`, and `Webserver`.

- `Stats` module allows for _simple_ application profiling and hosts a http server that will return a stats summary on request. Summary is returned in JSON.
- `Collector` module can be configured to query a stats server at pre-configured intervals, and on receipt of data call a callback with latest summary information.
- `Webserver` hosts a simple dashboard, creates a collector that connects to stats server, and will then push updates (via socket.io broadcast) to the dashboard.

## Stats module

Currently only supports the following 2 metrics:

- Counter - `inc`, `dec` and `reset` a counter value
- Timer - Measures the time taken to complete a process/function/task/database call/etc and increments a counter for each measurement taken.  
	Returns Count, Min, Max, Ave, and MaxInfo. Where MaxInfo can be used to identify the task that took the longest.

## Examples

- See the examples folder for examples on how to create and use the modules.
- See comments and examples in code.
- See minimal example below:

		var dash = require ('ApplicationDashboard')

		var stats = dash.stats.createServer(9090);
		stats.addCounter('numLogins', 'Player Logins').inc(5);
		stats.addCounter('gamesPlayed', 'Games Played').inc(53);

		// Configure webport to 7080, 
		// collector update interval to 5 seconds, 
		// and stats server url as localhost:9090
		dash.WebServer(7080).startCollector(5000, { hostname: 'localhost', port: 9090});


__Note:__ The `dashboard.html` file currently relies on the server to be configured to port `7080`. If this is changed, 
then update the _socket.io URL_ to new port (inside `dashboard.html`). 

## Todo

- Lots :)
- Will add features as required.
- Need to find a better way to manage/create/host the public webserver folder.
  

## npm install from github repo

`npm install https://github.com/HeikoR/ApplicationDashboard/archive/master.tar.gz`

Then you can run test script by calling the following:

`require('ApplicationDashboard\\examples\\create-simple-webserver');`



