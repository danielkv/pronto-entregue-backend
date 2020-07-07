import EventEmitter from 'events';

import DB from '../model';
import { getSQLPagination } from '../utilities';
import reduceTokensMetas from '../utilities/reduceTokensMetas';

class UserController extends EventEmitter {

	/**
	 * Return tokens
	 * @param {Array} ids
	 * @param {Object} pagination 
	 */
	static async getTokensById(ids, metaType) {
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
	static filterUsers(where, pagination) {
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
	static async getTokensByRole(role, metaType) {
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

export default UserController;