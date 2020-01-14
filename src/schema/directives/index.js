import User  from '../../model/user';

export default {
	hasRole: (next, _, { permission, scope }, ctx) => {
		if (!(ctx.user instanceof User)) throw new Error('Usuário não autenticado');
		//if (!(ctx.company instanceof Companies)) throw new Error('Empresa não selecionada');
		//if (!(ctx.branch instanceof Branches)) throw new Error('Filial não selecionada');
		
		if (!ctx.user.can(permission, { scope }))
			throw new Error(`Você não tem permissões para essa ação`);

		return next();
	},
	isAuthenticated: (next, _, __, ctx) => {
		if (!(ctx.user instanceof User)) throw new Error('Usuário não autenticado')
		
		return next();
	}
}