import CompanyController from '../../controller/company';
import * as notifications from '../../services/notifications';
import { DEVICE_TOKEN_META } from '../../utilities/notifications';

export async function createOrder ({ data: { companyId, orderId } }) {
	// get company users
	const tokens = await CompanyController.getUserTokens(companyId, DEVICE_TOKEN_META)

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