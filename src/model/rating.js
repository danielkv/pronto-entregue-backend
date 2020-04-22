import Sequelize from 'sequelize';

import cache from '../cache';
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
	tableName: 'ratings',
	sequelize: conn,
});

export default cache.withCache(Rating);