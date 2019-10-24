const conn = require('./connection.js');
require('./relations.js');

 function installDataBase(installDefaults=true, installDummyData=false) {
	return conn.sync({force:true}).then(async ()=>{
		//Create default rows
		if (installDefaults) {
			const createDefaults = require('./create_defaults');
			await createDefaults();
		}

		//createDummyData
		if (installDummyData) {
			const createDummyData = require('./dummy_data');
			await createDummyData();
		}

		return true;
	});
}

const forceSync = false;

if (forceSync) installDataBase(true, true);

module.exports = {
	installDataBase
}