import DeliveryEvents from '../events/delivery';
import DeliveryManEvents from '../events/deliveryMan';
import OrderEvents from '../events/order';

class EventFactory {
	start() {
		console.log('Start setup Events')
		DeliveryEvents.start();
		OrderEvents.start();
		DeliveryManEvents.start();
		console.log(' - Events ready\n')
	}
}

const AppEvents = new EventFactory();

export default AppEvents;