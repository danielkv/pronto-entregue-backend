import Email  from 'email-templates';
import path  from 'path';

import transporter from '../services/mailer';

export function sendMail (template_name, context) {
	const email = new Email();
	return email.renderAll(path.resolve(__dirname, '..', 'templates', template_name), context)
		.then((rendered) => {
			return transporter.sendMail({
				to: context.to || context.email,
				subject : rendered.subject,
				html : rendered.html
			});
		})
		.then(()=>console.log('ok'));
}