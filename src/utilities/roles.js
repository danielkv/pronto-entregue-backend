import Role from "../model/role";

/**
 * Check if user can set requested role
 * 
 * @param {String} role role requested
 * @param {User} user model User
 */

export function userCanSetRole(role, user) {
	if (role !== 'customer') {
		if (role === 'master' && !user.can('master')) throw new Error(`Você não tem premissões para cadastrar um usuário com permissão ${role}`);
		if (!user.can('adm')) throw new Error(`Você não tem premissões para cadastrar um usuário com permissão ${role}`);
	}
}

export async function extractRole(role) {
	if (role === 'master' || role === 'customer') return { roleName: role, role: null };

	const roleModel = await Role.findByPk(parseInt(role));
	if (!roleModel) throw new Error('Função não encontrada');

	return {
		roleName: 'adm',
		role: roleModel
	}
}