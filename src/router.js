import { Router }  from 'express';

import { importTable, exportDB } from './controller/helper';
import { setupDataBase } from './controller/setupDB';

const route = Router();

// test server
route.get('/networkTest', (req, res)=>{
	res.send(`Connected at ${req.hostname}<br>Host: ${req.headers.host}<br>Secure connection: ${!!req.secure}<br>Protocol: ${req.protocol}`);
});

// porta de instalação
route.get('/setup', setupDataBase);

// export database
route.get('/export', (req, res) => {
	if (!process.env.SETUP) return res.sendStatus(404);

	exportDB()
		.then((data)=>{
			res.json(data)
		});
	
})

// import only one table
route.get('/import/: able', (req, res) => {
	if (!process.env.SETUP) return res.sendStatus(404);

	const table = req.params.table;
	const data = require('../other.json');

	importTable(table, data)
		.then((data)=>{
			res.json(data)
		});
})

export default route;