const ListenerArray = require('./ListenerArray.js');

class Ticker {
	constructor (delay=5) {
		this.stopNextTick = false;
		this.delay = delay;
		this.tickListeners = new ListenerArray(this);
		this.setLastTick();
		this.running = false;
		console.log("Ticker Created");
	}

	get now() {
		return Date.now();
	}

	async untilInterval(time) {
		const end_time = this.now + time;

		while (this.now < end_time) {
			await this.untilTick()
		}

		return true;
	}

	setLastTick() {
		this.lastTick = this.now;
	}

	isTimeForTick() {
		//console.log("Not time for tick", this.now, (this.lastTick + this.delay));
		return this.now >= (this.lastTick + this.delay);
	}

	async untilTick() {
		return await new Promise(accept => {
			this.onTick(accept);
		});
	}

	onTick(callback) {
		this.tickListeners.push(callback);
	}

	async handleTick() {
		await this.tickListeners.applyAll();
		this.setLastTick();
	}

	start () {
		if (!this.running) {
			console.log("Ticker started");
			this.setLastTick();
			this.running = true;
		}

		process.nextTick(
			() => setImmediate(
				async () => {
					if (this.stopNextTick) {
						console.log("Ticker Stopped");
						return;
					}
					if (!this.isTimeForTick()) {
						return this.start();
					}

					let offByAmount = this.delay - 
								(this.now - this.lastTick);
					
					if (offByAmount !== 0) {
						console.error("Ticker WARNING: Tick Off by: ", offByAmount);
					}

					await this.handleTick();
					return this.start();
		}));
	}

	stop () {
		this.stopNextTick = true;
	}
}

module.exports = Ticker;