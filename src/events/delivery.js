import DeliveryController from '../controller/delivery';
import OrderController from '../controller/order';
import JobQueue from '../factory/queue';
import pubSub, { instanceToData } from '../services/pubsub';
import { DELIVERY_UPDATED } from '../utilities/delivery';

export default new class DeliveryEventFactory {
	start () {
		/**
		 * create a delivery when order status is changed to preparing
		 */
		OrderController.on('changeStatus', async ({ order, newStatus, ctx, options }) => {
			// avoid infinite loop
			if (options.fromListener) return;

			// if delivery should be handle by us
			if (order.get('type') !== 'peDelivery' && newStatus !== 'waiting') return;
			
			let delivery = await order.getDelivery();
			if (!delivery) delivery = await DeliveryController.createFromOrder(order);
			// also change delivery status
			DeliveryController.changeStatus(delivery, newStatus, ctx, { fromListener: true })
		
		})

		/**
		 * Queue jobs when delivery change status to waitingDelivery
		 * it is used to notify delivery men around the addressFrom
		 */
		DeliveryController.on('changeStatus', async ({ delivery, newStatus })=>{
			// send delivery data to subscribers
			pubSub.publish(DELIVERY_UPDATED, { delivery: instanceToData(delivery) })

			if (newStatus === 'waitingDelivery') DeliveryController.notifyDeliveryMen(delivery)
		});

		/**
		 * Queue jobs when deliveryMan is set to a delivery
		 */
		DeliveryController.on('setDeliveryMan', ({ delivery, deliveryMan })=>{
			const deliveryId = delivery.get('id')
			const deliveryManId = deliveryMan.get('id')

			// notify user / company delivery man is on the way
			JobQueue.notifications.add('setDeliveryMan', { deliveryId, deliveryManId } )

			// remove recurrent queue for this delivery
			JobQueue.removeRepeatebleJob('notifications', `notifyDeliveryMen.${deliveryId}`);
			//job.remove();
		});

		console.log(' - Setup Delivery events')
	}
}