import EventEmitter from 'events';

import UserMeta from '../model/userMeta';

class UserControl extends EventEmitter {

	/**
	 * Get all tokens from users
	 * @param {String} role filter role
	 * @param {String} metaType filter meta key
	 */
	async getTokens(role, metaType) {
		const metas = await UserMeta.findAll({
			where: { key: metaType },
			input: {
				model: UserMeta,
				where: { role }
			}
		});

		return metas.reduce((tokens, meta)=>[...tokens, ...JSON.parse(meta.value)], [])
	}

}

const UserController = new UserControl();

export default UserController;