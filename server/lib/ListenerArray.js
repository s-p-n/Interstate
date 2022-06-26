class ListenerArray {
	constructor (target) {
		this.target = target;
		this.args = [];
		this.listeners = [];
	}

	async call (index, ...args) {
		return await this.listeners[index].call(this.target, ...args);
	}

	async apply (index, args) {
		return await this.listeners[index].apply(this.target, args);
	}

	async callAll(...args) {

	}

	async applyAll(...args) {
		//this.args = args;
		const result = [];
		
		this.listeners.forEach(async f => {
			result.push(f.apply(this.target, ...args))
		});

		return result;
	}

	push (callback) {
		return this.listeners.push(callback);
	}

	detatch (callback) {
		const i = this.listeners.indexOf(callback);
		
		if (i === -1) {
			console.log(this.listeners);
			console.log(callback);
			throw new Error("ListenerArray: Trying to detatch listener that doesn't exist");
			return false;
		}

		//console.log("Detatching listener", this.listeners.length);
		this.listeners.splice(i, 1);
		//console.log("Detatched listener", this.listeners.length);
		return true;
	}

	/* Unsafe, because indexes change
	detatchIndex(index) {
		console.log("Detatching listener (length)", this.listeners.length);
		this.listeners.splice(index, 1);
		console.log("Detatched a listener (new length)", this.listeners.length);
		return true;
	}
	*/

	[Symbol.asyncIterator] () {
		const self = this;
		let i = 0;
		return {
			async next () {
				const done = i >= self.listeners.length;
				console.log(i, done, self.listeners.length);
				
				if (done) {
					i = 0;
					return {done};
				}

				i += 1;

				return Promise.resolve({
					value: self.apply(i - 1, self.args),
					done
				});
			},

			return () {
				return { done: true };
			}
		};
	}
}

module.exports = ListenerArray;