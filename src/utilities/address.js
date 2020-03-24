import { where, fn, col, literal } from "sequelize";

function parseAddressesComponents(results) {
	if (!results.length) return [];

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
		street: comp.route ? comp.route.long_name : null,
		number: comp.street_number ? parseInt(comp.street_number.long_name) : null,
		zipcode: comp.postal_code ? parseInt(comp.postal_code.long_name.replace('-', '')) : null,
		district: comp.sublocality ? comp.sublocality.long_name : comp.sublocality_level_1 ? comp.sublocality_level_1.long_name : null,
		city: comp.administrative_area_level_2 ? comp.administrative_area_level_2.long_name : null,
		state: comp.administrative_area_level_1 ? comp.administrative_area_level_1.short_name : null,
		location: { type: 'Point', coordinates: comp.location },
	}))

	// checks if all data is filled
	return addresses;
}

export function whereCompanyDistance({ coordinates }, companyTableStr='company', addressColumun) {
	if (!coordinates) throw new Error('Endereço não encontrado');
	const userPoint = pointFromCoordinates(coordinates);
	const addressColumunStr = addressColumun || `${companyTableStr}.address.location`;

	return where(fn('ST_Distance_Sphere', userPoint, col(addressColumunStr)), '<', literal(`(SELECT Max(distance) * 1000 FROM delivery_areas WHERE companyid = ${companyTableStr}.id)`))
}

export function pointFromCoordinates(coordinates) {
	return fn('ST_GeomFromText', literal(`'POINT(${coordinates[0]} ${coordinates[1]})'`));
}