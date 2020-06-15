import { ORDER_CREATED } from '../controller/order';
import Company from '../model/company';
import Order from '../model/order';
import User from '../model/user';
import UserMeta from '../model/userMeta';
import * as notifications from '../services/notifications';
import pubSub from '../services/pubsub';
import { QUEUE_NEW_ORDER_NOTIFICATIONS } from "./keys";

export default {
	key: QUEUE_NEW_ORDER_NOTIFICATIONS,
	options: {},
	async handle ({ data: { companyId, orderId } }) {
		// check if order exists
		const order = await Order.findByPk(orderId);
		if (!order) throw new Error("Pedido não encontrado");

		// send pubsub notification
		pubSub.publish(ORDER_CREATED, { orderCreated: order.get() });

		// get company users
		const tokenMetas = await UserMeta.findAll({
			where: { key: 'notification_tokens' },
			include: [
				{
					model: User,
					required: true,
					include: [{
						model: Company,
						where: { id: companyId },
						required: true
					}]
				}
			]
		});
		if (!tokenMetas.length) throw new Error('Nenhum token para enviar notificação');

		// reduce tokens
		const tokens = tokenMetas.reduce((allTokens, meta) =>{
			const tokens = JSON.parse(meta.value);
			
			return [...allTokens, ...tokens];
		}, []);

		//define body and title
		const notificationData = {
			title: 'Novo pedido!',
			body: `Chegou pedido (#${orderId})`,
		}

		// create messages
		const messages = notifications.createMessages(tokens, {
			...notificationData,
			priority: 'high',
			data: {
				redirect: {
					force: true,
					name: 'ProfileRoutes',
					params: {
						screen: 'OrdersRollScreen',
						params: { refetchOrders: true }
					}
				},
				alertData: notificationData
			}
		})

		
		notifications.send(messages);
	}
}