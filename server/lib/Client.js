const uuidv4 = require('uuid').v4;
const connections = new Map();

class Client {
	constructor (newConnection, server) {
		this.connection = newConnection;
		this.subscriptions = new Map();
		this.server = server;
		this.id = uuidv4();
	}

	disconnect(connection) {
		if (connections.has(connection)) {
			console.log("Disconnected client:", this.id);
			connections.remove(connection);
		}
	}

	subscribe (name, Class) {
		let object;

		if (Class.start) {
			object = Class;
		} else {
			object = new Class(this);
		}

		if (this.subscriptions.has(name)) {
			return false;
		}

		this.subscriptions.set(name, Class);
		object.start();
		return true;
	}
}

module.exports = function findOrCreateClient(newConnection, server) {
	// If connection already saved, send it:
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