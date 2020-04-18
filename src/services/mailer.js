import Email from 'email-templates';
import nodemailer  from 'nodemailer';
import path  from 'path';

let config;

if (process.env.NODE_ENV === 'production') {
	config = {
		secure: true,
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_ACCOUNT,
			pass: process.env.EMAIL_PASSWORD,
		},
		debug: false
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

const transporter = nodemailer.createTransport(config, { from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_ACCOUNT}>` });

export default new Email({
	transport: transporter,
	send: true,
	preview: false,
	views: {
		root: path.resolve(__dirname, '../', 'templates')
	}
})
