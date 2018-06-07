"use strict";

const mysql = require('mysql2');
const precisionRound = require('./lib/precisionRound.js');

class Journal {
	constructor(opts) {
		this._opts = Object.assign({
			database: null,
			table: 'barsystem_journal'
		}, opts);
		if (this._opts.database == null) {
			console.log("The journal manager can not be started without a database!");
			process.exit(1);
		}
	}
	
	list(params) {
		return new Promise((resolve, reject) => {
			var query = {};
			var amount = 5;
			
			if  ((params.length > 0)&&(parseInt(params[0])>0)) query["sender_id"] = parseInt(params[0]);
			if  ((params.length > 1)&&(parseInt(params[1])>0)) query["recipient_id"] = parseInt(params[1]);
			if  ((params.length > 2)&&(parseInt(params[2])>0)) amount = parseInt(params[2]);			   
			
			var table = this._opts.database.table(this._opts.table);
			return table.selectRecords(query, "ORDER BY `moment` DESC LIMIT "+mysql.escape(amount)).then((records) => {
				var result = [];
				for (var i = 0; i<records.length; i++) {
					result.push(records[i].getFields());
				}
				return resolve(result);
			}).catch((error) => { reject(error); });
		});
	}
	

    _twoDigits(d) {
		if(0 <= d && d < 10) return "0" + d.toString();
		if(-10 < d && d < 0) return "-0" + (-1*d).toString();
		return d.toString();
	};
 
    _toMysqlDatetime(t) {
		return t.getUTCFullYear() + "-" + this._twoDigits(1 + t.getUTCMonth()) + "-" + this._twoDigits(t.getUTCDate()) + " " + this._twoDigits(t.getHours()) + ":" + this._twoDigits(t.getUTCMinutes()) + ":" + this._twoDigits(t.getUTCSeconds());
	};
	
	add(params) {
		return new Promise((resolve, reject) => {
			if ((params.length < 3) || (params.length > 5)) return reject("invalid parameter count");
			var source = parseInt(params[0]);
			if (source<1) source = null;
			var target = parseInt(params[1]);
			if (target<1) target = null;
			var amount = parseFloat(params[2]);
			var product_count = 1.00;
			var product = null;
			if (params.length>3) product = parseInt(params[3]);
			if (params.length>4) product_count = parseFloat(params[4]);
			//var comment = "";
			//if (params.length==5) comment = params[5];
			
			var now = new Date();
			
			var table = this._opts.database.table(this._opts.table);
			var record = table.createRecord();
			record.setField('moment', this._toMysqlDatetime(now));
			record.setField('items', product_count);
			record.setField('amount', amount);
			record.setField('sender_id', source);
			record.setField('product_id', product);
			record.setField('recipient_id', target);
			//record.setField('comment', comment);
			record.print();
			resolve(record.flush());

		});
	}
	
	placeholder(params) {
		return new Promise((resolve, reject) => {
			reject("Not implemented");
		});
	}
	
	registerRpcMethods(rpc, prefix="journal/") {
		if (prefix!="") prefix = prefix + "/";
		rpc.addMethod(prefix+"list", this.list.bind(this));
		rpc.addMethod(prefix+"add", this.add.bind(this));
	}
}

module.exports = Journal;
