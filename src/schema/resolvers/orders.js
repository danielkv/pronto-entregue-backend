const sequelize = require('../services/connection');
const Sequelize = require('sequelize');
const OrdersProducts = require('../model/orders_products');
const OrdersOptionsGroups = require('../model/orders_options_groups');
const OrdersOptions = require('../model/orders_options');

/**
 * Cria pedido a partir da filial e vincula usuário
 * 
 */

function create (req, res, next) {
	const {branch, user} = req;
	const order_data = req.body;

	sequelize.transaction(transaction => {
		if (!order_data.products.length) throw new Error('Esse pedido não tem nenhum produto');
		return branch.createOrder(order_data, {transaction})
		.then(async (order)=>{
			if (!order) throw new Error('Pedido não pôde ser criado');

			//Vincula pedido ao usuário
			await order.setUser(user, {transaction});

			const products = await OrdersProducts.updateAll(order_data.products, order, transaction);

			return {...order.get(), products}
		});
	})
	.then((created)=>{
		return res.send(created);
	})
	.catch(next);
}

/**
 * Retorna um array com pedidos vinculados a filial
 * 
 */

function list (req, res, next) {
	const {branch} = req;

	branch.getOrders()
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Retorna pedido, produtos, grupos de opções e opções vinculados a filial
 * 
 * @param order_id {int} ID do pedido a ser retornado
 */

function read (req, res, next) {
	const {branch} = req;
	const {order_id} = req.params;

	branch.getOrders({where:{id:order_id}, include:[{model:OrdersProducts, include:[{model:OrdersOptionsGroups, include:[OrdersOptions]}]}]})
	.then(([order])=>{
		if (!order) throw new Error('Produto não encontrado');
		res.send(result);
	})
	.catch(next);
}

/**
 * Atualiza/altera pedido
 * 
 */

function update (req, res, next) {
	const {branch} = req;
	const {order_id} = req.params;
	const order_data = req.body;

	sequelize.transaction(transaction => {
		return branch.getOrders({where:{id:order_id}})
		.then(async ([order])=>{
			if (!order) throw new Error('Pedido não encontrado');

			await order.update(order_data, {fields:['payment_fee', 'delivery_price', 'price', 'discount', 'message', 'street', 'number', 'complement', 'city', 'state', 'district', 'zipcode'], transaction})

			const products = await OrdersProducts.updateAll(order_data.products, branch, order, transaction);

			return {...order.get(), products};
		});
	})
	.then((updated)=>{
		return res.send(updated);
	})
	.catch(next);
}

module.exports = {
	//default
	create,
	list, 
	read,
	update,
}