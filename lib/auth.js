/*
 * Function: Authentication module
 * Author: Renze Nicolai 2018
 * License: GPLv3
 */

"use strict";

class Auth {
	constructor( database, rpc, opts ) {
		this._opts = Object.assign({
			usersTable: "authentication"
		}, opts);
		
		this._usersTable = database.table(this._opts.usersTable);
		
		this._sessions = {};
		this._users = {};
	}
	
	addPermission(userId, methodName) {
		return false;
	}
	
	createSession() {
		var token = "not implemented";
		return token;
	}
	
	deleteSession(token) {
		return false;
	}
}

module.exports = Rpc;
