import User  from '../../model/user';

export default {
	hasRole: (next, _, { permission, checkSameUser = false, variableKey = 'id' }, { user }, { variableValues }) => {
		if (!(user instanceof User)) throw new Error('Usuário não autenticado');

		if (checkSameUser) {
			const loggedUserId = user.get('id');
			const requestUserId = parseInt(variableValues[variableKey]);

			if (loggedUserId === requestUserId) return next();
		}
		
		if (!user.can(permission))
			throw new Error(`Você não tem permissões para essa ação`);

		return next();
	},
	isAuthenticated: (next, _, __, { user }) => {
		if (!(user instanceof User)) throw new Error('Usuário não autenticado')
		
		return next();
	}
}