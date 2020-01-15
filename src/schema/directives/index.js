import User  from '../../model/user';

export default {
	hasRole: (next, _, { permission, scope }, { user }) => {
		if (!(user instanceof User)) throw new Error('Usuário não autenticado');
		
		if (!user.can(permission, { scope }))
			throw new Error(`Você não tem permissões para essa ação`);

		return next();
	},
	isAuthenticated: (next, _, __, { user }) => {
		if (!(user instanceof User)) throw new Error('Usuário não autenticado')
		
		return next();
	}
}