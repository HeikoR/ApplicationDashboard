// ====================================================================================================================
// Description		: Client side dashboard implementation. Connector to socket.io stats collector and receives updates
//					: Created new DOM elements for pre-confiigured bindings.
//					: On update it will update pre-configured DOM elements.
// Author			: Heiko Risser
// Date Created		: 2013-02-16
// ====================================================================================================================

function log(message) { console.log(message); }

function initComms(collectorURL, onDataCB) {
	var conn = null;
    conn = io.connect(collectorURL);
    conn.on('connect',      function () { log('Client connected to collector'); });
    conn.on('disconnect',   function () { log('Client disconnected'); });
    conn.on('close',        function () { log('Client connection closed'); });
    conn.on('error',        function (err) { log('Got error: ' + err); });

    conn.on('collector-data', function (data) { 
    	console.log('got data ....: ' + data);
    	if (typeof onDataCB === 'function')
    		onDataCB(JSON.parse(data));
	});
}

// Sample bindings:
//	var bindings = { 
//		numLogins: { id:"namespace-numLogins", label: "Num Logins", lineBreak: true }
// }
function Dashboard(bindings) {
	this.bindings = bindings;
	this.bindData = function() {

	}
	this.addItem = function(label, id, newLine) {
		// create a new DOM entry to display item label and value, and adds a line-break if option is set
		var linebreak = newLine ? '<div style="clear:both"/>' : '';		// only append line break if we have 'lineBreak: true'
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
    this.addTimerItem = function(label, id, newLine, subItems) {
        // create a new DOM entry to display item label and value, and adds a line-break if option is set
        var linebreak = newLine ? '<div style="clear:both"/>' : '';     // only append line break if we have 'lineBreak: true'
        var itemHtml = '<div class="block"><div class="valuelbl"></div><div class="value"></div></div>';
        var newItem = $(itemHtml);
        console.log('addTimerItem ------------ subItems:' + subItems.length);

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
            console.log('---- subItem: ' + subItems[nItems] + ' --> ' + subItemHtml);
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
	this.addItems = function() {
		var bindings = this.bindings;
    	for (name in bindings) {
    		var label = bindings[name].label ? bindings[name].label : name;
    		var id = bindings[name].id;
            var type = bindings[name].type;
    		if (!id) {				// if id wasn't specified, then save it now (since its used to map incoming data)
    			id = 'namespace-' + name;
    			bindings[name].id = id;
    		}
    		var newLine = bindings[name].newLine;
    		if (id) {
                switch (type) {
                    case 'counter':
                        this.addItem(label, id, newLine);
                        break;
                    case 'timer':
                        this.addTimerItem(label, id, newLine, bindings[name].show);
                        break;
                }
            }
    	}

	}
	this.onData = function(data) {
    	for (name in data) {
    		log('Got "' + name + '" with value: ' + data[name]);
    		this.updateItem(name, data[name]);
    	}
	}
	this.updateItem = function(name, itemData) {
		var item = this.bindings[name];	

		if (item !== undefined && item.type !== undefined) {
            switch (item.type) {
                case 'counter': 
                    if (!item.ele && item.id !== undefined) {
                        item.ele = document.getElementById(item.id);
                    }
                    if (item.ele)
                        item.ele.innerHTML = itemData.cnt; 
                    break;
                case 'timer': 
                    // TODO: optimize by looking up the elements only once !!!!!! See counter ...
                    // TODO: move into functions and do more safety checks and error handling
                    console.log('--- update timer item');
                    var subItems = this.bindings[name].show;
                    for (var idx=0; idx < subItems.length; idx++) {
                        console.log('update timerItem: ' + name + ', subItem: ' + item.id + '-' + subItems[idx]);
                        document.getElementById(item.id + '-' + subItems[idx]).innerHTML = itemData[subItems[idx]];
                    }
                    break;
                default:
                    console.log('*** Unhandled item type: ' + item.type);
            }
		}
	}

	this.addItems();
}