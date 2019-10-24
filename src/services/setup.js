const conn = require('./connection.js');
require('./relations.js');

const createDefaults = require('./create_defaults');
const createDummyData = require('./dummy_data');

function installDataBase(installDefaults=true, installDummyData=false) {
	
	
}

module.exports = function (req, res) {
	if (!process.env.SETUP || process.env.SETUP !== 'true') return res.status(404).send('Not Found');
	
	let result = '';

	conn.authenticate()
	.then(async (t)=>{
		result += '<li>Connected to Database</li>';

		await conn.sync({force:true});
		result += '<li>Tables created</li>';
		
		if (req.query.installDefaults) {
			await createDefaults();
			result += '<li>Default data ok</li>';
		}

		//createDummyData
		if (req.query.installDummyData) {
			await createDummyData();
			result += '<li>Dummy data ok</li>';
		}
		
		result += '<li><b>Database ok</b></li>';
		result = `<ul>${result}</ul>`;

		return res.type('html').send(result);
	})
	.catch((err)=>{
		return res.status(404).type('html').send(`${result} <br> <font color='red'>${err}</font>`);
	});
}

const forceSync = false;

if (forceSync) installDataBase(true, true);