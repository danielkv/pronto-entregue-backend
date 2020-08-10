import * as UserDefault from '../default/user';
import deserializeConfig from "../helpers/deserializeConfig";
import serealizeConfig from "../helpers/serealizeConfig";
import userMetaLoader from '../loaders/userMetaLoader';
import DB from "../model";


class UserMetaEntity {
	/**
	 * Set and return values from config table
	 * @param {*} userId 
	 * @param {*} key 
	 * @param {*} value 
	 * @param {*} type 
	 */
	async setMeta(userId, key, value, type) {
		const meta = await DB.userMeta.findOne({ where: { userId: userId, key } })
		if (!meta) {
			const valueSave = serealizeConfig(value, type);
			const created = await DB.userMeta.create({ key, userId: userId, value: valueSave, type });
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
	async getMeta(userId, key) {
		const config = await userMetaLoader.load({ key, userId: userId })
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

export default new UserMetaEntity();