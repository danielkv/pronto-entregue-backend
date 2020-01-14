import Sequelize  from 'sequelize';

import conn from '../services/connection';
import OrdersOptionsGroups  from './orders_options_groups';

/*
 * Define modelo (tabela) de pedidos
 */

class OrdersProducts extends Sequelize.Model {
	static updateAll(products, order, transaction) {
		return Promise.all(
			products.map(product => {
				// eslint-disable-next-line no-async-promise-executor
				return new Promise(async (resolve, reject)=>{
					let product_model;
					try {
						if (!['create', 'remove', 'update'].includes(product.action)) return resolve(product);
						
						if (product.id && product.action === "remove") {
							product_model = await order.removeProduct(product_model, { transaction });
							return resolve(product_model);
						} else if (product.action === 'create') {
							if (product.id) delete product.id;
							product_model = await order.createProduct(product, { transaction })
						} else if (product.id && product.action === 'update') {
							[product_model] = await order.getProducts({ where:{ id:product.id } });
							product_model = await product_model.update(product, { fields:['name', 'quantity'], transaction });
						}
						
						if (product_model) {
							if (!product.remove && product.options_groups) product.options_groups = await OrdersOptionsGroups.updateAll(product.options_groups, product_model, transaction);
							return resolve({ ...product_model.get(), options_groups: product.options_groups });
						} else {
							return reject('O Produto não foi encontrado');
						}
					} catch (err) {
						return reject(err);
					}
				})
			})
		)
	}
}
OrdersProducts.init({
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey:true,
		autoIncrement:true
	},
	quantity: Sequelize.INTEGER,
	name: Sequelize.STRING,
	price: Sequelize.DECIMAL(10,2),
	message: Sequelize.STRING,
}, { tableName:'orders_products', underscored:true, sequelize: conn });

export default OrdersProducts;