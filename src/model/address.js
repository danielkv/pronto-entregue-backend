import Sequelize from 'sequelize';

import cache from '../cache';
import conn from '../services/connection';

class Address extends Sequelize.Model {}
Address.init({
	name: Sequelize.STRING,
	street: Sequelize.STRING,
	number: Sequelize.INTEGER,
	complement: Sequelize.STRING,
	district: Sequelize.STRING,
	zipcode: Sequelize.INTEGER,
	city: Sequelize.STRING,
	state: Sequelize.STRING,
	reference: Sequelize.STRING,
	location: {
		type: Sequelize.GEOMETRY('POINT'),
		allowNull: false
	}
}, {
	modelName: 'address',
	tableName: 'addresses',
	sequelize: conn,
});

export default cache.withCache(Address);