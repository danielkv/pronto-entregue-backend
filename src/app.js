require('dotenv').config();
import { ApolloServer }  from 'apollo-server-express';
import cors  from 'cors';
import express  from 'express';
import http  from 'http';

import { createContext }  from './controller/apolloContext';
import routes  from './router';
import schema  from './schema/_index';

import './model/_index'; // setup DB relations

//express config
const app = express();
const port = process.env.PORT || 4000;

//open cors
app.use(cors());

//schema

//Configuração de schema e contexto
const server = new ApolloServer({
	schema,
	context: createContext()
});

// configure router
app.use(routes);

//configura apollo server
server.applyMiddleware({ app, path:'/graphql' });

//configura subscriptions handlers
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

//ouve porta
httpServer.listen({ port }, () => {
	console.log(`Server ready at port ${port}${server.graphqlPath}`)
	console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)
});