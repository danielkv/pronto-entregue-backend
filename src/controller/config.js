import _ from "lodash";

import DB from "../model";

class ConfigControl {
	/**
	 * Transform config value type to save on DB
	 * @param {String} value 
	 * @param {String} type 
	 */
	serealize(value, type) {
		switch(type) {
			case 'json':
				return JSON.stringify(value);
			default:
				return _.toString(value);
		}
	}

	/**
	 * Transform config value type
	 * @param {String} value 
	 * @param {String} type 
	 */
	deserealize(value, type) {
		switch(type) {
			case 'integer':
				return _.toInteger(value);
			case 'float':
				return _.toNumber(value);
			case 'json':
				return JSON.parse(value);
			default:
				return value;
		}
	}

	/**
	 * Returns transformed values from config table
	 * @param {String} key 
	 */
	async get(key) {
		const row = await DB.config.findOne({ where: { key } })
		return this.deserealize(row.get('value'), row.get('type'))
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
			const valueSave = this.serealize(value, typeSave);
			config.update({ value: valueSave });
		} else {
			const typeSave = type || 'string';
			const valueSave = this.serealize(value, typeSave);
			config = await DB.config.create({ key, value: valueSave, type: typeSave })
		}
		
		return config;
	}
}

const ConfigController = new ConfigControl();

export default ConfigController;