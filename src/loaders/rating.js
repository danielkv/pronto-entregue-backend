import DataLoader from 'dataloader';

import User from '../model/user';
import { remap } from './remap';

export const ratingUserLoader = new DataLoader(async keys => {
	const users = await User.findAll({
		where: { id: keys },
		//order: [[literal(`FIELD(userId, ${keys.join(', ')})`)]]
	})

	return remap(keys, users)
}, { cache: false })