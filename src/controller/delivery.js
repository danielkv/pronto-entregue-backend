import EventEmitter from 'events';

import JobQueue from '../factory/queue';
import CompanyMeta from '../model/companyMeta';
import Delivery from "../model/delivery";
import UserMeta from '../model/userMeta';
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

	/**
	 * Starts sending delivery men notifications
	 */
	async notifyDeliveryMen(deliveryInstance) {
		const deliveryId = deliveryInstance.get('id');

		const repeatEvery = 1000 * 60 * 4; // 4 min

		// recurrent job to notify delivery men
		// it will be removed when some delivery man is set to delivery
		JobQueue.notifications.add(`notifyDeliveryMen.first.${deliveryId}`, { deliveryId } )
		JobQueue.notifications.add(`notifyDeliveryMen.${deliveryId}`, { deliveryId }, { delay: 0, repeat: { every: 5000, limit: 3, count: 0 } } )
	}

	async setDeliveryMan(deliveryInstance, userInstance) {
		// checks if delivery has no deliverMan yet
		if (deliveryInstance.get('deliveryManId')) throw new Error('Outro entregador já aceitou essa entrega')

		// set deliveryMan user to delivery
		await deliveryInstance.setDeliveryMan(userInstance);

		// emit event
		this.emit('setDeliveryMan', { delivery: deliveryInstance, deliveryMan: userInstance })

		return deliveryInstance;
	}

	async createFromOrder(orderInstance, options) {
		const orderId = orderInstance.get('id')
		const company = await orderInstance.getCompany();
		const user = await orderInstance.getUser({
			include: [{ model: UserMeta, where: { key: 'phone' } }]
		});

		// get company contact
		const companyPhoneMeta = await CompanyMeta.findOne({ where: { companyId: company.get('id'), key: 'phone' } })
		const senderContact = companyPhoneMeta ? companyPhoneMeta.get('value') : '';

		// get user 
		const userContact = user.metas.length ? user.metas[0].value : user.get('email');

		// format data
		const deliveryData = {
			from: await company.getAddress(),
			to: splitAddress(orderInstance),
			description: `Pedido #${orderId} de ${company.get('displayName')}`,
			value: orderInstance.get('deliveryPrice'),
			receiverName: `${user.get('firstName')} ${user.get('lastName')}`,
			receiverContact: userContact,
			senderContact: senderContact,
			status: 'waiting',
			orderId
		}

		// create delivery
		const createdDelivery = await this.create(deliveryData, options);

		return createdDelivery;
	}

	async changeStatus (deliveryInstance, newStatus, ctx, options={}) {
		// check order old status to compare
		const oldStatus = deliveryInstance.get('status');
	
		// if new status is the same
		if (oldStatus === newStatus) return deliveryInstance;
	
		// check availability
		const availableStatus = ['waiting', 'waitingDelivery', 'delivering', 'delivered', 'canceled'];
		const newStatusIndex = availableStatus.findIndex((stat) => stat === newStatus);
		const orlStatusindex = availableStatus.findIndex((stat) => stat === oldStatus);
	
		// check if user can change order status
		if (!ctx.user.can('deliveryMan')) throw new Error('Você não tem permissões para alterar o status esse pedido');
		// check if newStatus is available
		if (newStatusIndex < 0) throw new Error('Esse status não é disponível para essa entrega');
		// check if can return status
		if (newStatusIndex < orlStatusindex ) throw new Error('Não é possível retornar a entrega ao status anterior');
		
		// update order status
		const updatedDelivery = await deliveryInstance.update({ status: newStatus }, { ...options, fields: ['status'] });
	
		// emit event
		this.emit('changeStatus', { delivery: updatedDelivery, newStatus, ctx });
	
		return updatedDelivery;
	}
}

export default new DeliveryController();