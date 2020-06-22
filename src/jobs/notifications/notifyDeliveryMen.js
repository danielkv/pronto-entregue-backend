import DeliveryManController from "../../controller/deliveryMan";
import NotificationController from "../../controller/notification";
import JobQueue from "../../factory/queue";
import Delivery from "../../model/delivery";

export async function notifyDeliveryMen(job) {
	const { deliveryId } = job.data;

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
			alertData: notificationData
		}
	})

	return true;
}