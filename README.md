
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

		// ------------------------------------------------------------------------------------------------
		// Listen on port 9090, and reply stats summary on any request received.
		var stats = dash.stats.createServer(9090);

		// ------------------------------------------------------------------------------------------------
		// Create 2 counters: numLogins and gamesPlayed
		stats.addCounter('numLogins', 'Player Logins').inc(5);
		
		var gamesPlayed = stats.addCounter('gamesPlayed', 'Games Played');
		gamesPlayed.inc(53);
		gamesPlayed.reset();
		gamesPlayed.inc();

		// ------------------------------------------------------------------------------------------------
		// Create a timer: loginTime
		// - then measure loginTime for 'player 1'
		// - then measure loginTime for 'player 2'
		var loginTime = stats.addTimer('loginTime', 'Player Login Time');

		var thisTimer = loginTime.start('player 1');
		setTimeout(function() {thisTimer.stop();}, 1500);

		var thisTimer2 = loginTime.start('player 2');
		setTimeout(function() {thisTimer2.stop();}, 500);

		// ------------------------------------------------------------------------------------------------
		// Configure webport to 7080, 
		// - set collector update interval to 5 seconds, 
		// - set stats server url as localhost:9090
		dash.WebServer(7080).startCollector(5000, { hostname: 'localhost', port: 9090});

	- Test stats server using curl and [json-command](http://github.com/zpoley/json-command) for readable formatting.

			curl http://localhost:9090/ 2> null | json

__Note:__ The `dashboard.html` file currently relies on the server to be configured to port `7080`. If this is changed, 
then update the _socket.io URL_ to new port (inside `dashboard.html`). 

## Todo

- Lots :)
- Will add features as required.
- Need to find a better way to manage/create/host the public webserver folder.
- Allow  `Timer.stop(...text here...)` function to add text to result. For example:

  		var myTimer = timer.start('Login xyz.');
  		...
  		myTimer.stop('Failed with err: blabla');
  

## npm install from github repo

`npm install https://github.com/HeikoR/ApplicationDashboard/archive/master.tar.gz`

Then you can run test script by calling the following:

`require('ApplicationDashboard\\examples\\create-simple-webserver');`



