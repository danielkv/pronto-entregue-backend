import CompanyType from '../model/companyType';
import PaymentMethod  from '../model/paymentMethod';
import Role  from '../model/role';
import conn from '../services/connection';
import { importDB } from './helper';

import companyTypes from '../data/companyTypes.json';
import dummyData from '../data/dummy.json';
import paymentMethods from '../data/paymentMethods.json'
import role from '../data/roles.json';


export async function setupDefaultData () {
	let response = '';

	await Role.bulkCreate(role);
	response += '<li>Roles created</li>';

	await PaymentMethod.bulkCreate(paymentMethods);
	response += '<li>Payment methods created</li>';

	await CompanyType.bulkCreate(companyTypes);
	response += '<li>Company types created</li>';

	return response;
}

export function setupDataBase (req, res) {
	if (!process.env.SETUP || process.env.SETUP !== 'true') return res.status(404).send('Not Found');
	
	let result = '';

	// check DataBase conenction
	conn.authenticate()
		.then(async ()=>{
			result += '<li>Connected to Database</li>';

			// drop all tables
			if (req.query.force) {
				await conn.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).then(()=>conn.drop());
				result += '<li>Dropped all tables</li>';
			}

			// recreate all tables
			await conn.sync({ force: Boolean(req.query.force) });
			result += `<li>Tables created ${req.query.force ? 'forced' : ''}</li>`;
		
			result += '<li>creating default data...</li><ul>';
			// default data
			const addToResponse = await setupDefaultData();
			result += addToResponse;

			result += '</ul>';

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