import JobQueue from '../factory/queue';
import EventsFactory from './events';
import ModelFactory from './model';
import ServerFactory from './server';

export default new class AppFactory {
	start() {
		ModelFactory.start();
		EventsFactory.start();
		JobQueue.start()
		ServerFactory.start();

		//test
		JobQueue.testSchedule();
	}

	startJobsProcessors() {
		JobQueue.startWorkers();
	}
}