import DataLoader from 'dataloader';

import Address from '../model/address';
import User from '../model/user';
import UserAddress from '../model/UserAddresses';
import { remap } from './remap';

export const addressLoader = new DataLoader(async keys => {
	const address = await Address.findAll({
		where: { id: keys },
		//order: [[literal(`FIELD(companyId, ${keys.join(', ')})`)]]
	});
	
	return remap(keys, address)
}, { cache: false })

export const userAddressesIdsLoader = new DataLoader(async keys => {
	const allAddressesIds = await UserAddress.findAll({
		where: { userId: keys },
		order: [['userId']]
	});
	
	return keys.map(key => {
		const userAddressIds = allAddressesIds.filter(addressId => addressId.userId === key);

		return userAddressIds.map(instance => instance.get('addressId'));
	})
}, { cache: false })