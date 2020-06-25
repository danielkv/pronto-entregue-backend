import { gql }  from 'apollo-server';

import DeliveryController from '../controller/delivery';
import DeliveryManController from '../controller/deliveryMan';
import { orderDeliveryLoader, userLoader } from '../loaders';
import Delivery from '../model/delivery';
import User from '../model/user';
import pubSub from '../services/pubsub';
import { sanitizeFilter } from '../utilities';
import { splitAddress } from '../utilities/address';
import { DELIVERY_UPDATED, DELIVERY_CREATED } from '../utilities/delivery';

export const typeDefs = gql`
	type Delivery {
		id: ID!
		description: String!
		value: Float!
		status: String!
		user: User
		order: Order
		deliveryMan: DeliveryMan
		from: Address!
		to: Address!
		receiverName: String!
		receiverContact: String!
		senderContact: String!
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
	}

	extend type Order {
		delivery: Delivery
	}

	extend type Query {
		deliveries(filter: JSON): [Delivery]! @hasRole(permission: "deliveryMan")
		delivery(id: ID!): Delivery! @hasRole(permission: "deliveryMan")

		deliveryMan(userId: ID!): DeliveryMan!
	}

	extend type Mutation {
		createDelivery(data: DeliveryInput!): Delivery!
		changeDeliveryStatus(deliveryId: ID!, newStatus: String!): Delivery!

		enableDeliveryMan(userId: ID!): DeliveryMan!
		disableDeliveryMan(userId: ID!): DeliveryMan!

		setDeliveryMan(deliveryId: ID!, userId: ID!): Delivery!

		callDeliveryMan(deliveryId: ID!): Delivery!
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
		deliveries(_, { filter }) {
			const where = sanitizeFilter(filter, { excludeFilters: ['active'] });

			return Delivery.findAll({ where, order: [['createdAt', 'DESC']] })
		},
		deliveryMan(_, { userId }) {
			return userLoader.load(userId);
		}
	},
	Mutation: {
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
		isEnabled(parent) {
			return DeliveryManController.isEnabled(parent);
		}
	},
	Order: {
		delivery (parent) {
			if (parent.type !== 'peDelivery') return;
			
			const orderId = parent.id;
			return orderDeliveryLoader.load(orderId);
		}
	}
}