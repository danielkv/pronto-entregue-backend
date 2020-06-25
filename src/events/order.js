import OrderController, { ORDER_CREATED, ORDER_QTY_STATUS_UPDATED } from '../controller/order';
import JobQueue from '../factory/queue';
import pubSub, { instanceToData } from '../services/pubsub';
import { ORDER_UPDATED } from '../utilities/notifications';

export default new class OrderEventsFactory {
	start() {
		/**
		 * Queue job to notify  after change order status
		 */
		OrderController.on('changeStatus', async ({ order, newStatus })=>{
			const orderId = order.get('id');
			const userId = order.get('userId');
			const companyId = order.get('companyId');

			// send order data to subscriptions
			pubSub.publish(ORDER_UPDATED, { orderUpdated: instanceToData(order), companyId });
	
			// send order qtys to subscriptions
			const ordersStatusQty = await OrderController.getOrderStatusQty(companyId);
			pubSub.publish(ORDER_QTY_STATUS_UPDATED, { updateOrderStatusQty: ordersStatusQty });

			// queue notifications for updated order status
			JobQueue.notifications.add('orderChangeStatus', { userId, orderId, newOrderStatus: newStatus })
		});

		/**
		 * Notify company (pubsub subscriptions) when order is created
		 */
		OrderController.on('create', ({ order, company })=>{
			// publish pubsub
			pubSub.publish(ORDER_CREATED, { orderCreated: instanceToData(order) });

			// queue order notifications
			JobQueue.notifications.add('createOrder', { companyId: company.companyId, orderId: order.id })
		});

		console.log(' - Setup Order events')
	}
}


