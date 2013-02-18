
function StartStopTimer(callback, description) {
	var startTime = new Date();
	var timeTaken = 0;
	this.stop = function() {
		timeTaken = (new Date()) - startTime;
		if (typeof callback === 'function')
			callback(timeTaken, description ? description : '');
	}
}

function Timer(label) {
	this.label = label ? label : '';
	this.count = 0;
	this.minTime = undefined;
	this.maxTime = 0;
	this.aveTime = 0;
	this.totalTime = 0;
	this.maxTimeDescription = '';

	this.type = 'timer';
	this.start = function(description) {
		return (new StartStopTimer(this.onTimerStopped.bind(this), description));
	}
	this.onTimerStopped = function(timeTaken, description) {
		this.count += 1;
		if (this.minTime === undefined || this.minTime > timeTaken) {
			this.minTime = timeTaken; 
		}
		if (this.maxTime < timeTaken) {
			this.maxTime = timeTaken;
			this.maxTimeDescription = description;
		}
		this.totalTime += timeTaken;
		this.aveTime = this.totalTime / this.count;
	}
	this.print = function(withLabels) {
		if (withLabels)
			return {label: this.label,
					type: this.type,
					count: this.count, 
					min: this.minTime, 
					max: this.maxTime, 
					ave: this.aveTime, 
					maxInfo: this.maxTimeDescription };
		else
			return {count: this.count, 
					min: this.minTime, 
					max: this.maxTime, 
					ave: this.aveTime, 
					maxInfo: this.maxTimeDescription };
	}
}


module.exports = Timer;
















