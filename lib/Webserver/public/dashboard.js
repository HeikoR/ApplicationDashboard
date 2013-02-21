// ====================================================================================================================
// Description		: Client side dashboard implementation. Connector to socket.io stats collector and receives updates
//					: Created new DOM elements for pre-confiigured bindings.
//					: On update it will update pre-configured DOM elements.
// Author			: Heiko Risser
// Date Created		: 2013-02-16
// Date Modified    : 2013-02-21
// ====================================================================================================================

function log(message) { console.log(message); }

// Main entry point to create dashboard and connect to socket.io server
function init(collectorURL) {
    var conn = null;
    var dashboard = new Dashboard();

    conn = io.connect(collectorURL);
    conn.on('connect',      function () { log('Client connected to collector'); });
    conn.on('disconnect',   function () { log('Client disconnected'); });
    conn.on('close',        function () { log('Client connection closed'); });
    conn.on('error',        function (err) { log('Got error: ' + err); });

    // When we connect to socket.io server the server will send us default bindings
    // These are definitions on how to layout the dashboard and what collector values to bind to the dashboard layout
    conn.on('init-bindings', function (bindings) {
        console.log('got init bindings ... ', bindings);
        dashboard.setBindings(bindings);
    });

    // When collector has new data from stats server it will emit 'collector-data'.
    // Depending on the current bindings, the dashboard will update values displayed.
    conn.on('collector-data', function (data) { 
        console.log('got data ....: ' + data);
        dashboard.onData(JSON.parse(data));
    });
}

// --------------------------------------------------------------------------------------------------------------------
// Dashboard
// --------------------------------------------------------------------------------------------------------------------
// Sample bindings:
//	var bindings = { 
//		numLogins: { id:"namespace-numLogins", label: "Num Logins", lineBreak: true }
// }
function Dashboard() {
	this.bindings = null;
	this.onData = function(data) {
    	for (name in data) {
    		log('Got "' + name + '" with value: ' + data[name]);
    		this.updateItem(name, data[name]);
    	}
	}
}

// bindings - JSON definition of dashboard layout and collector values to bind to.
Dashboard.prototype.setBindings = function(bindings) {
    this.bindings = bindings;
    $('.block').remove();                       // remove all existing block elements before we start adding new set
    this.addItems();                            // add new items to dashboard (using current bindings data)
}

// typical counter binding definition:
//  name: { id: 'namespace-name', label: 'text to display above value', type: 'counter', newline: false }
// typical timer binding definition:
//  name: { id: 'namespace-name', label: 'descriptive text', type: 'timer', show: ['count', 'min', 'max', 'ave', 'maxInfo'], newline: true }
// - if 'label' is omitted, 'name' is used as label
// - if 'id' is omitted, 'namespace-' + 'name' is used to create unique id
Dashboard.prototype.addItems = function() {
    var bindings = this.bindings;
    for (name in bindings) {
        if (!bindings.hasOwnProperty(name))     // safety check, we only want our own object names
            continue;

        var label = bindings[name].label ? bindings[name].label : name;
        var id = bindings[name].id;
        var type = bindings[name].type;
        if (!id) {              // if id wasn't specified, then save it now (since its used to map incoming data)
            id = 'namespace-' + name;
            bindings[name].id = id;
        }
        var newline = bindings[name].newline;
        if (id) {
            switch (type) {
                case 'counter':
                    this.addCounterItem(label, id, newline);
                    break;
                case 'timer':
                    this.addTimerItem(label, id, newline, bindings[name].show);
                    break;
            }
        }
    }
}

// adds a new counter item to dashboard by creating a new DOM entry
// to display item label and value, and adds a line-break if option is set
Dashboard.prototype.addCounterItem = function(label, id, newline) {
    var linebreak = newline ? '<div style="clear:both"/>' : '';     // only append line break if we have 'lineBreak: true'
    var newItem = $('<div class="block"><div class="valuelbl"></div><div class="value"></div></div>' + linebreak);

    newItem
        .find('.valuelbl')
            .text(label)
        .end()
        .find('.value')
            .attr('id', id)
            .text('-')
        .end()
        .appendTo('#dashboard');
}

// adds a new timer item to dashboard by creating a new DOM entry
// to display item label and value, and adds a line-break if option is set
// for each subItem we create a new label-value block inside DOM
Dashboard.prototype.addTimerItem = function(label, id, newline, subItems) {
    var linebreak = newline ? '<div style="clear:both"/>' : '';     // only append line break if we have 'lineBreak: true'
    var itemHtml = '<div class="block"><div class="valuelbl"></div><div class="value"></div></div>';
    var newItem = $(itemHtml);
    // console.log('addTimerItem ------------ subItems:' + subItems.length);

    newItem
        .addClass('timerhdr')
        .find('.valuelbl')
            .text(label)
        .end()
        .find('.value')
            .attr('id', id + '-header')
            .text('')
        .end()
        .appendTo('#dashboard');

    for (var nItems=0; nItems < subItems.length; nItems++) {
        var subItemHtml = itemHtml + ((nItems === subItems.length-1) ? linebreak : '');
        // console.log('---- subItem: ' + subItems[nItems] + ' --> ' + subItemHtml);
        $(subItemHtml)      // if last item then append linebreak (if enabled)
            .addClass('timer')
            .find('.valuelbl')
                .text(subItems[nItems])
            .end()
            .find('.value')
                .attr('id', id + '-' + subItems[nItems])
                .text('-')
            .end()
            .appendTo('#dashboard');
    }
}

// update value displayed in dashboard for current item (if item was bound)
// if not all collector items were bound, then these will be ignored
Dashboard.prototype.updateItem = function(name, itemData) {
    var self = this;
    var item = self.bindings[name]; 
    var id = item ? item.id : undefined;
    var type = item ? item.type : undefined;

    if (item !== undefined && type !== undefined) {

        switch (type) {
            case 'counter': 
                if (!item.ele && id !== undefined) {
                    item.ele = document.getElementById(id);
                }
                if (item.ele)
                    item.ele.innerHTML = itemData.cnt; 
                break;
            case 'timer': 
                // TODO: move into functions and do more safety checks and error handling
                console.log('--- update timer item');
                var subItems = this.bindings[name].show;
            
                for (var idx=0; idx < subItems.length; idx++) {
                    var subItemID = id + '-' + subItems[idx];
                    // if DOM element not cached yet - then do so now
                    if (!item.ele)
                        item.ele = {};
                    if (!item.ele[subItemID])
                        item.ele[subItemID] = document.getElementById(subItemID);

                    if (item.ele[subItemID]) {
                        console.log('update timerItem: ' + name + ', subItem: ' + item.id + '-' + subItems[idx]);
                        item.ele[subItemID].innerHTML = itemData[subItems[idx]];
                    }
                }
                break;
            default:
                console.warn('*** Unhandled item type: ' + type);
        }
    }
}

