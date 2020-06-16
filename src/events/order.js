import DeliveryController from '../controller/delivery';
import OrderController, { ORDER_CREATED } from '../controller/order';
import JobQueue from '../factory/queue';
import pubSub from '../services/pubsub';

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
		 * Queue job to notify  after change order status
		 */
		OrderController.on('changeStatus', ({ order, newStatus })=>{
			const orderId = order.get('id');
			const userId = order.get('userId');

			// queue events for updated order status
			JobQueue.notifications.add('orderChangeStatus', { userId, orderId, newOrderStatus: newStatus })
		});

		/**
		 * Notify company (pubsub subscriptions) when order is created
		 */
		OrderController.on('create', ({ order, company })=>{
			// publish pubsub
			pubSub.publish(ORDER_CREATED, { orderCreated: order });

			// queue order notifications
			JobQueue.notifications.add('createOrder', { companyId: company.companyId, orderId: order.id })
		});

		console.log(' - Setup Order events')
	}
}


