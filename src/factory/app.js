import queue from '../services/queue';
import EventsFactory from './events';
import ModelFactory from './model';
import ServerFactory from './server';

export default new class AppFactory {
	start() {
		ModelFactory.start();
		EventsFactory.start();
		ServerFactory.start();
	}

	startJobsProcessors() {
		queue.process();
	}
}