'use strict';

import fs from 'fs';
import path from 'path';

const basename = path.basename(__filename);
const DB = {};

fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		const model = require(path.join(__dirname, file)).default
		DB[model.name] = model;
	});

/* Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
}); */

export default DB;
