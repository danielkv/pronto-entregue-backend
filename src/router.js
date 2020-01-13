import { Router }  from 'express';

import exportDB  from './services/export';
import importTable  from './services/import_table';
import installDataBase  from './services/setup'; //Configura banco de dados e relações das tabelas

const route = Router();

// networt test
route.get('/networkTest', (req, res)=>{
	res.send(`Connected at ${req.hostname}<br>Host: ${req.headers.host}<br>Secure connection: ${!!req.secure}<br>Protocol: ${req.protocol}`);
});

// configura rota estática
// route.use('/uploads', static(path.resolve(__dirname, '..', 'uploads')));

// porta de instalação
route.get('/setup', installDataBase);

// export database
route.get('/export', (req, res) => {
	if (!process.env.SETUP) return res.sendStatus(404);

	exportDB()
		.then((data)=>{
			res.json(data)
		});
	
})

route.get('/import/:table', (req, res) => {
	if (!process.env.SETUP) return res.sendStatus(404);

	const table = req.params.table;
	const data = require('../items.json');

	importTable(table, data)
		.then((data)=>{
			res.json(data)
		});
	
})

export default route;