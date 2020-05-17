import Queue from 'bull'
import { setQueues } from 'bull-board';
import Redis from 'ioredis';

import * as jobs from '../jobs';
//redis://redis:6379/0

const redisHost = process.env.NODE_ENV === 'production' ? 'redis-small-queue.tzx2ao.ng.0001.sae1.cache.amazonaws.com' : null;
const redisQueue = Redis.Cluster([{ host: redisHost, port: 6379 }]);


const redisHost = process.env.NODE_ENV === 'production' ? 'redis-small-queue.tzx2ao.ng.0001.sae1.cache.amazonaws.com' : null;
const redisQueue = Redis.Cluster([{ host: redisHost, port: 6379 }]);

const queues = Object.values(jobs).map(job => {

	const bullQueue = new Queue(job.key, {
		createClient: ()=> redisQueue
	});

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

setQueues(queues.map(q => q.bull));

export default {
	queues,
	add(name, data) {
		const queue = this.queues.find(queue => queue.name === name);
    
		return queue.bull.add(data, queue.options);
	},
	process() {
		Queue.isReady
		return this.queues.forEach(queue => {
			queue.bull.process(queue.handle);
	
			queue.bull.on('failed', (job, err) => {
				console.log('Job failed', queue.name, job.data);
				console.log(err);
			});
		})
	}
}