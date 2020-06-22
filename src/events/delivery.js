import DeliveryController from '../controller/delivery';
import OrderController from '../controller/order';
import JobQueue from '../factory/queue';

export default new class DeliveryEventFactory {
	start () {
		/**
		 * create a delivery when order status is changed to preparing
		 */
		OrderController.on('changeStatus', async ({ order, newStatus, ctx }) => {
			// if delivery should be handle by us
			if (order.get('type') !== 'peDelivery') return;

			if (['preparing', 'waitingDelivery'].includes(newStatus)) {
				let delivery = await order.getDelivery();
				if (!delivery) delivery = await DeliveryController.createFromOrder(order);
				// also change delivery status
				DeliveryController.changeStatus(delivery, 'waitingDelivery', ctx)
			}
		})

		/**
		 * Queue jobs when delivery change status to waitingDelivery
		 * it is used to notify delivery men around the addressFrom
		 */
		DeliveryController.on('changeStatus', ({ delivery, newStatus })=>{
			if (newStatus !== 'waitingDelivery') return;

			const deliveryId = delivery.get('id');

			const repeatEvery = 1000 * 60 * 4; // 4 min

			// recurrent job to notify delivery men
			// it will be removed when some delivery man is set to delivery
			JobQueue.notifications.add(`notifyDeliveryMen.first.${deliveryId}`, { deliveryId } )
			JobQueue.notifications.add(`notifyDeliveryMen.${deliveryId}`, { deliveryId }, { delay: 0, repeat: { every: 5000, limit: 3, count: 0 } } )
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