import conn from './connection.js';
import './relations.js';
import createDefaults  from './create_defaults';
import createDummyData  from './dummy_data';

export default function (req, res) {
	if (!process.env.SETUP || process.env.SETUP !== 'true') return res.status(404).send('Not Found');
	
	let result = '';
	let host = `${req.protocol}://${req.headers.host}`;

	conn.authenticate()
		.then(async ()=>{
			result += '<li>Connected to Database</li>';

			await conn.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).then(()=>conn.drop());
			result += '<li>Dropped all tables</li>';

			await conn.sync({ force: true });
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