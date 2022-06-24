class Heartbeat {
	constructor(client) {
		this.client = client;
		this.ticker = client?.subscriptions?.get('ticker');
		this.heartbeatTime = 1000;
		this.isAlive = false;
		this.stopNextTick = false;
		this.isRunning = false;

		if (!this.ticker) {
			throw `Heartbeat requires the client have an instance of Ticker as a subscription named 'ticker'`;
		}
	}

	async start() {
		if (this.isRunning) {
			return false;
		}

		this.isRunning = true;

		this.client.connection.on("pong", () => {
			console.log("Got pong");
			this.isAlive = true;
		});
		let last_heartbeat_time = this.ticker.now - 1000;
		while (!this.stopNextTick) {
			this.isAlive = false;
			this.client.connection.ping()
			console.log("Sent ping");
			let adjustment = Math.round((this.heartbeatTime - (this.ticker.now - last_heartbeat_time)) / this.ticker.delay) * this.ticker.delay;
			
			
			if (adjustment > 0) {
				adjustment = 0;
			}

			if (adjustment < this.ticker.delay * -2) {
				adjustment = this.ticker.delay * -2;
			}
			console.log('adjustment:', adjustment);
			let delay = this.heartbeatTime + adjustment;
			last_heartbeat_time = this.ticker.now
			console.log('waiting:', delay);
			await this.ticker.untilInterval(delay);
			console.log('actually waited:', this.ticker.now - last_heartbeat_time)
			console.log("Is alive?", this.isAlive,);
			if (!this.isAlive) {
				this.stopNextTick = true;
			}
		}

		console.log("Client Heartbeat Lost.");
		this.client.disconnect();
	}

	async untilHeartbeat() {

	}

	handlePong() {
		this.isAlive = true;
	}
}

module.exports = Heartbeat;