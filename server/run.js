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
	console.log(`Interstate is listening on port ${$.port}`);
	
	let client;
	console.log("Waiting for clients...");
	while(client = new Client(await $.until("connect"), $)) {
		try {
			console.log(`A Client connected`);
			console.log(client.id);
			client.subscribe(Ticker, ticker);
			client.subscribe(Heartbeat);
		} catch (err) {
			console.error(err);
			client.disconnect();
		}
	}
	console.log("No longer listening for connections.");
	process.exit(0);
}(interstate));

console.log("End of run.js.");