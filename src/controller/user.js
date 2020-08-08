import DataLoader from 'dataloader';
import EventEmitter from 'events';

import * as UserDefault from '../default/user'
import deserializeConfig from '../helpers/deserializeConfig';
import serealizeConfig from '../helpers/serealizeConfig';
import DB from '../model';
import { getSQLPagination } from '../utilities';
import reduceTokensMetas from '../utilities/reduceTokensMetas';

class UserControl extends EventEmitter {
	constructor () {
		super();

		this.metaLoader = new DataLoader(async values => {
			const userIds = values.map(k => k.userId);
			const keys = values.map(k => k.key);
			const metas = await DB.companyMeta.findAll({
				where: { key: keys, userId: userIds }
			});

			return values.map(v => {
				const config = metas.find(c => c.userId == v.userId && c.key == v.key);
				if (config) return config;

				return null;
			});
		}, { cache: false })
	}

	/**
	 * Return tokens
	 * @param {Array} ids
	 * @param {Object} pagination 
	 */
	async getTokensById(ids, metaType) {
		if (!metaType) throw new Error('metaType não definido');
		
		const query = {
			where: { userId: ids, key: metaType },
		}

		const metas = await DB.userMeta.findAll(query)

		return reduceTokensMetas(metas);
	}

	/**
	 * Filter users
	 * @param {Object} where
	 * @param {Object} pagination 
	 */
	filterUsers(where, pagination) {
		const query = {
			where,
			include: [{ model: DB.order, required: false }],
			...getSQLPagination(pagination),
		}

		return DB.user.findAll(query);
	}

	/**
	 * Get all tokens from users
	 * @param {String} role filter role
	 * @param {String} metaType filter meta key
	 */
	async getTokensByRole(role, metaType) {
		const metas = await DB.userMeta.findAll({
			where: { key: metaType },
			include: {
				model: DB.user,
				where: { role },
				required: true
			}
		});

		return reduceTokensMetas(metas);
	}

	/**
	 * Set and return values from config table
	 * @param {*} companyId 
	 * @param {*} key 
	 * @param {*} value 
	 * @param {*} type 
	 */
	async setConfig(companyId, key, value, type) {
		const meta = await DB.companyMeta.findOne({ where: { companyId, key } })
		if (!meta) {
			const valueSave = serealizeConfig(value, type);
			const created = await DB.companyMeta.create({ key, companyId, value: valueSave, type });
			return deserializeConfig(created.value, type);
		} else {
			const typeSave = type ? type : meta.type;
			const valueSave = serealizeConfig(value, typeSave);
			const updated = await meta.update({ key, value: valueSave, type: typeSave });
			return updated.value;
		}
	}

	/**
	 * Returns values from config table
	 * @param {String} key 
	 */
	async getConfig(companyId, key) {
		const config = await this.metaLoader.load({ key, companyId })
		if (config) {
			let typeDeserialize = config.type;
			if (!config.type) {
				switch (key) {
					case 'deliveryManEnabled':
						typeDeserialize = 'boolean'
						break;
					default:
						typeDeserialize = 'string'
				}
			}
			return deserializeConfig(config.value, typeDeserialize);
		}

		//check for default value
		const defaultValue = UserDefault[key];
		if (defaultValue) return defaultValue();
		
		return;
	}

}

const UserController = new UserControl();

export default UserController;