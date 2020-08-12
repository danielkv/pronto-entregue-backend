import { gql }  from 'apollo-server';

import DeliveryController from '../controller/delivery';
import DeliveryManController from '../controller/deliveryMan';
import ConfigEntity from '../entities/Config';
import { orderDeliveryLoader, userLoader } from '../loaders';
import deliveryOrderLoader from '../loaders/deliveryOrderLoader';
import DB from '../model';
import Delivery from '../model/delivery';
import User from '../model/user';
import pubSub from '../services/pubsub';
import { sanitizeFilter } from '../utilities';
import { splitAddress } from '../utilities/address';
import { DELIVERY_GLOBAL_ACTIVE } from '../utilities/config';
import { DELIVERY_UPDATED, DELIVERY_CREATED } from '../utilities/delivery';

const configEntity = new ConfigEntity();

export const typeDefs = gql`
	type Delivery {
		id: ID!
		description: String!
		value: Float!
		status: String!
		deliveryMan: DeliveryMan
		from: Address!
		to: Address!
		receiverName: String!
		receiverContact: String!
		senderContact: String!
		createdAt: DateTime!

		user: User
		order: Order
	}

	input DeliveryInput {
		description: Float
		value: Float
		status: String
		userId: ID
		orderId: ID
		from: AddressInput
		to: AddressInput
	}

	type DeliveryMan {
		id: ID
		user: User
		canAcceptDelivery: Boolean!
		isEnabled: Boolean!
		openDeliveries: [Delivery]!
	}

	extend type Order {
		delivery: Delivery
	}

	extend type User {
		deliveries(filter: JSON): [Delivery]!
	}

	extend type Query {
		sumDeliveries(filter: JSON): Int! @hasRole(permission: "deliveryMan")
		countDeliveries(filter: JSON): Int! @hasRole(permission: "deliveryMan")
		deliveries(filter: JSON, pagination: Pagination): [Delivery]! @hasRole(permission: "deliveryMan")
		
		delivery(id: ID!): Delivery! @hasRole(permission: "deliveryMan")

		countDeliveryMen: Int!
		deliveryMen(pagination: Pagination): [DeliveryMan]!
		deliveryMan(userId: ID!): DeliveryMan!

		deliveryGlobalActive: Boolean!
	}

	extend type Mutation {
		createDelivery(data: DeliveryInput!): Delivery!
		changeDeliveryStatus(deliveryId: ID!, newStatus: String!): Delivery!

		enableDeliveryMan(userId: ID!): DeliveryMan!
		disableDeliveryMan(userId: ID!): DeliveryMan!

		setDeliveryMan(deliveryId: ID!, userId: ID!): Delivery!
		removeDeliveryMan(deliveryId: ID!): Delivery!

		callDeliveryMan(deliveryId: ID!): Delivery!

		updateDeliveryManStatus(userId: ID!, newStatus: Boolean!): DeliveryMan!
	}

	extend type Subscription {
		delivery: Delivery!
	}
`;

export const resolvers = {
	Subscription: {
		delivery: {
			subscribe: ()=>pubSub.asyncIterator([DELIVERY_UPDATED, DELIVERY_CREATED])
		}
	},
	Query: {
		deliveryGlobalActive() {
			return configEntity.get(DELIVERY_GLOBAL_ACTIVE);
		},
		countDeliveries(_, { filter }) {
			const where = sanitizeFilter(filter, { excludeFilters: ['active'] });

			return DeliveryController.getDeliveries(where).then(res=>res.length);
		},
		sumDeliveries(_, { filter }) {
			const where = sanitizeFilter(filter, { excludeFilters: ['active'] });

			return DeliveryController.getDeliveries(where).then(res=>res.reduce((total, delivery)=>{
				return total + Number(delivery.get('value'));
			}, 0));
		},
		deliveries(_, { filter, pagination }) {
			const where = sanitizeFilter(filter, { excludeFilters: ['active'] });

			return DeliveryController.getDeliveries(where, pagination);
		},
		deliveryMan(_, { userId }) {
			return userLoader.load(userId);
		},
		deliveryMen(_, { pagination }) {
			return DeliveryManController.listDeliveryMen(pagination);
		},
		async countDeliveryMen() {
			const deliveryMen = await DeliveryManController.listDeliveryMen();

			return deliveryMen.length;
		},
	},
	Mutation: {
		async updateDeliveryManStatus(_, { userId, newStatus }) {
			const user = await DB.user.findByPk(userId);
			if (newStatus) {
				return await DeliveryManController.enable(user);
			} else {
				return await DeliveryManController.disable(user);
			}
		},
		async enableDeliveryMan(_, { userId }) {
			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			return DeliveryManController.enable(user);
		},
		async disableDeliveryMan(_, { userId }) {
			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			return DeliveryManController.disable(user);
		},
		async changeDeliveryStatus(_, { deliveryId, newStatus }, ctx) {
			// checks if delivery exists
			const delivery = await Delivery.findByPk(deliveryId);
			if (!delivery) throw new Error('Entrega não encontrada')
			
			// update status
			const updatedDelivery = await DeliveryController.changeStatus(delivery, newStatus, ctx);

			return updatedDelivery;
		},
		async setDeliveryMan(_, { deliveryId, userId }) {
			// check if delivery exists
			const delivery = await Delivery.findByPk(deliveryId);
			if (!delivery) throw new Error('Nenhuma entrega encontrada');

			// check if user exists
			const user = await User.cache().findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			// check if user is delivery man
			//if (DeliveryManController.userIsDeliveryMan(user)) throw new Error('Esse usuário não é um entregador')

			// set user to delivery
			const updatedDelivery = await DeliveryController.setDeliveryMan(delivery, user);

			return updatedDelivery;
		},
		async removeDeliveryMan(_, { deliveryId }) {
			// check if delivery exists
			const delivery = await Delivery.findByPk(deliveryId);
			if (!delivery) throw new Error('Nenhuma entrega encontrada');

			// set user to delivery
			const updatedDelivery = await DeliveryController.removeDeliveryMan(delivery);

			return updatedDelivery;
		},
		async callDeliveryMan(_, { deliveryId }, { user: loggedUser }) {
			const delivery = await Delivery.findByPk(deliveryId);
			if (!delivery) throw new Error('Entrega não encontrada');

			DeliveryController.changeStatus(delivery, 'waitingDelivery', {}, { loggedUser })
		}
	},
	Delivery: {
		deliveryMan(parent) {
			const userId = parent.get('deliveryManId');
			if (!userId) return;

			return userLoader.load(userId);
		},
		to(parent) {
			return splitAddress(parent, 'deliveryTo', 'To')
		},
		from(parent) {
			return splitAddress(parent, 'deliveryFrom', 'From')
		},
		order(parent) {
			const orderId = parent.get('orderId');
			if (!orderId) return;
			
			return deliveryOrderLoader.load(orderId);
		}
	},
	DeliveryMan: {
		id(parent) {
			if (!parent) return;
			return `_user_${parent.get('id')}`
		},
		user(parent) {
			return parent;
		},
		
		canAcceptDelivery (parent) {
			return DeliveryManController.canAcceptDelivery(parent);
		},
		async openDeliveries (parent) {
			const userId = parent.get('id');
			const del = await DeliveryManController.getOpenDeliveries(userId);
			return del
		},
		isEnabled(parent) {
			const userId = parent.get('id');
			if (!userId) return false;

			return DeliveryManController.isEnabled(userId);
		}
	},
	Order: {
		delivery (parent) {
			if (parent.type !== 'peDelivery') return;
			
			const orderId = parent.id;
			return orderDeliveryLoader.load(orderId);
		}
	},
	User: {
		deliveries(parent, { filter }) {
			const userId = parent.get('id');
			
			if (filter) {
				const where = sanitizeFilter({ deliveryManId: userId, ...filter }, { excludeFilters: ['active'] })
				return DeliveryController.getDeliveries(where);
			}

			return DeliveryController.loader.load(userId);
		}
	}
}