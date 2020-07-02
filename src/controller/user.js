import EventEmitter from 'events';

import DB from '../model';

class UserControl extends EventEmitter {

	/**
	 * Get all tokens from users
	 * @param {String} role filter role
	 * @param {String} metaType filter meta key
	 */
	async getTokens(role, metaType) {
		const metas = await DB.userMeta.findAll({
			where: { key: metaType },
			include: {
				model: DB.user,
				where: { role },
				required: true
			}
		});

		return metas.reduce((tokens, meta)=>[...tokens, ...JSON.parse(meta.value)], [])
	}

}

const UserController = new UserControl();

export default UserController;