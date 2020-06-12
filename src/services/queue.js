//import { setQueues } from 'bull-board';
import { Queue, Worker } from 'bullmq'

import * as jobs from '../jobs';
import redis from './connection'

//redis://redis:6379/0

//const redisHost = process.env.NODE_ENV === 'production' ? 'redis://redis' : 'redisdb.tzx2ao.ng.0001.sae1.cache.amazonaws.com';
const host = process.env.NODE_ENV === 'production' ? 'redisdb.tzx2ao.ng.0001.sae1.cache.amazonaws.com' : process.env.REDISCLOUD_URL;
const port = 6379;

//const redisQueue = new Redis(redisHost);

const queues = Object.values(jobs).map(job => {

	try {
		const bullQueue = new Queue(job.key, { connection: { host, port } });

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

//setQueues(queues.map(q => q.bull));

export default {
	queues,
	add(name, id, data) {
		try {
			const queue = this.queues.find(queue => queue.name === name);
			return queue.bull.add(id, data, queue.options);

			/* const job = jobs[name];

			// temp solution
			job.handle({ data }); */
		} catch (err) {
			console.error('job error', err.message);
		}
	},
	process() {
		return this.queues.forEach(queue => {
			new Worker(queue.name, queue.handle, { connection: redis })
		})
	}
}