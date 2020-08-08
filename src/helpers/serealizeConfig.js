import _ from 'lodash';
/**
 * Transform config value type to save on DB
 * @param {String} value 
 * @param {String} type 
 */
export default function serealizeConfig (value, type) {
	switch(type) {
		case 'json':
			return JSON.stringify(value);
		default:
			return _.toString(value);
	}
}