import { UI } from 'bull-board';
import express, { Router }  from 'express';
import path  from 'path';

import { flushAll } from './cache';
import { authenticate } from './controller/authentication';
import { importTable, exportDB } from './controller/helper';
import { setupDataBase } from './controller/setupDB';
import CreditHistory from './model/creditHistory';
import Order from './model/order';
import conn from './services/connection';



const route = Router();

// static routes
route.use('/assets', express.static(path.resolve(__dirname, 'assets'), { extensions: ['png', 'jpg'] }));

// test server
route.get('/networkTest', (req, res)=>{
	res.send(`Connected at ${req.hostname}<br>Host: ${req.headers.host}<br>Secure connection: ${!!req.secure}<br>Protocol: ${req.protocol}`);
});

// porta de instalação
route.get('/setup', setupDataBase);

// porta de instalação
route.get('/sync/:table', async (req, res) => {
	if (!process.env.SETUP) return res.sendStatus(404);
	
	try {
		const { table } = req.params;
		const model = require(`./model/${table}`).default

		console.log(model)
		await model.sync({ alter: true });
	
		res.send(`${table} alterado com sucesso`);
	} catch (err) {
		res.send(err.message)
	}
	
});

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

// bull queue
route.use('/bull/queues', UI);

// reset Redis Cache
route.get('/resetCache/:auth', async (req, res)=>{
	try {
		const authorization = req.params.auth;
		if (!authorization) return res.status(403);

		const user = await authenticate(authorization, false);
		if (user.get('role') !== 'master') return res.status(403);
		
		const result = await flushAll();

		return res.send(result);
	} catch(err) {
		res.send(err.message).status(403);
	}
});

export default route;