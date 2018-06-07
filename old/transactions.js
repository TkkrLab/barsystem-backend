"use strict";

const precisionRound = require('./lib/precisionRound.js');

class Transactions {
	constructor(opts) {
		this._opts = Object.assign({
			database: null,
			table: 'transactions'
		}, opts);
		if (this._opts.database == null) {
			console.log("The transactions manager can not be started without a database!");
			process.exit(1);
		}
	}
	
	list(params) {
		return new Promise((resolve, reject) => {
			var query = {};
			
			//if  ((params.length > 0)&&(params[0]>0)) query["sender_id"] = parseInt(params[0]);
			//if  ((params.length > 1)&&(params[1]>0)) query["recipient_id"] = parseInt(params[1]);
			
			var table = this._opts.database.table(this._opts.table);
			return table.selectRecords(query).then((records) => {
				var result = [];
				for (var i = 0; i<records.length; i++) {
					result.push(records[i].getFields());
				}
				return resolve(result);
			}).catch((error) => { reject(error); });
		});
	}
	
	execute(params) {
		return new Promise((resolve, reject) => {
			if ((params.length < 2) || (params.length > 3)) return reject("invalid parameter count");
			var input = params[0];
			var output = params[1];
			var products = {};
			if (params.length==3) products = params[2];
			//var nick_name = params[0];
			//var member = false;
			//if ((params.length == 2) && params[1]) member = true;
			//if (typeof nick_name != "string") return reject("Param 1 (nick_name) should be string.");
			
			var now = new Date();
			
			var table = this._opts.database.table(this._opts.table);
			var record = table.createRecord();
			record.setField('input', input);
			record.setField('output', output);
			record.setField('products', products);
			record.setField(timestamp, now.getTime());
			record.setField('client', 'unknown');
			resolve(record.flush());

		});
	}
	
	placeholder(params) {
		return new Promise((resolve, reject) => {
			reject("Not implemented");
		});
	}
	
	registerRpcMethods(rpc, prefix="transactions/") {
		if (prefix!="") prefix = prefix + "/";
		rpc.addMethod(prefix+"list", this.list.bind(this));
		rpc.addMethod(prefix+"execute", this.execute.bind(this));
	}
}

module.exports = Transactions;
