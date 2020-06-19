import EventEmitter from 'events';

import UserMeta from '../model/userMeta';

class DeliveryManFactory extends EventEmitter {
	/**
	 * Checks if user has role as delivery man
	 * @param {*} userInstance 
	 */
	userIsDeliveryMan(userInstance) {
		return userInstance.get('role') === 'deliveryMan';
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
			where: { userId: userInstance.get('id'), key: 'deliveryManEnabled' }
		})

		// if meta exists, update it
		if (meta) await meta.update({ value: 'true' });
		else await userInstance.createMeta({ key: 'deliveryManEnabled', value: 'true' });

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
			where: { userId: userInstance.get('id'), key: 'deliveryManEnabled' }
		})

		// if meta exists, update it
		if (meta) await meta.update({ value: 'false' });
		// if meta does not exist create it
		else await userInstance.createMeta({ key: 'deliveryManEnabled', value: 'false' });

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
			where: { userId: userInstance.get('id'), key: 'deliveryManEnabled' }
		})

		// if meta exists return meta's value
		if (meta) return meta.get('value') === 'true';
		
		// if meta does not exist return false
		return false;
	}
	
}

const DeliveryManController = new DeliveryManFactory();

export default DeliveryManController;