import PaymentMethods  from '../model/payment_methods';
import Roles  from '../model/roles';
import conn from '../services/connection';
import { importDB } from './helper.js';

import dummyData from '../data/dummy.json';
import paymentMethods from '../data/paymentMethods.json'
import roles from '../data/roles.json';


export function setupDefaultData () {
	return Roles.bulkCreate(roles)
		.then(()=>{
			return PaymentMethods.bulkCreate(paymentMethods)
		})
}

export function setupDataBase (req, res) {
	if (!process.env.SETUP || process.env.SETUP !== 'true') return res.status(404).send('Not Found');
	
	let result = '';

	// check DataBase conenction
	conn.authenticate()
		.then(async ()=>{
			result += '<li>Connected to Database</li>';

			// drop all tables
			await conn.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).then(()=>conn.drop());
			result += '<li>Dropped all tables</li>';

			// recreate all tables
			await conn.sync({ force: true });
			result += '<li>Tables created</li>';
		
			// default data
			await setupDefaultData();
			result += '<li>Default data ok</li>';

			// create Mock Data
			if (req.query.mock) {
				await importDB(dummyData);
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