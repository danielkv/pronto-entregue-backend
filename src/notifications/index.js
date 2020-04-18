import mailer  from '../services/mailer';

function send (type, data, context) {
	
	return mailer.send({
		template: type,
		message: data,
		locals: context
	})
	//const sendEmail = mailer.templateSender();

	//return sendEmail(data, context)
}

export default {
	send
}