import Sequelize  from 'sequelize';

import cache, { cacheAdaptor } from '../cache';
import { optionsKey, optionsGroupsKey } from '../cache/keys';
import conn from '../services/connection';
import Option  from './option';

/*
 * Define modelo (tabela) de grupos de opções
 */

class OptionsGroup extends Sequelize.Model {
	static async updateAll (groups, product, transaction=null) {
		const restrictingGroups = groups.filter((g) => g.maxSelectRestrain);
		const groupsRestrictionsRel = [];

		// clean product group cache
		cacheAdaptor.deleteMatch(`/${optionsGroupsKey(product.get('id'))}/g`);
		
		//create groups
		const result = await Promise.all(
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
							groupModel = await product.createOptionsGroup(group, { transaction, fields: ['name', 'active', 'type', 'minSelect', 'maxSelect', 'order', 'priceType'] });

							groupsRestrictionsRel.push({ tempId: group.id, id: groupModel.get('id'), model: groupModel });
						} else if (group.id && group.action === 'update') {
							[groupModel] = await product.getOptionsGroups({ where: { id: group.id } });
							groupModel = await groupModel.update(group, { fields: ['name', 'active', 'type', 'minSelect', 'maxSelect', 'order', 'maxSelectRestrain', 'priceType'], transaction });

							groupsRestrictionsRel.push({ tempId: groupModel.get('id'), id: groupModel.get('id'), model: groupModel });
						}

						// clean group options cache
						cacheAdaptor.deleteMatch(`/*${optionsKey(groupModel.get('id'))}/g`);
						
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

		if (groupsRestrictionsRel.length) {
			await Promise.all(restrictingGroups
				.filter(group=>groupsRestrictionsRel.find(g => g.tempId === group.id) && groupsRestrictionsRel.find(g => g.tempId === group.maxSelectRestrain))
				.map((group) => {
					const restrainingGroup = groupsRestrictionsRel.find(g => g.tempId === group.id).model;
					const restrainedGroupId = groupsRestrictionsRel.find(g => g.tempId === group.maxSelectRestrain).id;

					return restrainingGroup.update({ maxSelectRestrain: restrainedGroupId }, { transaction });
				})
			);
		}

		return result;
	}
}

OptionsGroup.init({
	name: Sequelize.STRING,
	type: {
		type: Sequelize.ENUM('single', 'multi'),
		defaultValue: 'single',
		allowNull: false
	},
	priceType: {
		type: Sequelize.ENUM('higher', 'sum'),
		defaultValue: 'sum',
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

export default cache.withCache(OptionsGroup);