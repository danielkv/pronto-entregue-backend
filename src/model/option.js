import Sequelize  from 'sequelize';

import { withCache } from '../cache';
import conn from '../services/connection';

/*
 * Define modelo (tabela) de opções
 */

class Option extends Sequelize.Model {
	static updateAll (options, groupModel, transaction=null) {
		return Promise.all(
			options.map(async (option) => {
				let optionModel;
				if (option.action === 'create') {
					optionModel = groupModel.createOption({ ...option }, { transaction });
				} else if (option.id) {
					optionModel = await Option.findByPk(option.id);
					if (optionModel) {
						if (option.action === "remove") optionModel = groupModel.removeOption(optionModel, { transaction });
						else if (option.action === "update") return optionModel.update({ ...option, optionsGroupId: groupModel.get('id') }, { fields: ['name', 'description', 'price', 'active', 'order', 'maxSelectRestrainOther', 'optionsGroupId'], transaction });
					}
				}

				return optionModel || option;
			})
		);
	}
}
Option.init({
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	order: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
		validate: {
			notEmpty: { msg: 'Você deve definir uma ordem' },
			notNull: { msg: 'Você deve definir uma ordem' },
		}
	},
	maxSelectRestrainOther: Sequelize.INTEGER,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
	price: {
		type: Sequelize.DECIMAL(10, 2),
		set (val) {
			if (typeof val == 'string')
				this.setDataValue('price', parseFloat(val.replace(',', '.')));
			else
				this.setDataValue('price', val);
		},
		get () {
			return parseFloat(this.getDataValue('price'));
		}
	},
}, {
	modelName: 'option',
	tableName: 'options',
	sequelize: conn,
	name: { singular: 'option', plural: 'options' }
});

export default withCache(Option);