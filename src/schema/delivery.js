import { gql }  from 'apollo-server';

import DeliveryController from '../controller/delivery';
import OrderController from '../controller/order';
import Delivery from '../model/delivery';
import Order from '../model/order';
import conn from '../services/connection';

export const typeDefs = gql`
	type Delivery {
		id: ID!
		description: Float!
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
		from: Address
		to: Address
	}

	extend type Mutation {
		createDelivery(data: DeliveryInput!): Delivery!
		updateDelivery(id: ID!, data: DeliveryInput!): Delivery!

		setDeliveryMan(deliveryId: ID!, userId: ID!): User!

		callDeliveryMan(deliveryId: ID!): Delivery!
	}
`;

export const resolvers = {
	Mutation: {
		createDelivery(_, { data }) {
			return conn.transaction(async transaction => {
				const createdDelivery = await DeliveryController.create(data, { transaction });

				if (data.orderId) {
					const order = await Order.findByPk(data.orderId);
					if (!order) throw new Error('Pedido não encontrado');

					await OrderController.changeStatus(order, 'waitingDelivery', { transaction });
				}

				return createdDelivery;
			})
		},
		async updateDelivery(_, { id, data }) {
			const delivery = await Delivery.findByPk(id)
			if (!delivery) throw new Error('Nenhuma entrega encontrada');

			const updatedDelivery = await Delivery.update(data, { fields: ['value', 'description', 'status'] });

			return updatedDelivery;
		},
		async setDeliveryMan(_, { deliveryId, userId }) {
			const delivery = await Delivery.findByPk(deliveryId);
			if (!delivery) throw new Error('Nenhuma entrega encontrada');

			const deliveryMan = await DeliveryController.setDeliveryMan(delivery, userId);

			return deliveryMan;
		},
		async callDeliveryMan(_, { deliveryId }) {
			const delivery = await Delivery.findByPk(deliveryId);
			if (!delivery) throw new Error('Entrega não encontrada');

			DeliveryController.changeStatus(delivery, 'waitingDelivery', options, { loggedUser })
		}
	}
}