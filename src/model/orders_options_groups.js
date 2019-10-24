const sequelize = require('../services/connection');
const Sequelize = require('sequelize');
const OrdersOptions = require('./orders_options');

/*
 * Define modelo (tabela) de grupos de opções de produtos de pedidos
 */

class OrdersOptionsGroups extends Sequelize.Model {
	static updateAll (groups, product, transaction=null) {


		//deleta grupos e opções antigas
		return OrdersOptionsGroups.destroy({where:{order_product_id: product.get('id')}, transaction})

		//cria novos grupos
		.then (()=> {
			return Promise.all(
				groups.map((group) => {
					return new Promise(async (resolve, reject) => {
						try {
							delete group.id;
							let group_model = await product.createOptionsGroup(group, {transaction});

							if (group_model) {
								if (group.options) group.options = await OrdersOptions.updateAll(group.options, group_model, transaction);
								return resolve({...group_model.get(), options: group.options});
							} else {
								return reject('Grupo não foi encontrado');
							}
						} catch (err) {
							return reject(err);
						}
					});
				})
			);
		})
		
	}
};
OrdersOptionsGroups.init({
	name: Sequelize.STRING,
}, {modelName:'orders_options_groups', underscored:true, sequelize});

module.exports = OrdersOptionsGroups;