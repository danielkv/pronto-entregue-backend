import * as notifications from '../../services/notifications';

export async function simpleNotification(job) {
	const tokens = job.data.tokens;
	delete job.data.tokens;
	const messages = notifications.createMessages(tokens, {
		priority: 'high',
		...job.data,
	})
	notifications.send(messages);

	return false;
}
