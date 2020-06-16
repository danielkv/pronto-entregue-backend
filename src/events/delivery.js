import DeliveryController from '../controller/delivery';
import OrderController from '../controller/order';
import JobQueue from '../factory/queue';
import { QUEUE_NEW_DELIVERY_NOTIFICATION, NOTIFY_DELIVERY_SET_DELIVERY_MAN } from '../jobs/keys';

export default new class DeliveryEventFactory {
	start () {
		/**
		 * fired when delivery should be created from order
		 */
		OrderController.on('create', async ({ order, company }) => {
			// if delivery should be handle by us
			if (order.get('type') === 'peDelivery') await DeliveryController.createFromOrder(order, company);
		})

		/**
		 * Queue jobs when delivery is created
		 */
		DeliveryController.on('create', ({ delivery })=>{
			const deliveryId = delivery.get('id');

			const repeatEvery = 1000 * 60 * 5;

			// recurrent job to notify delivery men
			// it will be destroyed when some delivery man is set to delivery
			JobQueue.add(QUEUE_NEW_DELIVERY_NOTIFICATION, `${QUEUE_NEW_DELIVERY_NOTIFICATION}_${deliveryId}`, { deliveryId }, { repeate: { every: repeatEvery } });
		});

		/**
		 * Queue jobs when deliveryMan is set to a delivery
		 */
		DeliveryController.on('setDeliveryMan', ({ delivery, deliveryMan })=>{
			const deliveryId = delivery.get('id')

			// notify user / company delivery man is on the way
			JobQueue.add(NOTIFY_DELIVERY_SET_DELIVERY_MAN, `${NOTIFY_DELIVERY_SET_DELIVERY_MAN}_${deliveryId}`, { deliveryId });

			// remove recurrent queue for this delivery

		});

		/**
		 * Queue job for notify users when delivery change status
		 */
		/* DeliveryController.on('changeStatus', ({ delivery, newStatus })=>{
			const deliveryId = delivery.get('id');
			const userId = delivery.get('userId');
			
			// queue events for updated order status
			JobQueue.add(QUEUE_ORDER_STATUS_UPDATED, `${QUEUE_ORDER_STATUS_UPDATED}_${deliveryId}_${newStatus}`, { orderId: deliveryId });
			
			// queue customer notification
			JobQueue.add(ORDER_STATUS_CHANGE_NOTIFICATION, `${ORDER_STATUS_CHANGE_NOTIFICATION}_${deliveryId}_${newStatus}`, { userId, orderId: deliveryId, newOrderStatus: newStatus })
		}); */

		console.log(' - Setup Delivery events')
	}
}