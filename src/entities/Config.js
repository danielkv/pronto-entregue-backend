import deserializeConfig from "../helpers/deserializeConfig"
import serealizeConfig from "../helpers/serealizeConfig";
import DB from "../model";

export default class ConfigEntity {
	/**
	 * Returns transformed values from config table
	 * @param {String} key 
	 */
	async get(key) {
		const row = await this.loader.load(key);
		if (!row) return null;
		
		return deserializeConfig(row.get('value'), row.get('type'))
	}
	
	/**
	 * 
	 * @param {String} key 
	 * @param {*} value 
	 */
	async set(key, value, type) {
		let config = await DB.config.findOne({ where: { key } });
		
		if (config) {
			const typeSave = config.get('type');
			const valueSave = serealizeConfig(value, typeSave);
			config.update({ value: valueSave });
		} else {
			const typeSave = type || 'string';
			const valueSave = serealizeConfig(value, typeSave);
			config = await DB.config.create({ key, value: valueSave, type: typeSave })
		}
		
		return config;
	}
}