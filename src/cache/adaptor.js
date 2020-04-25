export default class MemoryAdaptor {
	constructor ({ client, namespace, lifetime }) {
		this.namespace = namespace;
		this.lifetime = lifetime;
		this.client = client;

		//memory cache
	}
	
	_withNamespace (key) {
		const namespace = this.namespace
		const keyWithNamespace = namespace
			? [namespace, ...key]
			: key
		
		return keyWithNamespace.join(':')
	}
	
	async set(key, value) {
		return this.client.set(
			this._withNamespace(key),
			JSON.stringify(value),
			this.lifetime
		);
	}
		
	async get (key) {
		const data = this.client.get(this._withNamespace(key));

		if (!data) return data;
		
		return JSON.parse(data, (key, value) => {
			return value && value.type === 'Buffer'
				? Buffer.from(value.data)
				: value
		})
	}
		
	async del (key) {
		return this.client.del(this._withNamespace(key))
	}

	deleteMatch(match) {
		const keys = this.client.keys();

		const foundKeys = keys.filter(k => k.match(match));

		foundKeys.forEach(k => {
			this.client.del(k);
		})
	}
}