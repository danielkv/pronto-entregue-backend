import EventEmitter from 'events';
import Sequelize, { QueryTypes } from "sequelize";

import DB from '../model';
import OrderProduct from "../model/orderProduct";
import UserMeta from '../model/userMeta';
import connection from "../services/connection";
import { joinAddress } from "../utilities/address";

// pubsub vars
export const ORDER_CREATED = 'ORDER_CREATED';
export const ORDER_QTY_STATUS_UPDATED = 'ORDER_QTY_STATUS_UPDATED';
export const ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED';

class OrderControl extends EventEmitter {

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
	async create (data, companyInstance, options, ctx) {
		//validate order data
		const validation = await this.validate(data, companyInstance, ctx);

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
		this.emit('create', { order, company: companyInstance, ...validation });
	
		return order;
	}

	async validate (data, companyInstance, ctx) {
		// check if company is open
		let closedBuy = false;

		const products = await DB.product.findAll({ where: { id: data.products.map(prod=>prod.productRelatedId) } })
		
		// check if all products are active
		if (products.some(product => product.active === false))
			throw new Error('Há produtos que não estão mais ativos no seu pedido, por favor verifique sua cesta e tente novamente.')

		// check if there is any scheduable products and cart scheduledTo is set
		products.forEach(product=>{
			const scheduleEnabled = product.get('scheduleEnabled');
			if (scheduleEnabled && scheduleEnabled === true && !data.scheduledTo)
				throw new Error('Há produtos sob encomenda nesse pedido. Verifique se está utilizando a versão mais atualizada do app.');
		})

		const res = await DB.companyMeta.findOne({
			attributes: [
				[Sequelize.fn('COMPANY_IS_OPEN', Sequelize.col('value')), 'isOpen'],
				[Sequelize.fn('COMPANY_ALLOW_BUY_CLOSED_BY_ID', Sequelize.col('companyId')), 'allowBuyClosed'],
			],
			where: { key: 'businessHours', companyId: companyInstance.get('id') }
		});

		const isOpen = res.get('isOpen');
		const allowBuyClosed = res.get('allowBuyClosed');

		if (!isOpen) {
			if (!allowBuyClosed) throw new Error(`${companyInstance.get('displayName')} está fechado no momento`);
			else {
				if (!data.scheduledTo && allowBuyClosed === 'onlyScheduled')
					throw new Error(`${companyInstance.get('displayName')} está fechado no momento, tente mais tarde`);
				closedBuy = true;
			}
		}

		return {
			closedBuy,
			ctx
		}

	}

	/**
	 * Returns notification tokens of order user
	 * 
	 * @param {ID} userId 
	 * @param {String} metaType 
	 */
	async getUserTokens(userId, metaType) {
		const pushTokenMeta = await UserMeta.findOne({
			where: { userId, key: metaType }
		})
		if (!pushTokenMeta) return [];

		return JSON.parse(pushTokenMeta.value);
	}

	/**
	 * Update the order (companyInstace)
	 * 
	 * @param {Object} data 
	 * @param {Order} orderInstance 
	 * @param {Object} options 
	 */

	async update (data, orderInstance, options) {
		const oldOrder = orderInstance.get();
		
		// don't allow update status
		if (data.status) delete data.status;

		// cannot update companyId
		if (data.companyId) delete data.companyId;

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
		this.emit('update', { oldOrder, order: updatedOrder });

		return updatedOrder;
	}

	/**
	 * Change order status, all orders should go trough this function
	 * 
	 * @param {Order} orderInstance 
	 * @param {String} newStatus 
	 * @param {Object} ctx Context
	 * @param {Object} options 
	 */
	async changeStatus (orderInstance, newStatus, ctx, options={} ) {
	// check order old status to compare
		const oldStatus = orderInstance.get('status');
		const oldOrder = orderInstance.get();

		// if new status is the same
		if (oldStatus === newStatus) return orderInstance;

		// check availability
		const availableStatus = ['paymentPending', 'waiting', 'scheduled', 'preparing', 'waitingDelivery', 'waitingPickUp', 'delivering', 'delivered', 'canceled'];
		const newStatusIndex = availableStatus.findIndex((stat) => stat === newStatus);
		const orlStatusindex = availableStatus.findIndex((stat) => stat === oldStatus);

		// check if newStatus is available
		if (newStatusIndex < 0) throw new Error('Esse status não é disponível para esse pedido');
		// check if can return status
		if ((ctx && !ctx.user.can('master')) && newStatusIndex < orlStatusindex ) throw new Error('Não é possível retornar pedido ao status anterior');
		// -> check if user can cancel order
		if (newStatus === 'canceled' && (orderInstance.get('userId') !== ctx.user.get('id') && !ctx.user.can('orders_edit'))) throw new Error('Você não tem permissões para cancelar esse pedido');
	
		// update order status
		const updatedOrder = await orderInstance.update({ status: newStatus }, { ...options, fields: ['status'] });

		// emit event
		this.emit('changeStatus', { oldOrder, order: updatedOrder, oldStatus, newStatus, ctx, options });

		return updatedOrder;
	}

	/**
	 * Return title and body for status changes notifications
	 */

	getNotificationMessage(orderId, newStatus) {
		const finalTexts = ['Parece estar delicioso! 😋', 'Se faltar um pouco, foi culpa minha 😂😂', 'Deveria ter pedido um desse também... 😔', 'Se atrasar é porque comi. 😖']
		const pickUpFinals = ['Corre pra pegar o pedido 🏃🏃', 'Hmm, tá aqui do lado, não sei se aguento 🤭', 'Só vim buscar que eu guardo pra você 👊']
	
		const selectedFinalTextPickUp = pickUpFinals[Math.floor(Math.random() * pickUpFinals.length)];
		const selectedFinalText = finalTexts[Math.floor(Math.random() * finalTexts.length)];
		
		switch(newStatus) {
			case 'preparing':
				return {
					title: 'Seu pedido mudou de status',
					body: `O Pedido #${orderId} está sendo preparado. ${selectedFinalText}`
				};
			/* case 'scheduled':
				return {
					title: 'Seu pedido já foi recebido',
					body: `O Pedido #${orderId} já foi agendado pelo estabelecimento. Pode ficar tranquilo que vamos te avisar próximo do horário que você agendou.`
				}; */
			case 'waitingPickUp':
				return {
					title: 'Seu pedido está pronto',
					body: `O pedido #${orderId} está aguardando a retirada. ${selectedFinalTextPickUp}`
				};
			case 'delivering':
				return {
					title: 'Seu pedido está a caminho',
					body: `O pedido #${orderId} já está a caminho do seu endereço. ${selectedFinalText}`
				};
			case 'delivered':
				return null;
			case 'canceled':
				return {
					title: 'Seu pedido foi marcado como cancelado',
					body: `O pedido #${orderId} foi cancelado. 😭`
				};
			case 'waiting':
			default:
				return null;
		}
	}
}

const OrderController = new OrderControl();

export default OrderController;