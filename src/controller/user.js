import EventEmitter from 'events';

import * as UserDefault from '../default/user'
import deserializeConfig from '../helpers/deserializeConfig';
import serealizeConfig from '../helpers/serealizeConfig';
import DB from '../model';
import { getSQLPagination } from '../utilities';
import reduceTokensMetas from '../utilities/reduceTokensMetas';

class UserControl extends EventEmitter {

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

}

const UserController = new UserControl();

export default UserController;