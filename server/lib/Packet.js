
class Packet {
	constructor (channelName, data) {
		this.channel = channelName;
		this.data = data;
	}

	toString () {
		const self = this;
		return JSON.stringify({
			channel: self.channel,
			data: self.data
		});
	}
}

module.exports = Packet;