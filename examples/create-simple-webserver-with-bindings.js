
// This creates a stats server 
require('./create-simple-stats-server');

// each bindings key maps to a incoming data key (e.g we receive data = { hello: 'value'}, then our key should also be named hello)
// id       - this maps a data key to a DOM element that should be updated when new data arrives for that data-key
//          - if 'id' is omitted, then and id will be created by concatenating 'namespace' + bindings-key 
// label    - text to be displayed above a data-value for given bindings-key
//          - if omitted, then the bindings-key will be used as label
// newline  - if specified, and true, then this will force a line-break in html content andn the following items will start on a new line
// show		- which time items to display in dashboard --> ['count', 'min', 'max', 'ave', 'maxInfo']

var Webserver = require('../')
	.WebServer()
	.setBindings({
        numLogins:      { type: 'counter', newline: true },
        loginTime:      { label: 'LoginTime', type: 'timer', show: ['count', 'min', 'max', 'ave', 'maxInfo'], newline: true}
	})
	.startCollector();

Webserver.setBindings({
        numLogins:      { type: 'counter', newline: true },
        loginTime:      { label: 'LoginTime', type: 'timer', show: ['count', 'min', 'max', 'ave', 'maxInfo'], newline: true},
        counter:        { label: 'Slot Games Played', type: 'counter' },
        gamesPlayed:    { label: 'Bingo Games Played', type: 'counter' }
    });


