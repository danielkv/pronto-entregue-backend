const conn = require('./connection.js');
require('./relations.js');

const createDefaults = require('./create_defaults');
const createDummyData = require('./dummy_data');

function installDataBase(installDefaults=true, installDummyData=false) {
	
	
}

module.exports = function (req, res) {
	if (!process.env.SETUP || process.env.SETUP !== 'true') return res.status(404).send('Not Found');
	
	let result = '';
	let host = req.headers.host;

	conn.authenticate()
	.then(async (t)=>{
		result += '<li>Connected to Database</li>';

		await conn.query('SET FOREIGN_KEY_CHECKS = 0', {raw: true}).then(()=>conn.drop());
		result += '<li>Dropped all tables</li>';

		await conn.sync({force:true});
		result += '<li>Tables created</li>';
		
		if (req.query.installDefaults) {
			await createDefaults({ host });
			result += '<li>Default data ok</li>';
		}

		//createDummyData
		if (req.query.installDummyData) {
			await createDummyData({ host });
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