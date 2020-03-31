import User from '../user';

function createBalance(user) {
	user.createCreditBalance({
		value: 0,
	})
}

User.afterCreate('createBalance', createBalance)
User.afterBulkCreate('createBulkBalance', async users => {
	await Promise.all([users.map(user => createBalance(user))])
})