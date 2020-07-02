import ConfigController from '../controller/config';
import OrderController, { ORDER_CREATED, ORDER_QTY_STATUS_UPDATED } from '../controller/order';
import JobQueue from '../factory/queue';
import pubSub, { instanceToData } from '../services/pubsub';
import { ORDER_NOTIFICATION_LIMIT, ORDER_NOTIFICATION_INTERVAL } from '../utilities/config';
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

			// remove recurrent notification
			JobQueue.removeRepeatebleJob('notifications', `createOrder.${orderId}`);

			// send order data to subscriptions
			pubSub.publish(ORDER_UPDATED, { orderUpdated: instanceToData(order), companyId });
	
			// send order qtys to subscriptions
			const ordersStatusQty = await OrderController.getOrderStatusQty(companyId);
			pubSub.publish(ORDER_QTY_STATUS_UPDATED, { updateOrderStatusQty: ordersStatusQty });

			// notify client status changed
			if (['preparing', 'waitingPickUp', 'delivering'].includes(newStatus))
				JobQueue.notifications.add('orderChangeStatus', { userId, orderId, newOrderStatus: newStatus })
		});

		/**
		 * Notify company (pubsub subscriptions) when order is created
		 */
		OrderController.on('create', async ({ order, company })=>{
			const orderId = order.get('id')
			const companyId = company.get('id');

			// publish pubsub
			pubSub.publish(ORDER_CREATED, { orderCreated: instanceToData(order), companyId });

			// setup data and config
			const limit = await ConfigController.get(ORDER_NOTIFICATION_LIMIT)
			const interval = await ConfigController.get(ORDER_NOTIFICATION_INTERVAL)
			const data = { companyId, orderId }
			
			// queue order notifications
			JobQueue.notifications.add(`createOrder.first.${orderId}`, data)
			JobQueue.notifications.add(`createOrder.${orderId}`, data, { repeat: { limit, every: interval, count: 0 } })
		});

		console.log(' - Setup Order events')
	}
}


