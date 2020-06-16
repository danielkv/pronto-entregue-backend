import EventEmitter from 'events';

import Delivery from "../model/delivery";
import User from "../model/user";
import { joinAddress, splitAddress } from "../utilities/address";

class DeliveryController extends EventEmitter {

	async create(data, options) {
	// check if buyer is defined
		if (!data.userId && !data.orderId) throw new Error('Entrega deve ter um comprador. Um pedido relactionado à uma empresa ou um usuário do app');

		// join addresses
		const addressFrom = joinAddress(data.from, 'From');
		const addressTo = joinAddress(data.to, 'To');
		data = { ...data, ...addressTo, ...addressFrom };

		//create delivery row in DB
		const createdDelivery = await Delivery.create(data, options);
	
		// emit event
		this.emit('create', { delivery: createdDelivery });

		// return data
		return createdDelivery;
	}

	async setDeliveryMan(deliveryInstance, userId) {
		const user = User.cache().findByPk(userId);
		if (!user) throw new Error('Usuário não encontrado');

		// check if user is delivery man
		if (user.get('role') !== 'deliveryMan') throw new Error('Esse usuário não é um entregador')

		// set deliveryMan user to delivery
		await deliveryInstance.setDeliveryMan(user);

		this.emit('setDeliveryMan', { delivery: deliveryInstance, deliveryMan: user })

		return user;
	}

	async createFromOrder(orderInstance, companyInstance, options) {
		const orderId = orderInstance.get('id')

		const deliveryData = {
			from: await companyInstance.getAddress(),
			to: splitAddress(orderInstance),
			description: `Pedido #${orderId} de ${companyInstance.get('displayName')}`,
			value: orderInstance.get('deliveryPrice'),
			status: 'waiting',
			orderId
		}

		const createdDelivery = await this.create(deliveryData, options);

		return createdDelivery;
	}

	async changeStatus (deliveryInstance, newStatus, options={}, { loggedUser }) {
		// check order old status to compare
		const oldStatus = deliveryInstance.get('status');
	
		// if new status is the same
		if (oldStatus === newStatus) return;
	
		// check availability
		const availableStatus = ['waiting', 'waitingDelivery', 'delivering', 'delivered', 'canceled'];
		const newStatusIndex = availableStatus.findIndex((stat) => stat === newStatus);
		const orlStatusindex = availableStatus.findIndex((stat) => stat === oldStatus);
	
		// check if newStatus is available
		if (newStatusIndex < 0) throw new Error('Esse status não é disponível para essa entrega');
		// check if can return status
		if (newStatusIndex < orlStatusindex ) throw new Error('Não é possível retornar pedido ao status anterior');
		// -> check if user can cancel order
		if (!loggedUser.can('delivery_edit')) throw new Error('Você não tem permissões para cancelar esse pedido');
		
		// update order status
		const updatedDelivery = await deliveryInstance.update({ status: newStatus }, { ...options, fields: ['status'] });
	
		// emit event
		this.emit('changeStatus', { delivery: updatedDelivery, newStatus, loggedUser });
	
		return updatedDelivery;
	}
}

export default new DeliveryController();