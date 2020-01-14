import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de opções
 */

class Options extends Sequelize.Model {
	static updateAll (options, group_model, transaction=null) {
		return Promise.all(
			options.map(async (option) => {
				let option_model;
				if (option.action === 'create') {
					option_model = group_model.createOption({ ...option }, { transaction });
				} else if (option.id) {
					option_model = await Options.findByPk(option.id);
					if (option_model) {
						if (option.action === "remove") option_model = group_model.removeOption(option_model, { transaction });
						else if (option.action === "update") return option_model.update({ ...option, option_group_id:group_model.get('id') }, { fields:['name', 'price', 'active', 'order', 'max_select_restrain_other', 'option_group_id'], transaction });
					}
				}

				return option_model || option;
			})
		);
	}
}
Options.init({
	name: Sequelize.STRING,
	order: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull:false,
		validate : {
			notEmpty:{ msg:'Você deve definir uma ordem' },
			notNull:{ msg:'Você deve definir uma ordem' },
		}
	},
	max_select_restrain_other:Sequelize.INTEGER,
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
}, { modelName:'options', underscored:true, sequelize: conn, name:{ singular:'option', plural:'options' } });

export default Options;