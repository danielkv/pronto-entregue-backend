import EventEmitter from 'events';

import User from '../model/user';
import UserMeta from '../model/userMeta';
import { DELIVERY_MAN_ENABLED_META } from '../utilities/deliveryMan';
import { DEVICE_TOKEN_META } from '../utilities/notifications';

class DeliveryManFactory extends EventEmitter {
	/**
	 * Checks if user has role as delivery man
	 * @param {*} userInstance 
	 */
	userIsDeliveryMan(userInstance) {
		return userInstance.get('role') === this.DELIVERY_MAN_ROLE;
	}

	/**
	 * Return active (enabled) delivery men (users)
	 */
	getEnabled() {
		return User.findAll({
			where: { role: 'deliveryMan' },
			include: [{
				model: UserMeta,
				required: true,
				where: [
					{ key: [DELIVERY_MAN_ENABLED_META, DEVICE_TOKEN_META] },
				]
			}]
		})
	}
	
	/**
	 * Return active (enabled) delivery men (users) tokens
	 */
	async getEnabledTokens() {
		const users = await this.getEnabled();

		return users.reduce((tokens, user) => {
			const tokenMeta = user.metas.find(m => m.key === DEVICE_TOKEN_META);
			return [...tokens, ...JSON.parse(tokenMeta.value)]
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
			where: { userId: userInstance.get('id'), key: this.DELIVERY_MAN_ENABLED_META }
		})

		// if meta exists, update it
		if (meta) await meta.update({ value: 'true' });
		else await userInstance.createMeta({ key: this.DELIVERY_MAN_ENABLED_META, value: 'true' });

		// emit envet
		this.emit('enable', { user: userInstance })

		return true;
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
			where: { userId: userInstance.get('id'), key: this.DELIVERY_MAN_ENABLED_META }
		})

		// if meta exists, update it
		if (meta) await meta.update({ value: 'false' });
		// if meta does not exist create it
		else await userInstance.createMeta({ key: this.DELIVERY_MAN_ENABLED_META, value: 'false' });

		this.emit('disable', { user: userInstance })

		return true;
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
			where: { userId: userInstance.get('id'), key: this.DELIVERY_MAN_ENABLED_META }
		})

		// if meta exists return meta's value
		if (meta) return meta.get('value') === 'true';
		
		// if meta does not exist return false
		return false;
	}
	
}

const DeliveryManController = new DeliveryManFactory();

export default DeliveryManController;