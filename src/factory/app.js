import JobQueue from '../factory/queue';
import AppEvents from './events';
import AppModels from './model';
import AppRouter from './router';
import AppServer from './server';

import 'moment/locale/pt-br';

export default new class AppService {
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