import EventEmitter from 'events';
import { QueryTypes } from "sequelize";

import OrderProduct from "../model/orderProduct";
import connection from "../services/connection";
import { joinAddress } from "../utilities/address";

// pubsub vars
export const ORDER_CREATED = 'ORDER_CREATED';
export const ORDER_QTY_STATUS_UPDATED = 'ORDER_QTY_STATUS_UPDATED';
export const ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED';

class OrderController extends EventEmitter {

	async getOrderStatusQty (companyId) {
		const result = await connection.query(
			"SELECT status, Count(`order`.`id`) AS `count` FROM  `orders` AS `order` WHERE companyId = :companyId GROUP BY status",
			{
				replacements: { companyId },
				type: QueryTypes.SELECT
			});

		return { companyId, ...this.remapOrdersQty(result) };
	}

	remapOrdersQty (orders) {
		const stats = ['waiting', 'preparing', 'delivering', 'delivered', 'canceled'];
		const qty = {};

		stats.forEach(stat => {
			const qtyStat = orders.find(row => row.status === stat);
			qty[stat] = qtyStat ? qtyStat.count : 0;
		})

		return qty;
	}

	/**
	 * Create new order to the company (companyInstace)
	 * 
	 * @param {Object} data 
	 * @param {Company} companyInstance 
	 * @param {Object} options 
	 */
	async create (data, companyInstance, options) {
		// check if order has delivery address, if not throw an error
		if (data.type !== 'takeout') {
			if (!data.address) throw new Error('Pedido não tem endereço de entrega');
			const address = joinAddress(data.address);
			data = { ...data, ...address };
		}

		// create order
		const order = await companyInstance.createOrder(data, options);
	
		// create order products
		await OrderProduct.updateAll(data.products, order, options.transaction);

		// emit event
		this.emit('create', { order, company: companyInstance });
	
		return order;
	}

	/**
	 * Update the order (companyInstace)
	 * 
	 * @param {Object} data 
	 * @param {Order} orderInstance 
	 * @param {Object} options 
	 */

	async update (data, orderInstance, options) {
		if (data.status) delete data.status;

		// sanitize address
		if (data.address) {
			const address = joinAddress(data.address);
			delete data.address;
			data = { ...data, ...address };
		}

		// cannot update payment method
		if (data.paymentMethod) delete data.paymentMethod;

		// update order
		const updatedOrder = await orderInstance.update(data, options);

		// update, create, remove order products
		if (data.products) await OrderProduct.updateAll(data.products, updatedOrder, options.transaction || null);

		// emit event
		this.emit('update', { order: updatedOrder });

		return updatedOrder;
	}

	/**
	 * Change order status, all orders should go trough this function
	 * 
	 * @param {*} orderInstance 
	 * @param {*} newStatus 
	 * @param {*} options 
	 */
	async changeStatus (orderInstance, newStatus, options={}, { loggedUser }) {
	// check order old status to compare
		const oldStatus = orderInstance.get('status');

		// if new status is the same
		if (oldStatus === newStatus) return;

		// check availability
		const availableStatus = ['waiting', 'preparing', 'waitingDelivery', 'delivering', 'delivered', 'canceled'];
		const newStatusIndex = availableStatus.findIndex((stat) => stat === newStatus);
		const orlStatusindex = availableStatus.findIndex((stat) => stat === oldStatus);

		// check if newStatus is available
		if (newStatusIndex < 0) throw new Error('Esse status não é disponível para esse pedido');
		// check if can return status
		if (!loggedUser.can('master') && newStatusIndex < orlStatusindex ) throw new Error('Não é possível retornar pedido ao status anterior');
		// -> check if user can cancel order
		if (newStatus === 'canceled' && (orderInstance.get('userId') !== loggedUser.get('id') && !loggedUser.can('orders_edit'))) throw new Error('Você não tem permissões para cancelar esse pedido');
	
		// update order status
		const updatedOrder = await orderInstance.update({ status: newStatus }, { ...options, fields: ['status'] });

		// emit event
		this.emit('changeStatus', { order: updatedOrder, newStatus, loggedUser, options });

		return updatedOrder;
	}
}

export default new OrderController();