require('dotenv').config();
const { ApolloServer, PubSub } = require('apollo-server-express');
const http = require('http');
const express = require('express');
const cors = require('cors');
const mid = require('./middlewares');
const routes = require('./router');

//express config
const app = express();
const port = process.env.PORT || 4000;

//open cors
app.use(cors());

//schema
const schema = require('./schema/_index');

//Configuração de schema e contexto
const server = new ApolloServer({
	schema,
	context : async ({req, connection}) => {
		let ctx = {};

		if (connection) {
			console.log(connection.context)
		} else {
			const {authorization, company_id, branch_id} = req.headers;
			let user = null, company = null, branch = null;
			
			if (authorization) user = await mid.authenticate(authorization);
			if (company_id) company = await mid.selectCompany(company_id, user);
			if (branch_id) branch = await mid.selectBranch(company, user, branch_id);
			
			ctx = {
				user,
				company,
				branch,
				host: req.protocol + '://' + req.get('host')
			}
		}

		return ctx;
	},
});

// configure router
app.use(routes);

//configura apollo server
server.applyMiddleware({app, path:'/graphql'});

//configura subscriptions handlers
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

//ouve porta
httpServer.listen({ port }, () => {
	  console.log(`Server ready at port ${port}${server.graphqlPath}`)
	  console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)
});