"use strict";

const precisionRound = require('./lib/precisionRound.js');

class Products {
	constructor(opts) {
		this._opts = Object.assign({
			database: null
		}, opts);
		if (this._opts.database == null) {
			print("The products manager can not be started without a database!");
			process.exit(1);
		}
	}
	
	details(params) {
		return new Promise((resolve, reject) => {
			if(params.length != 1) return reject("invalid parameter count");
			var table = this._opts.database.table('barsystem_product');
			return table.selectRecords({"id":parseInt(params[0])}).then((records) => {
				var result = [];
				for (var i = 0; i<records.length; i++) {
					result.push(records[i].getFields());
				}
				return resolve(result);
			}).catch((error) => { reject(error); });
		});
	}
	
	stock(params) {
		return new Promise((resolve, reject) => {
			if(params.length > 1)  return reject("invalid parameter count");
			var where = {'stock':{'>':'0'}, "type":"normal"};
			if ((params.length == 0) || (params[0])) where['active'] = true;
			var table = this._opts.database.table('barsystem_product');
			return table.selectRecords(where, "ORDER BY `stock` DESC").then((records) => {
				var total_worth = 0.00;
				var total_low = 0.00;
				var total_high = 0.00;
				var total_stock = 0;
				var result = [];
				for (var i = 0; i<records.length; i++) {
					var fields = records[i].getFields();
					var worth = fields["purchase_price"] * fields["stock"];
					var low = fields["member_price"] * fields["stock"];
					var high = fields["standard_price"] * fields["stock"];
					total_worth += worth;
					total_low += low;
					total_high += high;
					total_stock += fields["stock"];
					var filteredFields = {
						"id":fields["id"],
						"name":fields["name"],
						"member_price":fields["member_price"],
						"standard_price":fields["standard_price"],
						"stock":fields["stock"],
						"worth":precisionRound(worth,2),
						"worth_expected_low": precisionRound(low,2),
						"worth_expected_high": precisionRound(high,2)
					};
					result.push(filteredFields);
				}
				return resolve({
					"products":result,
					"stock":total_stock,
					"worth":precisionRound(total_worth,2),
					"worth_expected_low":precisionRound(total_low,2),
					"worth_expected_high":precisionRound(total_high,2)});
			}).catch((error) => { reject(error); });
		});
	}

	list(params) {
		return new Promise((resolve, reject) => {
			var active = 1;
			if ( (params.length > 0) && (params[0]==false) ) active = 0;
			
			var table = this._opts.database.table('barsystem_base_product');
			return table.selectRecords({"type":"normal", "active":active}).then((records) => {
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
			
			var query = {"active":active, "type":"normal"};
			   
			var barcode = parseInt(params[0]);
			if ((String(barcode) === params[0]) && (barcode >= 1000000000000)) {
				//It's a barcode...
				query["barcode"] = barcode;
			} else {
				//Not a barcode...
				query["name"] = params[0];
			}
						   
			if(typeof params[0] !== "string") return reject("invalid parameter type");
			var table = this._opts.database.table('barsystem_base_product');
			return table.selectRecords(query).then((records) => {
				var result = [];
				for (var i = 0; i<records.length; i++) {
					result.push(records[i].getIndex());
				}
				return resolve(result);
			}).catch((error) => { reject(error); });
		});
	}
	
	registerRpcMethods(rpc, prefix="products") {
		if (prefix!="") prefix = prefix + "/";
		rpc.addMethod(prefix+"list", this.list.bind(this));
		rpc.addMethod(prefix+"find", this.find.bind(this));
		rpc.addMethod(prefix+"stock", this.stock.bind(this));
		rpc.addMethod(prefix+"details", this.details.bind(this));
	}
}

module.exports = Products;
