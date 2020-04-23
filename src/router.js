import express, { Router }  from 'express';
import path  from 'path';

import { authenticate } from './controller/authentication';
import { importTable, exportDB } from './controller/helper';
import { setupDataBase } from './controller/setupDB';
import { transporter } from './services/mailer';
import redis from './services/redis';

const route = Router();


// static routes
route.use('/assets', express.static(path.resolve(__dirname, 'assets'), { extensions: ['png', 'jpg'] }));

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
route.get('/resetCache/:auth', async (req, res)=>{
	try {
		const authorization = req.params.auth;
		if (!authorization) return res.status(403);

		const user = await authenticate(authorization, false);
		if (user.get('role') !== 'master') return res.status(403);
		
		const result = await redis.flushall();

		return res.send(result);
	} catch(err) {
		res.send(err.message).status(403);
	}
});

route.get('/testEmail', async (req, res)=>{
	if (!process.env.SETUP) return res.sendStatus(404);

	try {
		const response = await transporter.sendMail({
			to: 'daniel_kv@hotmail.com',
			html: '<p><b>Teste HTML</b></p><p><a href="https://prontoentregue.com.br">Click</a></p>',
			subject: 'Email de teste MailJet'
		})
		return res.json(response)
	} catch (err) {
		return res.json(err.message)
	}
	
	
});

export default route;