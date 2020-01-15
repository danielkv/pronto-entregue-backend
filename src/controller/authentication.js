import { AuthenticationError }  from 'apollo-server';
import jwt  from 'jsonwebtoken';

import Companies from '../model/company';
import Users from '../model/user';

/**
 * Faz autenticação de usuário e insere no contexto
 * 
 * @param {string} authorization Token de autenciação
 */

export function authenticate (authorization) {
	if (authorization.split(' ')[0] !== 'Bearer') throw new AuthenticationError('Autorização desconhecida');
	const { id, email } = jwt.verify(authorization.split(' ')[1], process.env.SECRET, { ignoreExpiration: true });

	return Users.findOne({
		where: { id, email },
		attributes: { exclude: ['password', 'salt'] }
	})
		.then(async (userFound)=>{
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
 * @param {Users} user ID da empresa
 */

export function selectCompany (companyId, user) {

	return Companies.findOne({ where: { id: companyId } })
		.then((companyFound)=>{
			if (!companyFound) throw new Error('Empresa selecionada não foi encontrada');
			//if (!companyFound.active) throw new Error('Essa empresa não está ativa');

			return companyFound;
		})
		.then (async (companyFound) => {
			if (user) {
				const [assignedUser] = await companyFound.getUsers({ where: { id: user.get('id') } });
			
				if (assignedUser && assignedUser.companyRelation.active) {
					companyFound.userRelation = assignedUser.companyRelation;
				}
			}

			return companyFound;
		});
}