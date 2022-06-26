const WS = require('ws');
const ListenerArray = require('./ListenerArray.js');
const Emitter = require('./Emitter.js');
const eventNames = [
	"ready",
	"error",
	"connect",
	"disconnect",
	"message",
	"pong"
];

class WebSocket extends Emitter {
	constructor(properties) {
		super();
		this.port = properties.port || 8496;
		this.isReady = false;
		this.ws = new WS.Server({ port: 4200 });
		this.connections = new Map();

		this.eventListeners = eventNames.reduce((obj, name) => {
			obj[name] = new ListenerArray(this);
			return obj;
		}, Object.create(null));

		this.setupInternalEvents();
	}

	/* Usage: 
		$.on('connection', (client) => {
			console.log("New connection from client:\n", client);
		});
	*/
	on (eventName, callback) {
		if (!(eventName in this.eventListeners)) {
			console.error(`Hey programmer, '${eventName}' isn't right. Try one of these:
				${eventNames}
			`);
			return null;
		}

		if (eventName === "ready" && this.isReady) {
			(async () => callback());
		}

		return this.eventListeners[eventName].push(callback);
	}

	/* Usage: 
		const client = await $.until('connection')
		console.log("New connection from client:\n", client);
	*/
	async until(eventName) {
		return await new Promise((resolve, reject) => {
			if (!(eventName in this.eventListeners)) {
				return reject(`Hey programmer, '${eventName}' isn't right. Try one of these:
					${eventNames}
				`);
			}

			if (eventName === "ready" && this.isReady) {
				return resolve();
			}

			this.once(eventName, resolve);
		});
	}

	async createEmitter(eventName) {
		if (!(eventName in this.eventListeners)) {
			console.error(`Hey programmer, '${eventName}' isn't right. Try one of these:
				${eventNames}
			`);
			return null;
		}

		console.log("Emitting event:", eventName);

		return ((...args) => 
			this.eventListeners[eventName].applyAll(args));
	}

	async setupInternalEvents() {
		console.log("Setting up connection emits:")

		this.ws.on("connection", await this.createEmitter("connect"));
		
		this.isReady = true;

		console.log("Setting up ready emits:")
		this.eventListeners["ready"].applyAll();
	}

}

module.exports = WebSocket;