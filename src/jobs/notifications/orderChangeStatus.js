import NotificationController from '../../controller/notification';
import OrderController from '../../controller/order';
import Order from '../../model/order';
import { DEVICE_TOKEN_META } from '../../utilities/notifications';

export async function orderChangeStatus({ data: { userId, orderId, newOrderStatus } }) {
	const order = await Order.findByPk(orderId);
	if (!order) throw new Error('Pedido não encontrado');

	const deviceTokens = await OrderController.getUserTokens(userId, DEVICE_TOKEN_META);

	const notificationData = orderCustomerNotificationData(order, newOrderStatus)
	if (!notificationData) throw new Error('Não há mensagem')
	
	NotificationController.sendDevice(deviceTokens, {
		...notificationData,
		data: {
			...notificationData.data,
			redirect: {
				name: 'OrderRoutes',
				params: {
					screen: 'OrderScreen',
					params: { orderId }
				}
			},
			alertData: notificationData
		}
	});

	return false;
}


function orderCustomerNotificationData(order, newStatus) {
	const orderId = order.get('id');
	const type = order.get('type');

	const finalTexts = ['Parece estar delicioso! 😋', 'Se faltar um pouco, foi culpa minha 😂😂', 'Deveria ter pedido um desse também... 😔', 'Se atrasar é porque comi. 😖']
	const pickUpFinals = ['Corre pra pegar o pedido 🏃🏃', 'Hmm, tá aqui do lado, não sei se aguento 🤭', 'Só vim buscar que eu guardo pra você 👊']

	const selectedFinalTextPickUp = pickUpFinals[Math.floor(Math.random() * pickUpFinals.length)];
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
			return type === 'takeout'
				? {
					title: 'Seu pedido está pronto',
					body: `O pedido #${orderId} está aguardando a retirada. ${selectedFinalTextPickUp}`
				}
				: {
					title: 'Seu pedido está a caminho',
					body: `O pedido #${orderId} já está a caminho do seu endereço. ${selectedFinalText}`
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