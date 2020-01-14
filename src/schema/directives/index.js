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
	},
	dateTime: (_, source) => {
		const date = new Date(source.get('createdAt'));
		let day = date.getDate();
		let month = date.getMonth()+1;
		let year = date.getFullYear();
		let hours = date.getHours();
		let minutes = date.getMinutes();

		if (day < 10) day = `0${day}`;
		if (month < 10) month = `0${month}`;
		if (hours < 10) hours = `0${hours}`;
		if (minutes < 10) minutes = `0${minutes}`;

		return `${day}/${month}/${year} ${hours}: {minutes}`;
	}
}