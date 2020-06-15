export function remap(keys, array, orderKey='id', fn=(r)=>r || null) {
	return keys.map(key => {
		const res = array.find(m => m[orderKey] == key)
		return fn(res);
	})
}