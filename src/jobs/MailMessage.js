import mail from '../controller/mail';
import { MAIL_MESSAGE } from './keys';

export default {
	key: MAIL_MESSAGE,
	options: {},
	async handle ({ data: object }) {
		const { template, data, context } = object;

		// send email
		mail.send(template, data, context);
	}
}