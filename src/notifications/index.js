import mailer  from '../services/mailer';

function send (type, data, context) {
	return mailer.send({
		template: type,
		message: data,
		locals: context
	})
}

export default {
	send
}