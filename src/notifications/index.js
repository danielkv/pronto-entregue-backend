const mailer = require('../services/mailer');

function send (type, data) {
	switch (type) {
		case 'update-user' :
			let html_data ='';
			const context = {
				email: data.before_update.email,
				username: data.before_update.first_name,
				updated_data : data.after_update
			};
			return mailer.sendMail('update-user', context);
		break;
	}
}

module.exports = {
	send
}