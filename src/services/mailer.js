import nodemailer  from 'nodemailer';

let config;

if (process.env.NODE_ENV == 'production') {
	config = {
		secure: true,
		host: 'mail.iocus.com.br',
		port: 465,
		auth: {
			user: process.env.EMAIL_ACCOUNT,
			pass: process.env.EMAIL_PASS,
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

export default nodemailer.createTransport(config, { from: `${process.env.EMAIL_NAME} ${process.env.EMAIL_ACCOUNT}` });