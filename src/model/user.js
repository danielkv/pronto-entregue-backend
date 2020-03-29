import Sequelize from 'sequelize';

import conn from '../services/connection';
import { salt }  from '../utilities';

/*
 * Define modelo (tabela) de usuários
 */

class User extends Sequelize.Model {
	/**
	 * Verifica as permissões de um usuário
	 */

	can(perms, options={}) {
		// eslint-disable-next-line no-param-reassign
		if (!Array.isArray(perms)) perms = [perms];
		if (!this.permissions) throw new Error('As permissões não foram definidas');
		
		const every = options.every || true;
		const userPermissions = this.permissions;

		if (userPermissions.includes('master')) return true;
		
		if (every) {
			if (perms.every(r => userPermissions.includes(r))) return true;
		} else {
			if (userPermissions.some(r => perms.includes(r))) return true;
		}

		return false;
	}
}
User.init({
	firstName: Sequelize.STRING,
	lastName: Sequelize.STRING,
	image: Sequelize.TEXT,
	email: {
		type: Sequelize.STRING,
		unique: true,
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false,
		set(val) {
			//Adiciona o salt para salvar a senha do usuário
			const salted = salt(val);
			this.setDataValue('salt', salted.salt);
			this.setDataValue('password', salted.password);
		}
	},
	salt: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
	role: {
		type: Sequelize.STRING,
		defaultValue: 'default',
		allowNull: false,
		comment: 'master | default'
	}
},{
	modelName: 'user',
	tableName: 'users',
	sequelize: conn,
});

export default User;