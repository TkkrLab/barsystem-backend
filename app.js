"use strict";
const Rpc = require('./lib/rpc.js');
const Webserver = require('./lib/webserver.js');
const Mqttclient = require('./lib/mqtt.js');
const Database = require('./lib/db.js');
const Ping = require('./ping.js');
const Persons = require('./persons.js');
const Products = require('./products.js');
const Transactions = require('./transactions.js');
const Deposit = require('./deposit.js');
const password = require('../password.js');

var database = new Database({
	host: '127.0.0.1',
	user: 'datastore',
	password: password,
	database: 'barsystem'
});

var rpc = new Rpc({
	strict: true
});

var webserver = new Webserver({
	port: 9876,
	host: '127.0.0.1',
	queue: 512,
	application: rpc,
	mime: 'application/json'
});

/*var mqttclient = new Mqttclient({
	port: 1883,
	host: 'tkkrlab.space',
	topic: 'rpc',
	rpc: rpc
});*/

//database.registerRpcMethods(rpc, "db"); // <- Allows for executing raw queries. Do not enable in production!

var ping = new Ping();
ping.registerRpcMethods(rpc, "");

var persons = new Persons({
	database: database
});
persons.registerRpcMethods(rpc, "persons");

var products = new Products({
	database: database
});
products.registerRpcMethods(rpc, "products");

var transactions = new Transactions({
	database: database,
	persons: persons,
	products: products
});
transactions.registerRpcMethods(rpc, "transactions");

var deposit = new Deposit({
	database: database,
	persons: persons,
	transactions: transactions
});
deposit.registerRpcMethods(rpc, "deposit");
