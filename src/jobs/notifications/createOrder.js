import _ from 'lodash';

import CompanyController from '../../controller/company';
import NotificationController from '../../controller/notification';
import UserController from '../../controller/user';
import DB from '../../model';
import { DEVICE_TOKEN_META, DESKTOP_TOKEN_META } from '../../utilities/notifications';

export async function createOrder (job) {
	const { companyId, orderId }  =job.data;
	const { repeat } = job.opts;

	// check if order exists
	const order = await DB.order.findByPk(orderId);
	if (!order) throw new Error('Pedido não encontrado');

	// check if status is waiting
	if (order.get('status') !== 'waiting') throw new Error('Estabelecimento já abriu o pedido');

	const notificationData = {
		title: 'Novo pedido!',
		body: `Chegou pedido (#${orderId})`,
		data: {
			action: 'orderCreated',
			variant: 'warning',
			orderId: _.toString(orderId),
			companyId: _.toString(companyId)
		}
	}

	// get company users desktop tokens
	const desktopTokens = await CompanyController.getUserTokens(companyId, DESKTOP_TOKEN_META)

	// send notifications
	NotificationController.sendDesktop(desktopTokens, notificationData)
	
	// get company users device tokens
	const deviceTokens = await CompanyController.getUserTokens(companyId, DEVICE_TOKEN_META)

	//send notifications
	NotificationController.sendDevice(deviceTokens, {
		...notificationData,
		priority: 'high',
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
	})

	// case it is last job queued send notifications to masters adm
	if (repeat && repeat.count === repeat.limit) {
		const company = await DB.company.findByPk(companyId);

		const notificationMasterData = {
			title: 'Pedido não aberto',
			body: `Estabelecimento ${company.get('displayName')} recebeu o pedido #${orderId}, mas não abriu após ${repeat.count} notificações`,
			data: {
				action: 'orderNotOpen',
				variant: 'error',
				orderId: _.toString(orderId),
				companyId: _.toString(companyId)
			}
		}

		// get master desktop tokens
		const masterDesktopTokens = await UserController.getTokensByRole('master', DESKTOP_TOKEN_META);
		// send notifications
		NotificationController.sendDesktop(masterDesktopTokens, notificationMasterData)
		
		// get master device tokens
		const masterDeviceTokens = await UserController.getTokensByRole('master', DEVICE_TOKEN_META);
		// send notifications
		NotificationController.sendDevice(masterDeviceTokens, {
			...notificationMasterData,
			priority: 'high'
		})
	}
	
}