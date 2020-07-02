import _ from 'lodash';

import DeliveryManController from "../../controller/deliveryMan";
import NotificationController from "../../controller/notification";
import UserController from "../../controller/user";
import JobQueue from "../../factory/queue";
import DB from "../../model";
import Delivery from "../../model/delivery";
import { DESKTOP_TOKEN_META, DEVICE_TOKEN_META } from "../../utilities/notifications";

export async function notifyDeliveryMen(job) {
	const { deliveryId } = job.data;
	const { repeat } = job.opts;

	// get delivery
	const delivery = await Delivery.findByPk(deliveryId);
	if (!delivery) throw new Error('Entrega não encontrada');

	// case delivery man was already set remove repeateble job
	if (delivery.get('deliveryManId')) {
		JobQueue.removeRepeatebleJob('notifications', `notifyDeliveryMen.${deliveryId}`);
		throw new Error('Já foi setado um entregador');
	}

	// get closest active delivery men (users)
	const tokens = await DeliveryManController.getEnabledTokens();

	const notificationData = {
		title: `Há um novo pedido a sua espera`,
		body: 'Vá até o endereço para fazer a entrega',
	}

	// send notifications
	NotificationController.sendDevice(tokens, {
		...notificationData,
		priority: 'high',
		data: {
			redirect: {
				name: 'ProfileRoutes',
				params: {
					screen: 'DeliveriesScreen'
				}
			},
			alertData: notificationData
		}
	})

	const orderId = delivery.get('orderId');

	if (orderId && repeat && repeat.count === repeat.limit) {
		const order = await DB.order.findByPk(orderId);

		const companyId = order.get('companyId');
		const company = await DB.company.findByPk(companyId);

		const notificationMasterData = {
			title: 'Entrenga não aceita',
			body: `Estabelecimento ${company.get('displayName')} tem um pedido #${orderId} aguardando para retirada, mas nenhum entregador aceitou após ${repeat.count} notificações`,
			data: {
				action: 'deliveryNotOpen',
				variant: 'error',
				orderId: _.toString(orderId),
				companyId: _.toString(companyId)
			}
		}

		// get master desktop tokens
		const masterDesktopTokens = await UserController.getTokens('master', DESKTOP_TOKEN_META);
		// send notifications
		NotificationController.sendDesktop(masterDesktopTokens, notificationMasterData)
		
		// get master device tokens
		const masterDeviceTokens = await UserController.getTokens('master', DEVICE_TOKEN_META);
		// send notifications
		NotificationController.sendDevice(masterDeviceTokens, {
			...notificationMasterData,
			priority: 'high'
		})
	}

	return true;
}