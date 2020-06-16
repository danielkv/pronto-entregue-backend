import DeliveryEventsFactory from '../events/delivery';
import OrderEventsFactory from '../events/order';

class EventFactory {
	start() {
		console.log('Start setup Events')
		DeliveryEventsFactory.start();
		OrderEventsFactory.start();
		console.log(' - Events ready\n')
	}
}

const AppEvents = new EventFactory();

export default AppEvents;