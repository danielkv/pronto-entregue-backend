import express, { Router }  from 'express';
import path  from 'path';

import { flushAll } from './cache';
import { authenticate } from './controller/authentication';
import { setupDataBase } from './controller/setupDB';
import redis from './services/redis'

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
route.get('/sync/:table/:auth', async (req, res) => {
	try {
		const authorization = req.params.auth;
		if (!authorization) return res.sendStatus(403);

		const user = await authenticate(authorization, false);
		if (user.get('role') !== 'master') return res.sendStatus(403);
	
		const { table } = req.params;
		const model = require(`./model/${table}`).default

		await model.sync({ alter: true });
	
		res.send(`${table} alterado com sucesso`);
	} catch (err) {
		res.send(err.message)
	}
});

// bull queue
//route.use('/bull/queues', UI);

route.use('/testKey', (req, res)=>{
	redis.get('testKey')
		.then((result)=>{
			res.send(result);
		})
});

// reset Redis Cache
route.get('/resetCache/:auth', async (req, res)=>{
	try {
		const authorization = req.params.auth;
		if (!authorization) return res.sendStatus(403);

		const user = await authenticate(authorization, false);
		if (user.get('role') !== 'master') return res.sendStatus(403);
		
		const result = await flushAll();

		return res.send(result);
	} catch(err) {
		res.send(err.message).sendStatus(403);
	}
});

export default route;