import User from '../user';

export default new class UserTriggerFactory {

	start() {
		User.afterCreate('createBalance', this.createBalance)
		User.afterBulkCreate('createBulkBalance', async users => {
			await Promise.all([users.map(user => this.createBalance(user))])
		})

		console.log(' - Setup model user triggers')
	}

	createBalance(user) {
		user.createCreditBalance({
			value: 0,
		})
	}

}