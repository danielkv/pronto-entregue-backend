//import { setQueues } from 'bull-board';
import { Queue, Worker, QueueScheduler } from 'bullmq'

import * as jobs from '../jobs';

export default new class JobQueue {
	
	constructor () {
		this.host = process.env.NODE_ENV === 'production' ? 'redisdb.tzx2ao.ng.0001.sae1.cache.amazonaws.com' : process.env.REDISCLOUD_URL;
		this.port = 6379;
		
		this.started = false;
		this.queues = null;
	}
	
	start() {
		if (this.started) throw new Error('JobQueue já foi iniciado');
		console.log('Start JobQueue');

		this.createQueues(jobs);
		this.startQueueScheduler();

		this.started = true;
		console.log(` - JobQueue ready at: ${this.host}:${this.port}\n`);
	}

	startQueueScheduler() {
		const queueScheduler = new QueueScheduler('scheduler', { connection: { host: this.host, port: this.port } });

		console.log(' - Queue scheduler started');
		
		return queueScheduler;
	}

	createQueues(jobs) {
		const queues = Object.values(jobs).map(job => {
			const bullQueue = new Queue(job.key, { connection: { host: this.host, port: this.port } });
	
			if (job.onQueueError && typeof job.onQueueError === 'function') bullQueue.on('error', job.onQueueError)
			else bullQueue.on('error', (err) => {
				console.error('JOB:', job.key, err.message)
			})
		
			return {
				bull: bullQueue,
				name: job.key,
				handle: job.handle,
				options: job.options,
			}
			
		});

		console.log(` - ${queues.length} Queues created `);

		this.queues = queues;
		return queues;
	}

	add(name, id, data, options={}) {
		if (!this.started) throw new Error('JobQueue não foi iniciado');

		try {
			const queue = this.queues.find(queue => queue.name === name);
			if (!queue) console.error('Queue doesn\'t exist')

			return queue.bull.add(id, data, { ...queue.options, ...options });

			/* const job = jobs[name];

			// temp solution
			job.handle({ data }); */
		} catch (err) {
			console.error('job error', err.message);
		}
	}

	startWorkers() {
		if (!this.started) throw new Error('JobQueue não foi iniciado');

		const processes = this.queues.forEach(queue => {
			new Worker(queue.name, queue.handle, { connection: { host: this.host, port: this.port } })
		});

		console.log(`${this.queues.length} Job Workers started\n`)

		return processes;
	}

	testSchedule() {
		console.log('Test schedule started');

		const queue = new Queue('jobtest', { connection: { host: this.host, port: this.port } });
		
		new QueueScheduler('jobtest', { connection: { host: this.host, port: this.port } });

		//queue.add('teste', { test: 'asd' }, { key: '123', repeat: { every: 2000 } }).then(job => console.log('created', job.toKey()));

		//queue.getRepeatableJobs().then((jobs)=>console.log('repeateble', jobs));

		queue.removeRepeatableByKey('teste::::2000').then((job)=>console.log('removed', job));

		new Worker('jobtest', (job)=>{console.log('precessed', job.name)}, { connection: { host: this.host, port: this.port } })
	}
}