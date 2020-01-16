import Sequelize from 'sequelize';

import conn from '../services/connection';

class Rating extends Sequelize.Model {}

Rating.init({
	rate: Sequelize.INTEGER,
	comment: Sequelize.TEXT,
	hidden: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
}, {
	modelName: 'rating',
	tableName: 'Ratings',
	sequelize: conn,
});

export default Rating;