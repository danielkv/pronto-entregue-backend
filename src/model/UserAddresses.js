import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de relação de empresas e usuários
 */

class UserAddress extends Sequelize.Model {}
UserAddress.init({}, {
	modelName: 'userAddress',
	tableName: 'user_addresses',
	sequelize: conn
});

export default UserAddress;