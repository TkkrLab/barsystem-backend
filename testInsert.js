const Database = require('./lib/db.js');

var database = new Database({
	host: '127.0.0.1',
	user: 'datastore',
	password: 'uSMtZ9Cy3gNaYF2W',
	database: 'barsystem'
});

function test() {
	var table = database.table('barsystem_person');

	var record = table.createRecord();
	record.setField('nick_name', 'helloworld');
	record.setField('amount', 0);
	record.setField('balance_limit', -13.37);
	record.setField('member', false);
	record.setField('active', true);
	
	//For backwards compatibility
	record.setField('first_name', 'helloworld');
	record.setField('last_name', 'helloworld');
	record.setField('type', 'normal');
	record.setField('allow_remote_access', false);
	record.setField('remote_passphrase', '');
	record.setField('special', false);

	
	record.print();
	
	record.flush();
	console.log("done");
}

setTimeout(test, 1000);
