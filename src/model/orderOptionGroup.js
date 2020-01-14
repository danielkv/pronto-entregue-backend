import Sequelize  from 'sequelize';

import conn from '../services/connection';
import OrdersOptions  from './orderOption';

/*
 * Define modelo (tabela) de grupos de opções de produtos de pedidos
 */

class OrderOptionGroup extends Sequelize.Model {
	static updateAll (groups, product, transaction=null) {


		//deleta grupos e opções antigas
		return OrderOptionGroup.destroy({ where: { orderProductId: product.get('id') }, transaction })

		//cria novos grupos
			.then (()=> {
				return Promise.all(
					groups.map((group) => {
						// eslint-disable-next-line no-async-promise-executor
						return new Promise(async (resolve, reject) => {
							try {
								delete group.id;
								let groupModel = await product.createOptionsGroup(group, { transaction });

								if (groupModel) {
									if (group.options) group.options = await OrdersOptions.updateAll(group.options, groupModel, transaction);
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
			})
		
	}
}
OrderOptionGroup.init({
	name: Sequelize.STRING,
}, {
	tableName: 'order_option_groups',
	sequelize: conn
});

export default OrderOptionGroup;