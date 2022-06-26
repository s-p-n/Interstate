const uuidv4 = require('uuid').v4;
const ListenerArray = require('./ListenerArray.js');
const Emitter = require('./Emitter.js');
const Packet = require('./Packet.js');

class Client extends Emitter {
	constructor (newConnection, server) {
		super();

		this.connection = newConnection;
		this.subscriptions = new Map();
		this.channels = this.eventListeners;
		this.server = server;
		this.id = uuidv4();
	}

	deconstruct() {
		disconnect();
		console.log("Client deconstructed.");
	}

	disconnect () {
		const connections = this.server.connections;
		if (connections.has(this.connection)) {
			console.log("Disconnected client:", this.id);
			connections.delete(this.connection);
			return (async () => {
				(await this.createEmitter("disconnect"))();
			})();
		}
	}

	emit (channelName, data) {
		this.connection.send(new Packet(channelName, data));
	}

	subscribe (Class, object=null) {
		if (this.subscriptions.has(Class)) {
			return false;
		}

		if (object === null) {
			object = new Class(this);
		} else if(!(object instanceof Class)) {
			throw new Error("Client Subscription Error: Subscribing to a Class with an object that is not an instance of that class.");
		}

		console.log("Subscribing to client:");
		console.log(Class);
		console.log(object);

		this.subscriptions.set(Class, object);
		object.start();
		return true;
	}
}

module.exports = function findOrCreateClient(newConnection, server) {
	// If connection already saved, send it:
	const connections = server.connections;
	console.log("Signal to create client");
	console.log("Total connections before new client: ", connections.size);
	if (connections.has(newConnection)) {
		return connections.get(newConnection);
	// No connection found, creat one:
	} else {
		const client = new Client(newConnection, server);
		connections.set(newConnection, client);
		return client;
	}
};