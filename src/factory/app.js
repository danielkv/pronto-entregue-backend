import JobQueue from '../factory/queue';
import AppEvents from './events';
import AppModels from './model';
import AppRouter from './router';
import AppServer from './server';

export default new class AppFactory {
	start() {
		AppModels.start();
		AppEvents.start();
		JobQueue.start()
		AppRouter.start();
		AppServer.start();
	}

	startJobsProcessors() {
		JobQueue.startWorkers();
	}
}