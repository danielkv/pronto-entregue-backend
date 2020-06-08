import Sequelize, { Op, fn } from 'sequelize';

import conn from '../services/connection';
import Company from './company';
import Order from './order';
import Product from './product';
import Sale from './sale';
import User from './user';

class Coupon extends Sequelize.Model {
	async isValid(order) {
		console.log('VALIDATION')
		let rulesWhere = {};
		let include = [];

		if (order.useCredits) throw new Error('Não é possível aplicar um cupom em um pedido pago com créditos');

		// check coupon companies restrictions
		if (order.companyId) {
			include = [...include, Company]
			rulesWhere['$companies.id$'] = {
				[Op.or]: [
					order.companyId,
					{ [Op.is]: null }
				]
			}
		}

		// check coupon products restrictions
		if (order.products.length) {
			include = [...include, { model: Product, include: [{ model: Sale, where: { active: true, removed: false } }] }]
			
			rulesWhere[Op.or] = [
				{ ['$products.sales.id$']: null },
				{
					[Op.or]: [
						{ ['$products.sales.startsAt$']: { [Op.gt]: fn('NOW') } },
						{ ['$products.sales.expiresAt$']: { [Op.lt]: fn('NOW') } }
					]
				}
			];
			
			rulesWhere['$products.id$'] = {
				[Op.or]: [
					order.products.map(prod => prod.productRelatedId),
					{ [Op.is]: null }
				]
			}
		}

		// check coupon user restrictions
		if (order.userId) {
			include = [...include, User]
			rulesWhere['$users.id$'] = {
				[Op.or]: [
					order.userId,
					{ [Op.is]: null }
				]
			}
		}

		// check coupon
		const couponFound = await Coupon.findOne({
			where: { id: this.get('id'), ...rulesWhere },
			include
		})
		if (!couponFound) throw new Error('Cupom inválido para esse pedido');

		// check first purchase
		if (order.userId && this.get('onlyFirstPurchases')) {
			const countOrders = await Order.count({ where: { userId: order.userId } })
			if (countOrders > 0) throw new Error('Esse cupom é válido apenas para o primeiro pedido');
		}

		// check maxPurchases
		if (this.get('maxPurchases') > 0) {
			const countOrders = this.countOrders();
			if (countOrders >= this.get('maxPurchases')) throw new Error('Esse cupom atingiu o limite de pedidos');
		}

		// check maxPerUser
		if (order.userId && this.get('maxPerUser') > 0) {
			const countOrders = await this.countOrders({ where: { id: order.userId } });
			
			if (countOrders >= this.get('maxPerUser')) throw new Error('Esse cupom atingiu o limite de pedidos por usuário');
		}

		// check minValue
		if (this.get('minValue') > 0) {
			if (order.price + order.discount < this.get('minValue')) throw new Error('O pedido não tem o valor mínimo para usar esse cupom');
		}
		
		// check maxValue
		if (this.get('maxValue') > 0) {
			if (order.price + order.discount > this.get('maxValue')) throw new Error('Esse cupom não é válido para pedidos nesse valor');
		}

		return true;
	}
}
Coupon.init({
	name: Sequelize.STRING,
	image: Sequelize.TEXT,
	startsAt: Sequelize.DATE,
	expiresAt: Sequelize.DATE,
	description: Sequelize.STRING,
	masterOnly: {
		comment: 'Se verdadeiro, apenas usuário master consegue alterar',
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
	onlyFirstPurchases: {
		comment: 'Se verdadeiro, apenas válido apenas para primeira compra de cada usuário',
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
	
	featured: {
		comment: 'Se verdadeiro, usuário pode pegar cupom na home do app',
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
	
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
	taxable: {
		comment: 'Porcentagem do cupom que será pago pelo estabelecimento',
		type: Sequelize.DECIMAL(10,2),
		defaultValue: 100,
	},
	maxPerUser: {
		type: Sequelize.INTEGER,
		defaultValue: 1,
	},
	maxPurchases: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	minValue: {
		type: Sequelize.DECIMAL(10,2),
		defaultValue: 0,
	},
	maxValue: {
		type: Sequelize.DECIMAL(10,2),
		defaultValue: 0,
	},

	valueType: {
		type: Sequelize.ENUM('value', 'percentage'),
		defaultValue: 'percentage',
		allowNull: false
	},
	value: Sequelize.DECIMAL(2),
	freeDelivery: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	}
}, {
	modelName: 'coupon',
	tableName: 'coupons',
	sequelize: conn,
});

export default Coupon;