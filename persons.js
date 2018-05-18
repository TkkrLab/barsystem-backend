"use strict";

const precisionRound = require('./lib/precisionRound.js');

class Persons {
	constructor(opts) {
		this._opts = Object.assign({
			database: null
		}, opts);
		if (this._opts.database == null) {
			print("The persons module can not be started without a database!");
			process.exit(1);
		}
	}
	
	list(params) {
		return new Promise((resolve, reject) => {
			var active = 1;
			if ( (params.length > 0) && (params[0]==false) ) active = 0;
			if ( params.length > 1) return reject("invalid parameter count");
			
			var table = this._opts.database.table('barsystem_person');
			return table.selectRecords({"active":active}).then((records) => {
				var result = [];
				for (var i = 0; i<records.length; i++) {
					result.push(records[i].getFields());
				}
				return resolve(result);
			}).catch((error) => { reject(error); });
		});
	}

	find(params) {
		return new Promise((resolve, reject) => {
			if((params.length > 2) || (params.length < 1)) return reject("invalid parameter count");
			var active = 1;
			if ( (params.length > 1) && (params[1]==false) ) active = 0;
						   
			if(typeof params[0] !== "string") return reject("invalid parameter type");
			var table = this._opts.database.table('barsystem_person');
			return table.selectRecords({"nick_name":params[0], "active":active}).then((records) => {
				var result = [];
				for (var i = 0; i<records.length; i++) {
					result.push(records[i].getIndex());
				}
				return resolve(result);
			}).catch((error) => { reject(error); });
		});
	}

	details(params) {
		return new Promise((resolve, reject) => {
			if(params.length != 1) return reject("invalid parameter count");
			var table = this._opts.database.table('barsystem_person');
			return table.selectRecords({"id":parseInt(params[0])}).then((records) => {
				var result = [];
				for (var i = 0; i<records.length; i++) {
					result.push(records[i].getFields());
				}
				return resolve(result);
			}).catch((error) => { reject(error); });
		});
	}
	
	add(params) {
		return new Promise((resolve, reject) => {
			if((params.length > 2) || (params.length < 1)) return reject("invalid parameter count");
			var nick_name = params[0];
			var member = false;
			if ((params.length == 2) && params[1]) member = true;
			if (typeof nick_name != "string") return reject("Param 1 (nick_name) should be string.");
			
			this.find([nick_name]).then((existing_persons) => {
				if (existing_persons.length>0) {
					return reject("The nickname '"+nick_name+"' has already been registered. Please pick another nickname.");
				} else {
					var table = this._opts.database.table('barsystem_person');
					var record = table.createRecord();
					record.setField('nick_name', nick_name);
					record.setField('member', member);
					record.setField('active', true);
					record.setField('amount', 0.00);
					
					/* Backwards compatibility with the old barsystem */
					record.setField('balance_limit', -13.37);
					record.setField('first_name', '');
					record.setField('last_name', '');
					record.setField('type', 'normal');
					record.setField('allow_remote_access', false);
					record.setField('remote_passphrase', '');
					record.setField('special', false);
					
					resolve(record.flush());
				}
			}).catch((error) => { reject(error); });
		});
	}
	
	setAmount(params) {
		return new Promise((resolve, reject) => {
			if(params.length != 2) return reject("invalid parameter count");
			var table = this._opts.database.table('barsystem_person');
			return table.selectRecords({"id":parseInt(params[0])}).then((records) => {
				if (records.length<1) return reject("invalid id");
				if (records.length>1) return reject("BUG! more than one record found for the supplied id");
				records[0].setField('amount', params[1]);
				records[0].flush().then( (result) => {
					if (result.changedRows>0) return resolve(true);
					return resolve(false);
				}).catch((error) => { reject(error); });
			}).catch((error) => { reject(error); });
		});
	}
	
	blame(params) {
		return new Promise((resolve, reject) => {
			if(params.length > 1)  return reject("invalid parameter count");
			var maxSaldo = -50;
			if(params.length == 1) maxSaldo = parseInt(params[0]);
			var table = this._opts.database.table('barsystem_person');
			return table.selectRecords({"amount":{"<":maxSaldo}, "active":"1"}, "ORDER BY `amount` ASC").then((records) => {
				var result = [];
				for (var i = 0; i<records.length; i++) {
					var fields = records[i].getFields();
					var filteredFields = {"id":fields["id"], "amount":fields["amount"], "nick_name":fields["nick_name"]};
					result.push(filteredFields);
				}
				return resolve(result);
			}).catch((error) => { reject(error); });
		});
	}
	
	saldoTotal(params) {
		return new Promise((resolve, reject) => {
			if(params.length > 0)  return reject("invalid parameter count");
			var table = this._opts.database.table('barsystem_person');
			return table.selectRecords({"active":"1"}).then((records) => {
				var result = 0;
				for (var i = 0; i<records.length; i++) {
					result = result + parseFloat(records[i].getField("amount"));
				}
				return resolve(precisionRound(result,2));
			}).catch((error) => { reject(error); });
		});
	}


	registerRpcMethods(rpc, prefix="persons") {
		if (prefix!="") prefix = prefix + "/";
		rpc.addMethod(prefix+"list", this.list.bind(this));
		rpc.addMethod(prefix+"find", this.find.bind(this));
		rpc.addMethod(prefix+"details", this.details.bind(this));
		rpc.addMethod(prefix+"add", this.add.bind(this));
		rpc.addMethod(prefix+"blame", this.blame.bind(this));
		rpc.addMethod(prefix+"saldo/total", this.saldoTotal.bind(this));
		rpc.addMethod(prefix+"saldo/set", this.setAmount.bind(this));
	}
}

module.exports = Persons;
