
var stats = require('../').stats;

// --------------------------------------------------------------------------------------------------------------------
// Listen on port 9090, and reply stats summary on any request received.
stats.createServer(9090);

// --------------------------------------------------------------------------------------------------------------------
// Create a counter: numLogins
var cntLogins = stats.addCounter('numLogins', 'Player Logins');
cntLogins.inc();
setInterval(function() {cntLogins.inc()}, 5000);

// --------------------------------------------------------------------------------------------------------------------
// Create a counter: gamesPlayed
var cntGamesPlayed = stats.addCounter('gamesPlayed', 'Games Played');
cntGamesPlayed.inc();
cntGamesPlayed.inc();
setInterval(function() {cntGamesPlayed.inc()}, 3000);

// --------------------------------------------------------------------------------------------------------------------
// Create a timer: loginTime
// then measure loginTime for 'player 1'
// then measure loginTime for 'player 2'
var loginTime = stats.addTimer('loginTime', 'Player Login Time');
var thisTimer = loginTime.start('player 1');
setTimeout(function() {thisTimer.stop();}, 1500);

var thisTimer2 = loginTime.start('player 2');
setTimeout(function() {thisTimer2.stop();}, 500);

// --------------------------------------------------------------------------------------------------------------------
// Print summary after 3 seoncds (this gives us time for the fake 'logins' to complete)
setTimeout(function() {
	console.log('Stats Summary:\n', stats.print(true));
}, 3000);


// --------------------------------------------------------------------------------------------------------------------
// Test stats server
// curl http://localhost:9090/ 2> null | json

