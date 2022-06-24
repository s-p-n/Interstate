const uuidv4 = require('uuid').v4;
const connections = new Map();

class Client {
	constructor (newConnection, server) {
		this.connection = newConnection;
		this.subscriptions = new Map();
		this.server = server;
		this.id = uuidv4();
	}

	disconnect() {
		if (connections.has(this.connection)) {
			console.log("Disconnected client:", this.id);
			connections.remove(this.connection);

		}
	}

	subscribe (Class, object=null) {
		if (object === null) {
			object = new Class(this);
			
		} else if(!(object instanceof Class)) {
			throw new Error("Client Subscription Error: Subscribing to a Class with an object that is not an instance of that class.");
		}

		if (this.subscriptions.has(Class)) {
			return false;
		}

		this.subscriptions.set(Class, object);
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