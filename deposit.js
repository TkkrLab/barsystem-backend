"use strict";

const precisionRound = require('./lib/precisionRound.js');

class Deposit {
	constructor(opts) {
		this._opts = Object.assign({
			database: null,
			persons: null,
			transactions: null
		}, opts);
		if (this._opts.database == null) {
			print("The deposit manager can not be started without a database!");
			process.exit(1);
		}
		if (this._opts.persons == null) {
			print("The deposit manager can not be started without a persons manager!");
			process.exit(1);
		}
		if (this._opts.transactions == null) {
			print("The deposit manager can not be started without a transactions manager!");
			process.exit(1);
		}
	}
	
	methods(params) {
		return new Promise((resolve, reject) => {
			reject("Not implemented");
		});
	}
	
	execute(params) {
		return new Promise((resolve, reject) => {
			reject("Not implemented");
		});
	}
	
	registerRpcMethods(rpc, prefix="deposit") {
		rpc.addMethod(prefix, this.execute.bind(this));
		if (prefix!="") prefix = prefix + "/";
		rpc.addMethod(prefix+"methods", this.methods.bind(this));
	}
}

module.exports = Deposit;
