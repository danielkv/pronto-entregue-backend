import { AuthenticationError }  from 'apollo-server';
import jwt  from 'jsonwebtoken';

import Company from '../model/company';
import User from '../model/user';

/**
 * Faz autenticação de usuário e insere no contexto
 * 
 * @param {string} authorization Token de autenciação
 */

export function authenticate (authorization, checkBearer=true) {
	let authorizationToken = '';

	if (checkBearer) {
		if (authorization.split(' ')[0] !== 'Bearer') throw new AuthenticationError('Autorização desconhecida');
		authorizationToken = authorization.split(' ')[1];
	} else
		authorizationToken = authorization;

	const { id, email } = jwt.verify(authorizationToken, process.env.SECRET, { ignoreExpiration: true });

	return User.cache().findByPk(id)
		.then(async (userFound)=>{
			if (userFound.get('email') !== email) throw new AuthenticationError('Os dados de autenticação não conferem')
			if (!userFound) throw new AuthenticationError('Usuário não encontrado');
			if (userFound.active != true) throw new AuthenticationError('Usuário não está ativo');

			userFound.permissions = [userFound.role];

			return userFound;
		});
}

/**
 * Faz a seleção da empresa e insere no contexto
 * 
 * @param {integer} companyId ID da empresa
 * @param {User} user ID da empresa
 */

export async function selectCompany (companyId, user) {
	// check if company exists
	const companyFound = await Company.cache().findByPk(companyId);
	if (!companyFound) throw new Error('Empresa selecionada não foi encontrada');

	if (user) {
		const [assignedUser] = await companyFound.getUsers({ where: { id: user.get('id') } });
		if (assignedUser && assignedUser.companyRelation.active) {
			const role = await assignedUser.companyRelation.getRole();
			user.permissions = [user.role, ...role.get('permissions')];
		}
	}

	return companyFound;
}