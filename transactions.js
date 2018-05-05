"use strict";

const precisionRound = require('./lib/precisionRound.js');

class Transactions {
	constructor(opts) {
		this._opts = Object.assign({
			database: null,
			persons: null,
			products: null
		}, opts);
		if (this._opts.database == null) {
			print("The transactions manager can not be started without a database!");
			process.exit(1);
		}
		if (this._opts.persons == null) {
			print("The transactions manager can not be started without a persons manager!");
			process.exit(1);
		}
		if (this._opts.products == null) {
			print("The transactions manager can not be started without a products manager!");
			process.exit(1);
		}
	}
	
	list(params) {
		return new Promise((resolve, reject) => {
			reject("Not implemented");
		});
	}
	
	execute(params) {
		return new Promise((resolve, reject) => {
			reject("Not implemented");
		});
	}
	
	registerRpcMethods(rpc, prefix="transactions/") {
		if (prefix!="") prefix = prefix + "/";
		rpc.addMethod(prefix+"list", this.list.bind(this));
		//rpc.addMethod(prefix+"execute", this.execute.bind(this));
	}
}

module.exports = Transactions;
