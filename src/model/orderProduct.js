import Sequelize  from 'sequelize';

import conn from '../services/connection';
import OrdersOptionsGroups  from './orderOptionsGroup';

/*
 * Define modelo (tabela) de pedidos
 */

class OrderProduct extends Sequelize.Model {
	static updateAll(products, order, transaction) {
		return Promise.all(
			products.map(product => {
				// eslint-disable-next-line no-async-promise-executor
				return new Promise(async (resolve, reject)=>{
					let productModel;
					try {
						if (!['create', 'remove', 'update'].includes(product.action)) return resolve(product);
						
						if (product.id && product.action === "remove") {
							productModel = await order.removeProduct(productModel, { transaction });
							return resolve(productModel);
						} else if (product.action === 'create') {
							if (product.id) delete product.id;
							productModel = await order.createProduct(product, { transaction })
						} else if (product.id && product.action === 'update') {
							[productModel] = await order.getProducts({ where: { id: product.id } });
							productModel = await productModel.update(product, { fields: ['name', 'quantity'], transaction });
						}
						
						if (productModel) {
							if (!product.remove && product.optionsGroups) product.optionsGroups = await OrdersOptionsGroups.updateAll(product.optionsGroups, productModel, transaction);
							return resolve({ ...productModel.get(), optionsGroups: product.optionsGroups });
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
OrderProduct.init({
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
	},
	quantity: Sequelize.INTEGER,
	name: Sequelize.STRING,
	price: Sequelize.DECIMAL(10,2),
	message: Sequelize.STRING,
}, {
	modelName: 'orderProduct',
	tableName: 'order_products',
	sequelize: conn
});

export default OrderProduct;