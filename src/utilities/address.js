function parseAddressesComponents(results) {
	return results.map(result => {
		const componentTypes = {
			location: [result.geometry.location.lat, result.geometry.location.lng]
		};
		result.address_components.forEach(component => {
			component.types.forEach(type => {
				componentTypes[type] = { long_name: component.long_name, short_name: component.short_name }
			})
		})
		return componentTypes;
	})
}

export function parseAddresses(results) {
	const addresses = parseAddressesComponents(results).map(comp => ({
		street: comp.route.long_name,
		number: comp.street_number.long_name ? parseInt(comp.street_number.long_name) : null,
		zipcode: comp.postal_code.long_name ? parseInt(comp.postal_code.long_name.replace('-', '')) : null,
		district: comp.sublocality.long_name || comp.sublocality_level_1.long_name,
		city: comp.administrative_area_level_2.long_name,
		state: comp.administrative_area_level_1.short_name,
		location: { type: 'Point', coordinates: comp.location },
	}))

	// checks if all data is filled
	return addresses.filter(addr => (
		addr.street &&
		addr.number &&
		addr.zipcode &&
		addr.district &&
		addr.city &&
		addr.state &&
		addr.location
	))
}