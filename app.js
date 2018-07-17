"use strict";

//Libraries
const Rpc        = require('./lib/rpc.js');
const Webserver  = require('./lib/webserver.js');
const Mqttclient = require('./lib/mqtt.js');
const Database   = require('./lib/db.js');
const password   = require('../password.js');

//Modules
const Ping     = require('./modules/ping.js');
const Persons  = require('./modules/persons.js');
const Products = require('./modules/products.js');
const Journal  = require('./modules/journal.js');
const Deposit  = require('./modules/deposit.js');

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

var mqttclient = new Mqttclient({
	port: 1883,
	host: 'tkkrlab.space',
	topic: 'test/bar',
	rpc: rpc
});

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

var journal = new Journal({
	database: database
});
journal.registerRpcMethods(rpc, "journal");

/*var deposit = new Deposit({
	database: database,
	persons: persons,
	transactions: transactions
});
deposit.registerRpcMethods(rpc, "deposit");*/
