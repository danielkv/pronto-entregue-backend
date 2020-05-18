import UserMeta from '../model/userMeta';
import * as notifications from '../services/notifications';
import { ORDER_STATUS_CHANGE_NOTIFICATION } from "./keys";

export default {
	key: ORDER_STATUS_CHANGE_NOTIFICATION,
	options: {},
	async handle ({ data: { userId, orderId, newOrderStatus } }) {
		const notificationData = orderCustomerNotificationData(orderId, newOrderStatus)
		if (!notificationData) throw new Error('Não há mensagem')

		// get user meta
		const pushTokenMeta = await UserMeta.findOne({
			where: { userId, key: 'notification_tokens' }
		})
		if (!pushTokenMeta) return;
		const tokens = JSON.parse(pushTokenMeta.value);

		const messages = notifications.createMessages(tokens, {
			...notificationData,
			priority: 'high',
			data: {
				redirect: {
					name: 'OrderRoutes',
					params: {
						screen: 'OrderScreen',
						params: { orderId }
					}
				},
				alertData: notificationData
			}
		})

		notifications.send(messages);

		return false;
	}
}

function orderCustomerNotificationData(orderId, newStatus) {
	const finalTexts = ['Parece estar delicioso! 😋', 'Se faltar um pouco, foi culpa minha 😂😂', 'Deveria ter pedido um desse também... 😔', 'Se atrasar é porque comi. 😖']
	const selectedFinalText = finalTexts[Math.floor(Math.random() * finalTexts.length)];
	
	switch(newStatus) {
		case 'waiting':
			return null;
		case 'preparing':
			return {
				title: 'Seu pedido mudou de status',
				body: `O Pedido #${orderId} está sendo preparado. ${selectedFinalText}`
			};
		case 'delivering':
			return {
				title: 'Seu pedido está a caminho',
				body: `O pedido #${orderId} já está saindo do estabelecimento para seu endereço. ${selectedFinalText}`
			};
		case 'delivered':
			return null;
		case 'canceled':
			return {
				title: 'Seu pedido foi marcado como cancelado',
				body: `O pedido #${orderId} foi cancelado. 😭`
			};
		default: return '';
	}
}