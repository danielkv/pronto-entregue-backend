import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de locais de entrega
 */

class DeliveryAreas extends Sequelize.Model {}
DeliveryAreas.init({
	name: {
		type: Sequelize.STRING,
		allowNull:false,
		validate : {
			notEmpty:{ msg:'Você deve definir um nome para o local de entrega' },
			notNull:{ msg:'Você deve definir um nome para o local de entrega' },
		}
	},
	type: {
		type: Sequelize.STRING,
		allowNull:false,
		comment : 'single | joker | set',
		validate: {
			notEmpty:{ msg:'O tipo do local de entrega não pode ser vazio' },
			notNull:{ msg:'O tipo do local de entrega não pode ser vazio' },
			isIn: {
				args: [['single', 'joker', 'set']],
				msg:'O tipo local de entrega é inválido',
			}
		}
	},
	zipcode_a: {
		type: Sequelize.INTEGER,
		allowNull:false,
		validate : {
			notEmpty:{ msg:'Você deve definir o CEP para o local de entrega' },
			notNull:{ msg:'Você deve definir o CEP para o local de entrega' },
		}
	},
	zipcode_b: {
		type: Sequelize.INTEGER,
		allowNull:true,
		defaultValue:null,
		comment: "In case of type is 'set'"
	},
	price: {
		type: Sequelize.DECIMAL(10,2),
		defaultValue: 0
	},
}, { modelName:'delivery_areas', underscored:true, sequelize: conn, name:{ singular:'DeliveryArea', plural:'DeliveryAreas' } });

export default DeliveryAreas;