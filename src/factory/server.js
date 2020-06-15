import { ApolloServer }  from 'apollo-server-express';
import cors  from 'cors';
import express  from 'express';
import http  from 'http';
import path  from 'path';

import { createContext }  from '../controller/apolloContext';
import routes  from '../router';
import GraphQlSchemaFactory from './schema';

export default new class ServerFactory {
	createServers () {
		this.app = this.createExpressServer(routes);

		this.httpServer = this.createHttpServer(this.app);

		this.apolloServer = this.createApolloServer(this.app, this.httpServer);
	}

	selectPort() {
		return process.env.PORT || 4000;
	}

	createExpressServer(routes) {
		const app = express();

		//open cors
		app.use(cors());

		//pug views
		app.set('view engine', 'pug');
		app.set('views', path.resolve(__dirname, '..', 'templates'));

		// configure router
		app.use(routes);

		console.log(' - Express server created')

		return app;
	}

	createHttpServer (app) {
		const httpServer = http.createServer(app);

		console.log(' - HTTP server created')

		return httpServer;
	}

	createApolloServer(app, httpServer) {
		const apolloServer = new ApolloServer({
			schema: GraphQlSchemaFactory.create(),
			context: createContext
		});

		// configura apollo server
		apolloServer.applyMiddleware({ app, path: '/graphql' });

		// setup subscriptions
		apolloServer.installSubscriptionHandlers(httpServer);

		console.log(' - Apollo server created')

		return apolloServer;
	}

	start() {
		console.log('Start setup Server')
		// select port
		const port = this.selectPort();

		//create all servers
		this.createServers();
		
		// listen port
		this.httpServer.listen({ port }, () => {
			console.log(`Server ready at port http://localhost:${port}${this.apolloServer.graphqlPath}`)
			console.log(`Subscriptions ready at ws://localhost:${port}${this.apolloServer.subscriptionsPath}`)
		});

		console.log(' - Server ready \n')
	}
}