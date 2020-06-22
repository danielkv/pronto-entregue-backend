import CompanyController from '../../controller/company';
import NotificationController from '../../controller/notification';
import Delivery from '../../model/delivery';
import Order from '../../model/order';
import pubSub from '../../services/pubsub';
import { DESKTOP_TOKEN_META, DEVICE_TOKEN_META, ORDER_UPDATED } from '../../utilities/notifications';

export async function setDeliveryMan({ data: { deliveryId, deliveryManId } }) {
	// check if delivery exists
	const delivery = await Delivery.findByPk(deliveryId);
	if (!delivery) throw new Error('Pedido não encontrado')
	
	// check if user exists
	const user = await Delivery.findByPk(deliveryManId);
	if (!user) throw new Error('Usuário não encontrado')

	// if is delivery from order
	const orderId = delivery.get('orderId');

	if (orderId) {
		// checks if order exists
		const order = await Order.findByPk(orderId);
		if (!order) throw new Error('Pedido não encontrado');

		// get companyId
		const companyId = order.get('companyId');

		// send notification to subscribed clients
		pubSub.publish(ORDER_UPDATED, { orderUpdated: order });

		// generate data
		const notificationData = {
			title: 'Um entregador aceitou um pedido',
			body: `O entregador ${user.get('firstName')} irá retirar o pedido ${orderId} em instantes`,
			data: {
				orderId: orderId,
				deliveryManId,
				deliveryId
			}
		}

		// get desktop tokens
		const desktopTokens = await CompanyController.getUserTokens(companyId, DESKTOP_TOKEN_META);
		NotificationController.sendDesktop(desktopTokens, { title: 'teste titulo', body: 'mensagem' });

		// get device tokens
		const deviceTokens = await CompanyController.getUserTokens(companyId, DEVICE_TOKEN_META);
		
		NotificationController.sendDevice(deviceTokens, {
			...notificationData,
			data: {
				...notificationData.data,
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
		});
	}

	return true;
}
