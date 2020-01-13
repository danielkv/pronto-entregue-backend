import Email  from 'email-templates';
import nodemailer  from 'nodemailer';
import path  from 'path';
let config;

if (process.env.NODE_ENV == 'production') {
	config = {
		secure:true,
		host:'mail.iocus.com.br',
		port:465,
		auth: {
			user: process.env.EMAIL_ACCOUNT,
			pass: process.env.EMAIL_PASS,
		},
		debug:false
	}
} else {
	//address: adeline.ryan30@ethereal.email
	config = {
		host: 'smtp.ethereal.email',
		port: 587,
		auth: {
			user: 'adeline.ryan30@ethereal.email',
			pass: 'vgxk5D49DCSRNKtqbY'
		}
	}
}

const transporter = nodemailer.createTransport(config, { from: `${process.env.EMAIL_NAME} ${process.env.EMAIL_ACCOUNT}` });

function sendMail (template_name, context) {
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

export default { sendMail };