import Sequelize from 'sequelize';

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
	location: Sequelize.GEOMETRY('POINT')
}, {
	modelName: 'address',
	tableName: 'addresses',
	sequelize: conn,
});

export default Address;