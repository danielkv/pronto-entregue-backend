import Email  from 'email-templates';
import path  from 'path';

import transporter from '../services/mailer';

export function sendMail (template, context) {
	const email = new Email();
	return email.renderAll(path.resolve(__dirname, '..', 'templates', template), context)
		.then((rendered) => {
			return transporter.sendMail({
				to: context.to || context.email,
				subject: rendered.subject,
				html: rendered.html
			});
		})
		.then(()=>true);
}