import DataLoader from 'dataloader';

import Address from '../model/address';
import { remap } from './remap';

export const addressLoader = new DataLoader(async keys => {
	const address = await Address.findAll({
		where: { id: keys },
		//order: [[literal(`FIELD(companyId, ${keys.join(', ')})`)]]
	});
	
	return remap(keys, address)
}, { cache: false })