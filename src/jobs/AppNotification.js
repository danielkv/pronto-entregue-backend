import * as notifications from '../services/notifications';
import { APP_NOTIFICATION } from "./keys";

export default {
	key: APP_NOTIFICATION,
	options: {},
	async handle (job) {
		const tokens = job.data.tokens;
		delete job.data.tokens;
		const messages = notifications.createMessages(tokens, {
			priority: 'high',
			...job.data,
		})
		console.log(job)
		notifications.send(messages);

		return false;
	}
}