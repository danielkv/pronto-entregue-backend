import { setQueues, router as boardRouter } from 'bull-board'
import { Queue, Worker, QueueScheduler } from 'bullmq'

import * as jobsHandlers from '../jobs';
import AppRouter from './router';

class JobQueueFactory {
	constructor () {
		this.host = process.env.NODE_ENV === 'production' ? 'redisdb.tzx2ao.ng.0001.sae1.cache.amazonaws.com' : process.env.REDISCLOUD_URL;
		this.port = 6379;
		
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
		this.startQueueScheduler();
		this.startBullBoard();

		this.started = true;
		console.log(` - JobQueue ready at: ${this.host}:${this.port}\n`);
	}

	startQueueScheduler() {
		const queueScheduler = new QueueScheduler('scheduler', { connection: { host: this.host, port: this.port } });

		console.log(' - Queue scheduler started');
		
		return queueScheduler;
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
			new Worker(queue, (job)=>jobsHandlers[job.name](), { connection: { host: this.host, port: this.port } })
		});

		console.log(`${queues.length} Job Workers started\n`)

		return processes;
	}

	/* testSchedule() {
		console.log('Test schedule started');

		const queue = new Queue('jobtest', { connection: { host: this.host, port: this.port } });
		
		new QueueScheduler('jobtest', { connection: { host: this.host, port: this.port } });

		queue.add('teste', { test: 'asd' }, { jobId: '123b', delay: 2000, removeOnComplete: true }).then(job => console.log('created', job.toKey()));

		//queue.getRepeatableJobs().then((jobs)=>console.log('repeateble', jobs));

		//queue.removeRepeatableByKey('teste::::2000').then((job)=>console.log('removed', job));

		new Worker('jobtest', (job)=>{console.log('precessed', job.name)}, { connection: { host: this.host, port: this.port } })
	} */
}

const JobQueue = new JobQueueFactory();

export default JobQueue;