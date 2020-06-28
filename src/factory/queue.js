import { setQueues, router as boardRouter } from 'bull-board'
import { Queue, Worker, QueueScheduler } from 'bullmq'

import redisConfig from '../config/redis';
import * as jobsHandlers from '../jobs';
import AppRouter from './router';


class JobQueueFactory {
	constructor () {
		this.host = redisConfig.host
		this.port = redisConfig.port;
		
		this.started = false;
		this.queues = null;

		this.notifications = null;
		this.mails = null;
	}

	startBullBoard() {
		setQueues(Object.values(this.queues));

		AppRouter.add('BullBoard', (router)=>{
			router.use('/bull/queues/', boardRouter)
		})

		console.log(' - Setup Bull Board')
	}
	
	start() {
		if (this.started) throw new Error('JobQueue já foi iniciado');
		console.log('Start JobQueue');

		this.createQueues();
		this.startBullBoard();

		this.started = true;
		console.log(` - JobQueue ready at: ${this.host}:${this.port}\n`);
	}

	createQueues() {
		const notificationsQueue = new Queue('Notifications', { connection: { host: this.host, port: this.port } });
		const notificationsQueueSchedular = new QueueScheduler('Notifications', { connection: { host: this.host, port: this.port } });
		const mailsQueue = new Queue('Mails', { connection: { host: this.host, port: this.port } });

		const queues = {
			Notifications: notificationsQueue,
			Mails: mailsQueue
		};

		this.notifications = notificationsQueue;
		this.notificationsQueueSchedular = notificationsQueueSchedular;
		this.mails = mailsQueue;

		console.log(` - ${queues.length} Queues created `);

		this.queues = queues;
		return queues;
	}

	startWorkers() {
		const queues = ['Notifications', 'Mails'];

		const processes = queues.forEach(queue => {
			const handler = (job)=>{
				// job name pattern = name.id => only name will be used to call fn
				const splitted = job.name.split('.');
				const name = splitted[0];
				const fn = jobsHandlers[name];
				if (!fn) throw new Error('Job não encontrado');
				return fn(job)
			}
			new Worker(queue, handler, { connection: { host: this.host, port: this.port } })
		});

		console.log(`${queues.length} Job Workers started\n`)

		return processes;
	}

	async removeRepeatebleJob(queueName, name) {
		const queue = this[queueName];
		const jobs = await queue.getRepeatableJobs();
		const jobFound = jobs.find(job => job.name === name);
		if (jobFound) {
			const key = jobFound.key;
			return await queue.removeRepeatableByKey(key);
		}
	}

	testSchedule() {
		console.log('Test schedule started');

		this.notifications.add(`notifyDeliveryMen.1`, { deliveryId: 151 }, { repeat: { every: 5000, limit: 3, count: 0 }, jobId: `notifyDeliveryMen.1` } )
	}
}

const JobQueue = new JobQueueFactory();

export default JobQueue;