const ListenerArray = require('./ListenerArray.js');

class Emitter {
	constructor() {
		this.eventListeners = {};
	}

	/* Usage: 
		$.on('eventName', () => {
			console.log("New connection from client:\n", client);
		});
	*/
	on (eventName, callback) {
		if (!(eventName in this.eventListeners)) {
			this.eventListeners[eventName] = new ListenerArray(this)
		}

		return this.eventListeners[eventName].push(callback) - 1;
	}

	once (eventName, callback) {
		const index = this.on(eventName, function oneTime(...args) {
			callback(...args);
			this.detatch(eventName, oneTime);
		});
	}

	detatch (eventName, callback) {
		if (!(eventName in this.eventListeners)) {
			throw "Emitter detatch Error: Non-existent eventName: " + eventName;
		}

		console.log("Detatching Event for", eventName);
		return this.eventListeners[eventName].detatch(callback);
	}

	/* Usage: 
		const client = await $.until('connection')
		console.log("New connection from client:\n", client);
	*/
	async until(eventName) {
		return await new Promise((resolve, reject) => {
			this.once(eventName, resolve);
		});
	}

	async createEmitter(eventName) {
		if (!(eventName in this.eventListeners)) {
			return null;
		}

		console.log("Emitting event!", eventName);

		return ((...args) => 
			this.eventListeners[eventName].applyAll(args));
	}
}

module.exports = Emitter;
