import NodeCache from 'node-cache';
import sequelizeCache from 'sequelize-transparent-cache';

import MemoryAdaptor from './adaptor';
import { namespace } from './keys';

const adaptor = new MemoryAdaptor({
	client: new NodeCache(),
	namespace, // optional
	lifetime: 60*15    // optional - 15 minutos
})

export async function deleteMatch(match) {
	adaptor.deleteMatch(`/${match}/g`)
}

export async function flushAll() {
	const keys = this.client.keys();

	keys.forEach(k => {
		this.client.del(k);
	})
}
export default sequelizeCache(adaptor);