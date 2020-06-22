import { gql }  from 'apollo-server';

import DeliveryController from '../controller/delivery';
import { orderDeliveryLoader, userLoader } from '../loaders';
import Delivery from '../model/delivery';
import User from '../model/user';

export const typeDefs = gql`
	type Delivery {
		id: ID!
		description: String!
		value: Float!
		status: String!
		user: User
		order: Order
		deliveryMan: User,
		from: Address!
		to: Address!
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

	extend type Order {
		delivery: Delivery
	}

	extend type Mutation {
		createDelivery(data: DeliveryInput!): Delivery!
		updateDelivery(id: ID!, data: DeliveryInput!): Delivery!

		setDeliveryMan(deliveryId: ID!, userId: ID!): Delivery!

		callDeliveryMan(deliveryId: ID!): Delivery!
	}
`;

export const resolvers = {
	Mutation: {
		/* createDelivery(_, { data }) {
			return conn.transaction(async transaction => {
				const createdDelivery = await DeliveryController.create(data, { transaction });

				if (data.orderId) {
					const order = await Order.findByPk(data.orderId);
					if (!order) throw new Error('Pedido não encontrado');

					await OrderController.changeStatus(order, 'waitingDelivery', { transaction });
				}

				return createdDelivery;
			})
		}, */
		/* async updateDelivery(_, { id, data }) {
			const delivery = await Delivery.findByPk(id)
			if (!delivery) throw new Error('Nenhuma entrega encontrada');

			const updatedDelivery = await Delivery.update(data, { fields: ['value', 'description', 'status'] });

			return updatedDelivery;
		}, */
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
			return userLoader.load(userId);
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