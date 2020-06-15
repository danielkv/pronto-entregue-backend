import DeliveryEventsFactory from '../events/delivery';
import OrderEventsFactory from '../events/order';

export default new class EventFactory {
	start() {
		console.log('Start setup Events')
		DeliveryEventsFactory.start();
		OrderEventsFactory.start();
		console.log(' - Events ready\n')
	}
}