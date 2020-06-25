import EventEmitter from 'events';
import { Op } from 'sequelize';

import User from '../model/user';
import UserMeta from '../model/userMeta';
import { DELIVERY_MAN_ENABLED_META, MAX_CONCURRENT_DELIVERIES, DELIVERY_MAN_ROLE } from '../utilities/deliveryMan';
import { DEVICE_TOKEN_META } from '../utilities/notifications';

class DeliveryManFactory extends EventEmitter {
	/**
	 * Checks if user has role as delivery man
	 * @param {*} userInstance 
	 */
	userIsDeliveryMan(userInstance) {
		return userInstance.get('role') === DELIVERY_MAN_ROLE;
	}

	/**
	 * returns open deliveries that delivery man is assigned
	 * @param {User} userInstance 
	 */
	getOpenDeliveries(userInstance) {
		return userInstance.getDeliveries({ where: { status: { [Op.notIn]: ['delivered', 'canceled'] } } });
	}

	/**
	 * returns true if delivery man can be assigned to one more delivery
	 * @param {User} userInstance 
	 */
	async canAcceptDelivery(userInstance) {
		const enabled = await this.isEnabled(userInstance);
		if (!enabled) return false;

		const deliveries = await this.getOpenDeliveries(userInstance);
		return deliveries.length < MAX_CONCURRENT_DELIVERIES;
	}

	/**
	 * Return active (enabled) delivery men (users)
	 */
	getEnabled() {
		return User.findAll({
			where: { role: 'deliveryMan', active: true },
			include: [{
				model: UserMeta,
				required: true,
				where: [
					{ key: DELIVERY_MAN_ENABLED_META, value: 'true' },
				]
			}]
		})
	}
	
	/**
	 * Return active (enabled) delivery men (users) tokens
	 */
	async getEnabledTokens() {

		//temp
		const users = await this.getEnabled();

		const tokensMetas = await UserMeta.findAll({
			where: { key: DEVICE_TOKEN_META, userId: users.map(u => u.get('id')) }
		})

		return tokensMetas.reduce((tokens, meta) => {
			return [...tokens, ...JSON.parse(meta.get('value'))]
		}, []);
	}

	/**
	 * Enable user to receive deliveries
	 * @returns {boolean}
	 */
	async enable(userInstance) {
		// checks if user is Delviery man
		if (!this.userIsDeliveryMan(userInstance)) throw new ('Usuário não é um entregador')

		// get meta
		const meta = await UserMeta.findOne({
			where: { userId: userInstance.get('id'), key: DELIVERY_MAN_ENABLED_META }
		})

		// if meta exists, update it
		if (meta) await meta.update({ value: 'true' });
		else await userInstance.createMeta({ key: DELIVERY_MAN_ENABLED_META, value: 'true' });

		// emit envet
		this.emit('enable', { user: userInstance })

		return userInstance;
	}
	/**
	 * Disable user to receive deliveries
	 * @returns {boolean}
	 */
	async disable(userInstance) {
		// checks if user is Delviery man
		if (!this.userIsDeliveryMan(userInstance)) throw new ('Usuário não é um entregador')

		// get meta
		const meta = await UserMeta.findOne({
			where: { userId: userInstance.get('id'), key: DELIVERY_MAN_ENABLED_META }
		})

		// if meta exists, update it
		if (meta) await meta.update({ value: 'false' });
		// if meta does not exist create it
		else await userInstance.createMeta({ key: DELIVERY_MAN_ENABLED_META, value: 'false' });

		this.emit('disable', { user: userInstance })

		return userInstance;
	}

	/**
	 * Checks if user is enabled as DeliveryMan
	 * @param {*} userInstance 
	 */
	async isEnabled(userInstance) {
		// checks if user is Delviery man
		if (!this.userIsDeliveryMan(userInstance)) return false;

		// get meta
		const meta = await UserMeta.findOne({
			where: { userId: userInstance.get('id'), key: DELIVERY_MAN_ENABLED_META }
		})

		// if meta exists return meta's value
		if (meta) return meta.get('value') === 'true';
		
		// if meta does not exist return false
		return false;
	}
	
}

const DeliveryManController = new DeliveryManFactory();

export default DeliveryManController;