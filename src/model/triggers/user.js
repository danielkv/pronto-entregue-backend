import User from '../user';

function createBalance(user) {
	return user.createCreditBalance({
		value: 0,
	})
}

User.afterCreate('createBalance', createBalance)
User.afterBulkCreate('createBalance', async users => {
	await Promise.all([users.map(user => createBalance(user))])
})