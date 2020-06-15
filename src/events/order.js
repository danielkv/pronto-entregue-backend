import DeliveryController from '../controller/delivery';
import OrderController from '../controller/order';
import { QUEUE_ORDER_STATUS_UPDATED, ORDER_STATUS_CHANGE_NOTIFICATION } from '../jobs/keys';
import queue from '../services/queue';

export default new class OrderEventsFactory {
	start() {
		/**
		 * fired when delivery change status. If delivery has orderId,
		 * it will copy the status to the order
		 */
		DeliveryController.on('changeStatus', async ({ delivery, newStatus, loggedUser })=>{
			if (!delivery.get('orderId')) return;

			const order = await delivery.getOrder();

			OrderController.changeStatus(order, newStatus, null, { loggedUser });
		})

		/**
		 * Queue job for notify after change order status
		 */
		OrderController.on('changeStatus', ({ order, newStatus })=>{
			const orderId = order.get('id');
			const userId = order.get('userId');

			// queue events for updated order status
			queue.add(QUEUE_ORDER_STATUS_UPDATED, `${QUEUE_ORDER_STATUS_UPDATED}_${orderId}_${newStatus}`, { orderId });

			// queue customer notification
			queue.add(ORDER_STATUS_CHANGE_NOTIFICATION, `${ORDER_STATUS_CHANGE_NOTIFICATION}_${orderId}_${newStatus}`, { userId, orderId, newOrderStatus: newStatus })
		});

		console.log(' - Setup Order events')
	}
}


