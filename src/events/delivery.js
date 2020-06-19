import DeliveryController from '../controller/delivery';
import OrderController from '../controller/order';
import JobQueue from '../factory/queue';

export default new class DeliveryEventFactory {
	start () {
		/**
		 * create a delivery when order status is changed to preparing
		 */
		OrderController.on('changeStatus', async ({ order, company }) => {
			// if delivery should be handle by us
			if (order.get('type') === 'peDelivery') await DeliveryController.createFromOrder(order, company);
		})

		/**
		 * Queue jobs when delivery change status to waitingDelivery
		 * it is used to notify delivery men around the addressFrom
		 */
		DeliveryController.on('changeStatus', ({ delivery, newStatus })=>{
			if (newStatus !== 'waitingDelivery') return;

			const deliveryId = delivery.get('id');

			const repeatEvery = 1000 * 60 * 5;

			// recurrent job to notify delivery men
			// it will be removed when some delivery man is set to delivery
			JobQueue.notifications.add('notifyDeliveryMen', { deliveryId }, { repeate: { every: repeatEvery }, jobId: `notifyDeliveryMen_${deliveryId}` } )
		});

		/**
		 * Queue jobs when deliveryMan is set to a delivery
		 */
		DeliveryController.on('setDeliveryMan', async ({ delivery })=>{
			const deliveryId = delivery.get('id')

			// notify user / company delivery man is on the way
			JobQueue.notifications.add('setDeliveryMan', { deliveryId } )

			// remove recurrent queue for this delivery
			const job = await JobQueue.notifications.getJob(`notifyDeliveryMen_${deliveryId}`);
			job.remove();
		});

		console.log(' - Setup Delivery events')
	}
}