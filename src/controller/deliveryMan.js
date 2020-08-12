import EventEmitter from 'events';

import ConfigEntity from '../entities/Config';
import DeliveryManEntity from '../entities/DeliveryManEntity';
import UserMetaEntity from '../entities/UserMetaEntity';
import DB from '../model';
import User from '../model/user';
import UserMeta from '../model/userMeta';
import { getSQLPagination } from '../utilities';
import { MAX_CONCURRENT_DELIVERIES } from '../utilities/config';
import { DELIVERY_MAN_ENABLED_META, MAX_CONCURRENT_DELIVERIES_DEFAULT, DELIVERY_MAN_ROLE } from '../utilities/deliveryMan';
import { DEVICE_TOKEN_META } from '../utilities/notifications';

const configEntity = new ConfigEntity();

class DeliveryManFactory extends EventEmitter {
	/**
	 * Checks if user has role as delivery man
	 * @param {*} userInstance 
	 */
	userIsDeliveryMan(userInstance) {
		return userInstance.get('role') === DELIVERY_MAN_ROLE;
	}

	listDeliveryMen(pagination) {
		return DB.user.findAll({
			where: { role: 'deliveryMan' },
			...getSQLPagination(pagination)
		});
	}

	/**
	 * returns open deliveries that delivery man is assigned
	 * @param {ID} userId
	 */
	getOpenDeliveries(userId) {
		return DeliveryManEntity.getOpenDeliveries(userId)
	}

	/**
	 * returns true if delivery man can be assigned to one more delivery
	 * @param {User} userInstance 
	 */
	async canAcceptDelivery(userInstance) {
		const enabled = await this.isEnabled(userInstance);
		if (!enabled) return false;

		const maxConcurrent = await configEntity.get(MAX_CONCURRENT_DELIVERIES);

		const deliveries = await this.getOpenDeliveries(userInstance);
		return deliveries.length < (maxConcurrent || MAX_CONCURRENT_DELIVERIES_DEFAULT);
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
	async isEnabled(userId) {
		// checks if user is Delviery man
		
		return UserMetaEntity.getMeta(userId, DELIVERY_MAN_ENABLED_META);
	}
	
}

const DeliveryManController = new DeliveryManFactory();

export default DeliveryManController;