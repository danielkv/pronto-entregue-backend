import DeliveryController from '../controller/delivery';
import OrderController, { ORDER_CREATED, ORDER_QTY_STATUS_UPDATED } from '../controller/order';
import JobQueue from '../factory/queue';
import Order from '../model/order';
import pubSub, { instanceToData } from '../services/pubsub';
import { ORDER_UPDATED } from '../utilities/notifications';

export default new class OrderEventsFactory {
	start() {
		/**
		 * fired when delivery change status. If delivery has orderId,
		 * it will copy the status to the order
		 */
		DeliveryController.on('changeStatus', async ({ delivery, newStatus, ctx, options })=>{
			if (options.fromListener) return;
			
			// change order status case delivery carries orderId
			const orderId = delivery.get('orderId');
			if (orderId && ['delivering', 'delivered', 'canceled'].includes(newStatus)) {
				const order = await Order.findByPk(orderId);
				if (order) {
					// notify company of status change
					JobQueue.notifications.add('deliveryChangeStatus', { deliveryId: delivery.get('id'), companyId: order.get('companyId'), newStatus })

					if (newStatus === 'canceled') {
						// notify company
					} else
						OrderController.changeStatus(order, newStatus, ctx, { fromListener: true })
				}
			}
		})

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


