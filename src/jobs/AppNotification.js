import * as notifications from '../services/notifications';
import { APP_NOTIFICATION } from "./keys";

export default {
	key: APP_NOTIFICATION,
	options: {},
	async handle ({ data }) {
		const tokens = data.tokens;
		delete data.tokens;
		const messages = notifications.createMessages(tokens, {
			priority: 'high',
			...data,
		})
		
		notifications.send(messages);
	}
}