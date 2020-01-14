import Sequelize  from 'sequelize';

import Options  from '../model/options';
import conn from '../services/connection';

/*
 * Define modelo (tabela) de grupos de opções
 */

class OptionsGroups extends Sequelize.Model {
	static updateAll (groups, product, transaction=null) {
		return Promise.all(
			groups.map((group) => {
				let group_model;
				// eslint-disable-next-line no-async-promise-executor
				return new Promise(async (resolve, reject) => {
					try {
						if (!['create', 'remove', 'update'].includes(group.action)) return resolve(group);

						if (group.id && group.action === "remove") {
							group_model = await product.removeOptionsGroup(group_model, { transaction });
							return resolve(group_model);
						} else if (group.action === 'create') {
							group_model = await product.createOptionsGroup(group, { transaction });
						} else if (group.id && group.action === 'update') {
							[group_model] = await product.getOptionsGroups({ where:{ id:group.id } });
							group_model = await group_model.update(group, { fields:['name', 'active', 'type', 'min_select', 'max_select', 'order', 'max_select_restrain'], transaction });
						}
						
						if (group_model) {
							if (!group.remove && group.options) group.options = await Options.updateAll(group.options, group_model, transaction);
							return resolve({ ...group_model.get(), options: group.options });
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

OptionsGroups.init({
	name: Sequelize.STRING,
	type: {
		type: Sequelize.STRING(50),
		comment: 'single | multi',
		validate: {
			isIn : {
				args : [['single', 'multi']],
				msg: 'Tipo de grupo inválido'
			}
		}
	},
	order: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull:false,
		validate : {
			notEmpty:{ msg:'Você deve definir uma ordem' },
			notNull:{ msg:'Você deve definir uma ordem' },
		}
	},
	min_select: Sequelize.INTEGER,
	max_select: {
		type: Sequelize.INTEGER,
		set (val) {
			const type = this.getDataValue('type');
			if (type === 'single') return this.setDataValue('max_select', 1);
			return this.setDataValue('max_select', val);
		}
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, { modelName:'options_groups', underscored:true, sequelize: conn, name:{ singular:'OptionsGroup', plural:'OptionsGroups' } });

export default OptionsGroups;