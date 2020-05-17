import { setQueues } from 'bull-board';
import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis';

import * as jobs from '../jobs';
//redis://redis:6379/0

//const redisHost = process.env.NODE_ENV === 'production' ? 'redis-small-queue.tzx2ao.ng.0001.sae1.cache.amazonaws.com' : 'localhost';
const redisHost = 'redis://redis:6379';

const redisQueue = new Redis(redisHost);

const queues = Object.values(jobs).map(job => {

	try {
		const bullQueue = new Queue(job.key, { connection: redisQueue });

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
	} catch (err) {
		console.error(err.message);
	}
});

setQueues(queues.map(q => q.bull));

export default {
	queues,
	add(name, data) {
		const queue = this.queues.find(queue => queue.name === name);
		return queue.bull.add('JOB', data, queue.options);
	},
	process() {
		return this.queues.forEach(queue => {
			new Worker(queue.name, queue.handle, { connection: redisQueue })
		})
	}
}