import express, { Router }  from 'express';
import path  from 'path';

class RouterFactory {
	constructor() {
		this.router = Router();
		this.addedRoutes = [];
	}

	add(name, callback) {
		if (typeof callback !== 'function') return;

		this.addedRoutes.push([name, callback]);
	}
	
	start() {
		console.log('Setup Routes');
		
		this.createDefaultRoutes();
		this.createSecondaryRoutes();
		
		console.log(' - Routes ready\n');
	}

	createSecondaryRoutes() {
		if (this.addedRoutes.length) {
			this.addedRoutes.forEach(row=>{

				row[1](this.router);

				console.log(` - ${row[0]} routes created`)
			})
		}
	}

	createDefaultRoutes() {
		// static routes
		this.router.use('/assets', express.static(path.resolve(__dirname, 'assets'), { extensions: ['png', 'jpg'] }));

		// test server route
		this.router.get('/networkTest', (req, res)=>{
			res.send(`Connected at ${req.hostname}<br>Host: ${req.headers.host}<br>Secure connection: ${!!req.secure}<br>Protocol: ${req.protocol}`);
		});

		console.log(' - Default routes created');
	}
}

const AppRouter = new RouterFactory();

export default AppRouter;

/* 

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
}); */