import _ from 'lodash'

import CompanyController from '../../controller/company';
import NotificationController from '../../controller/notification';
import StatusController from '../../controller/status';
import Delivery from '../../model/delivery';
import { DESKTOP_TOKEN_META, DEVICE_TOKEN_META } from '../../utilities/notifications';

export async function deliveryChangeStatus({ data: { deliveryId, companyId, newStatus } }) {
	const delivery = await Delivery.findByPk(deliveryId);
	if (!delivery) throw new Error('Entrega não encontrada');

	const orderId = delivery.get('orderId')

	const statusLabel = StatusController.statusLabel(newStatus);

	const notificationData = {
		title: 'Status alterado',
		body: `O entregador alterou o status da entrega #${delivery.orderId} para ${statusLabel}`,
		data: {
			action: 'statusChange',
			orderId: _.toString(orderId),
			newStatus: newStatus,
			companyId: _.toString(companyId),
			deliveryId: _.toString(deliveryId),
		}
	}
	
	// get desktop company tokens
	const desktopTokens = await CompanyController.getUserTokens(companyId, DESKTOP_TOKEN_META);
	NotificationController.sendDesktop(desktopTokens, notificationData);

	// get device company tokens
	const deviceTokens = await CompanyController.getUserTokens(companyId, DEVICE_TOKEN_META);
	
	NotificationController.sendDevice(deviceTokens, {
		...notificationData,
		data: {
			...notificationData.data,
			redirect: {
				name: 'ProfileRoutes',
				params: {
					screen: 'OrdersRollScreen',
					params: { refetchOrders: true }
				}
			},
			alertData: notificationData
		}
	});

	return false;
}