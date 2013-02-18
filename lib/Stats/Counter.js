
function Counter(label) {
	this.label = label ? label : '';
	var count = 0;
	this.type = 'counter';
	this.inc = function(val) { count += val ? parseInt(val,10) : 1;	return this; }
	this.dec = function(val) { count -= val ? parseInt(val,10) : 1;	return this; }
	this.reset = function(val) { count = val ? parseInt(val,10) : 0; return this; }
	this.print = function(withLabels) {
		console.log('Counter = ' + count);
		if (withLabels)
			return { label: this.label, type: this.type, cnt: count };
		else
			return { cnt: count };
		// return count; 
	}
}

module.exports = Counter;
