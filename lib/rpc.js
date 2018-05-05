/*
 * Function: JSON RPC handler
 * Author: Renze Nicolai 2018
 * License: GPLv3
 */

"use strict";

class Rpc {
	constructor( opts ) {
		this._opts = Object.assign({
			strict: true
		}, opts);
		
		this._functions = {};
	}
	
	addMethod(name, func) {
		if (name && typeof func === 'function') {
			this._functions[name] = func;
			console.log("[RPC] Registered method '"+name+"'");
			return true;
		}
		console.log("[RPC] Can not register method '"+name+"'");
		return false;
	}
	
	delMethod(name) {
		if (this._functions[name]) {
			this._functions[name] = null;
			return true;
		}
		return false;
	}
	
	_handleRequest(request) {		
		return new Promise((resolve, reject) => {
			var response = {};

			if (request.id) response.id = request.id;
			
			if (this._opts.strict) {
				if (!request.id) response.id = null;
				response.jsonrpc = "2.0";
				
				if ((request.jsonrpc !== "2.0") || (!request.id)) {
					response.error = { code: -32600, message: "Invalid Request" };
					console.log("_handleRequest: reject strict!",request,"response:",response);
					return reject(response);
				}
			}
			
			if (typeof request.params === 'undefined') request.params = [];
			
			if (typeof request.method === 'string') {
				if (typeof this._functions[request.method] === 'function') {
					var numArgs = this._functions[request.method].length;
					if (numArgs==2) {
						this._functions[request.method](request.params, (err,res) => {
							if (err) {
								response.error = err;
							}
							if (res) {
								response.result = res;
								return resolve(response);
							}
							return reject(response);
						});
					} else if (numArgs==1) {
						this._functions[request.method](request.params).then( (res) => {
							response.result = res;
							return resolve(response);
						}).catch( (err) => {
							response.error = err;
							return reject(response);
						});
					} else {
						console.log("Error: method '"+request.method+"' has an invalid argument count!");
						throw "Method has invalid argument count";
					}
				} else {
					response.error = { code: -32601, message: "Method not found" };
					return reject(response);
				}
			} else {
				response.error = { code: -32600, message: "Invalid Request" };
				return reject(response);
			}
		});
	}
	
	handle(data) {
		return new Promise((resolve, reject) => {
			var requests = null;

			try {
				requests = JSON.parse(data);
			} catch (err) {
				return reject(JSON.stringify({ code: -32700, message: "Parse error" }));
			}
			
			if (!Array.isArray(requests)) {
				requests = [requests];
			}
			
			if (requests.length < 1) {
				return reject(JSON.stringify({ code: -32600, message: "Invalid Request" }));
			}

			if (requests.length > 1) {
				//A batch of requests
				var promises = [];
				
				var results = [];
				var failed = false;
				
				for (var index = 0; index<requests.length; index++) {
					promises.push(this._handleRequest(requests[index]).then( (result) => {
						results.push(result);
					}).catch( (error) => {
						results.push(error);
						failed = true;
					}));
				}
				
				Promise.all(promises).then( (unused) => {
					if (failed) {
						return reject(JSON.stringify(results));
					} else {
						return resolve(JSON.stringify(results));
					}
				});
			} else {
				//A single request
				this._handleRequest(requests[0]).then( (result) => {
					console.log('handle: resolve! ',result);
					return resolve(JSON.stringify(result));
				}).catch( (error) => {
					console.log('handle: return reject! ',error);
					return reject(JSON.stringify(error));
				});
			}
		});
	}
}

module.exports = Rpc;
