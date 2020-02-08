import Sequelize  from 'sequelize';

import conn from '../services/connection';
import Option  from './option';

/*
 * Define modelo (tabela) de grupos de opções
 */

class OptionsGroup extends Sequelize.Model {
	static updateAll (groups, product, transaction=null) {
		return Promise.all(
			groups.map((group) => {
				let groupModel;
				// eslint-disable-next-line no-async-promise-executor
				return new Promise(async (resolve, reject) => {
					try {
						if (!['create', 'remove', 'update'].includes(group.action)) return resolve(group);

						if (group.id && group.action === "remove") {
							groupModel = await product.removeOptionsGroup(groupModel, { transaction });
							return resolve(groupModel);
						} else if (group.action === 'create') {
							groupModel = await product.createOptionsGroup(group, { transaction });
						} else if (group.id && group.action === 'update') {
							[groupModel] = await product.getOptionsGroups({ where: { id: group.id } });
							groupModel = await groupModel.update(group, { fields: ['name', 'active', 'type', 'minSelect', 'maxSelect', 'order', 'maxSelectRestrain'], transaction });
						}
						
						if (groupModel) {
							if (!group.remove && group.options) group.options = await Option.updateAll(group.options, groupModel, transaction);
							return resolve({ ...groupModel.get(), options: group.options });
						} else {
							return reject('Grupo não foi encontrado');
						}
					} catch (err) {
						return reject(err);
					}
				});
			})
		);
	}
}

OptionsGroup.init({
	name: Sequelize.STRING,
	type: {
		type: Sequelize.ENUM('single', 'multi'),
		defaultValue: 'single',
		allowNull: false
	},
	order: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
		validate: {
			notEmpty: { msg: 'Você deve definir uma ordem' },
			notNull: { msg: 'Você deve definir uma ordem' },
		}
	},
	minSelect: Sequelize.INTEGER,
	maxSelect: {
		type: Sequelize.INTEGER,
		set (val) {
			const type = this.getDataValue('type');
			if (type === 'single') return this.setDataValue('maxSelect', 1);
			return this.setDataValue('maxSelect', val);
		}
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, {
	modelName: 'optionsGroup',
	tableName: 'options_groups',
	sequelize: conn
});

export default OptionsGroup;