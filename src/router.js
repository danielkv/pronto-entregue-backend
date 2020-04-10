import express, { Router }  from 'express';
import path  from 'path';

import { importTable, exportDB } from './controller/helper';
import { setupDataBase } from './controller/setupDB';

const route = Router();



// static routes
route.use(express.static(path.resolve(__dirname, 'assets'), { extensions: ['png'] }));

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
route.get('/import/:table', (req, res) => {
	if (!process.env.SETUP) return res.sendStatus(404);

	const table = req.params.table;
	const data = require('../other.json');

	importTable(table, data)
		.then((data)=>{
			res.json(data)
		});
})


// render pug test
// static routes
route.get('/testPug', (req, res)=>{
	res.render('index');
});

export default route;