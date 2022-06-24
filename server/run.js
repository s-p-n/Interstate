const Ticker = require('./lib/Ticker.js');
const Heartbeat = require('./lib/Heartbeat.js');
const Client = require('./lib/Client.js');
const WebSocket = require('./lib/WebSocket.js');

const port = 4200;
const interstate = new WebSocket({port});
const ticker = new Ticker(10);

// Async/await implementation:
(async function ($) {
	await $.until("ready");
	console.log(`A: Interstate is listening on port ${$.port}`);
	//ticker.start();
	let client;
	console.log("Waiting for clients...");
	while(client = new Client(await $.until("connect"), $)) {
		console.log(`A Client connected`);
		console.log(client.id);
		client.subscribe(Ticker, ticker);
		client.subscribe(Heartbeat);
	}
	console.log("No longer listening for connections.");
	process.exit(0);
}(interstate));

/*
// Callback implementation:
(async function ($) {
	$.on("ready", async function () {
		console.log(`B: Interstate is listening on port ${this.port}`);

		$.on("connect", async function (newConnection) {
			const client = new Client(newConnection, $);
			console.log(`B: Client connected`);
			console.log(client.id);
		});
	});
}(interstate));
*/

console.log("End of run.js.");