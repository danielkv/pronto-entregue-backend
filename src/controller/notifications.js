import { APP_NOTIFICATION, NEW_COMPANY_NOTIFICATION, COMPANY_USERS_NEW_ORDER_NOTIFICATION } from '../jobs/keys';
import UserMeta from '../model/userMeta';
import queue from '../services/queue';

/**
 * Queue notifications to comapany users, whe order is created
 * 
 * @param {*} companyId 
 * @param {*} orderId 
 */
export async function queueNewOrderNotification(companyId, orderId) {
	// queue notification
	queue.add(COMPANY_USERS_NEW_ORDER_NOTIFICATION, { companyId, orderId })
}

/**
 * Queue customer notification for new company on App
 * 
 * @param {*} companyId
 */
export async function queueNewCompanyNotification(companyId) {
	// queue notification
	queue.add(NEW_COMPANY_NOTIFICATION, { companyId })
}

/**
 * Queue customer notification when order change status
 * 
 * @param {*} userId 
 * @param {*} orderId 
 * @param {*} newOrderStatus 
 */
export async function queueCustomerStatusChangeNotification(userId, orderId, newOrderStatus) {
	const notificationData = orderCustomerNotificationData(orderId, newOrderStatus)
	if (notificationData) {
		// get user meta
		const pushTokenMeta = await UserMeta.findOne({
			where: { userId, key: 'notification_tokens' }
		})
		if (!pushTokenMeta) return;
		const tokens = JSON.parse(pushTokenMeta.value);

		queue.add(APP_NOTIFICATION, {
			...notificationData,
			tokens,
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
	}
}

/**
 * returns the title and message to be sent in notification
 * 
 * - references: queueCustomerStatusChangeNotification
 * @param {ID} orderId 
 * @param {String} newStatus
 */
export function orderCustomerNotificationData(orderId, newStatus) {
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