import DeliveryController from '../controller/delivery';
import OrderController from '../controller/order';
import ConfigEntity from '../entities/Config';
import JobQueue from '../factory/queue';
import Order from '../model/order';
import pubSub, { instanceToData } from '../services/pubsub';
import { DELIVERY_NOTIFICATION_LIMIT, DELIVERY_NOTIFICATION_INTERVAL } from '../utilities/config';
import { DELIVERY_UPDATED, DELIVERY_CREATED } from '../utilities/delivery';
import { ORDER_UPDATED } from '../utilities/notifications';

const configEntity = new ConfigEntity();

export default new class DeliveryEventFactory {
	start () {
		/**
		 * create a delivery when order status is changed to preparing
		 */
		OrderController.on('changeStatus', async ({ order, newStatus, ctx, options }) => {
			// avoid infinite loop
			if (options.fromListener) return;

			// if delivery should be handle by us
			if (order.get('type') !== 'peDelivery' || ['waitingPickUp', 'delivered', 'canceled'].includes(newStatus)) return;
			
			// get or create delivery
			let delivery = await order.getDelivery();
			if (!delivery) delivery = await DeliveryController.createFromOrder(order);

			// also change delivery status if newStatus matches
			if (['waitingDelivery', 'delivering'].includes(newStatus)) DeliveryController.changeStatus(delivery, newStatus, ctx, { fromListener: true })
		})

		/**
		 * Queue jobs when delivery change status to waitingDelivery
		 * it is used to notify delivery men around the addressFrom
		 */
		DeliveryController.on('changeStatus', async ({ delivery, newStatus, ctx })=>{
			// send delivery data to subscribers
			pubSub.publish(DELIVERY_UPDATED, { delivery: instanceToData(delivery) })

			// checks if any order is assign to
			const orderId = delivery.get('orderId');
			if (!orderId) return;

			// check if order exits
			const order = await Order.findByPk(orderId);
			if (!order) throw new Error('Pedido não encontrado');

			// send delivery data to subscribers
			pubSub.publish(ORDER_UPDATED, { orderUpdated: instanceToData(order), companyId: order.get('companyId') })

			if (newStatus === 'canceled') {
				// unassign delivery man
				await delivery.setOrder(null);

				// return order to status waiting delivery
				await OrderController.changeStatus(order, 'waitingDelivery', ctx, { fromListener: true });
				
				if (!ctx.user.can('adm')) {
					const newDelivery =  await DeliveryController.createFromOrder(order);
					DeliveryController.changeStatus(newDelivery, 'waitingDelivery', ctx)
				}
			}

			// notify company users if delivery is assign to order
			if (newStatus !== 'delivering')
				JobQueue.notifications.add('deliveryChangeStatus', { deliveryId: delivery.get('id'), companyId: order.get('companyId'), newStatus })

			// case new status is waitingDelivery, notify delivery men
			if (newStatus === 'waitingDelivery') {
				const limit = await configEntity.get(DELIVERY_NOTIFICATION_LIMIT);
				const interval = await configEntity.get(DELIVERY_NOTIFICATION_INTERVAL);
				DeliveryController.notifyDeliveryMen(delivery, interval, limit)
			}
		});

		/**
		 * Queue jobs when deliveryMan is set to a delivery
		 */
		DeliveryController.on('setDeliveryMan', ({ delivery, deliveryMan })=>{
			const deliveryId = delivery.get('id')
			const deliveryManId = deliveryMan.get('id')

			// send delivery data to subscribers
			pubSub.publish(DELIVERY_UPDATED, { delivery: instanceToData(delivery) });

			// notify user / company delivery man is on the way
			JobQueue.notifications.add('setDeliveryMan', { deliveryId, deliveryManId } )

			// remove recurrent queue for this delivery
			JobQueue.removeRepeatebleJob('notifications', `notifyDeliveryMen.${deliveryId}`);
			//job.remove();
		});

		/**
		 * Events after delivery creation
		 */
		DeliveryController.on('create', ({ delivery })=>{
			
			// send delivery data to subscribers
			pubSub.publish(DELIVERY_CREATED, { delivery: instanceToData(delivery) })
		});

		console.log(' - Setup Delivery events')
	}
}