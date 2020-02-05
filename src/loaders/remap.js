export function remap(keys, array, orderKey='id') {
	const newArray = {};
	array.forEach(arr => {
		newArray[arr.get(orderKey)] = arr;
	})

	return keys.map(key => newArray[key]);
}