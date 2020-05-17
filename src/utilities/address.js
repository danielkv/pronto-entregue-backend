import { where, fn, literal } from "sequelize";

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

export function CompanyAreaSelect(type, { coordinates }, companyTable='company') {
	if (!coordinates) throw new Error('Endereço não encontrado');
	const userPoint = pointFromCoordinates(coordinates, true);
	const tables = { typeDelivery: 'delivery_areas', typePickUp: 'view_areas' };

	const tableName = tables[type];

	return literal(`(SELECT COUNT(id) FROM \`${tableName}\` WHERE companyId = \`${companyTable}\`.\`id\` AND ST_Distance_Sphere(${userPoint}, center) <= radius)`)
}

export function CompanyAreaAttribute(type, location, companyTable='company') {

	return [CompanyAreaSelect(type, location, companyTable), type]
}

// deprecated
export function whereCompanyDeliveryArea({ coordinates }, companyTable='company') {
	if (!coordinates) throw new Error('Endereço não encontrado');
	const userPoint = pointFromCoordinates(coordinates, true);
	//const addressColumunStr = addressColumun || `${companyTableStr}.address.location`;

	return where(literal(`SELECT COUNT(id) FROM delivery_areas WHERE companyId = \`${companyTable}\`.\`id\` AND ST_Distance_Sphere(${userPoint}, center) <= radius`), '>', 0)
}

export function pointFromCoordinates(coordinates, raw=false) {
	if (!raw)
		return fn('ST_GeomFromText', literal(`'POINT(${coordinates[0]} ${coordinates[1]})'`));

	return `ST_GeomFromText('POINT(${coordinates[0]} ${coordinates[1]})')`;
}

export function calculateDistance({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 }) {
	const R = 6371; // km
	const dLat = toRad(lat2-lat1);
	const dLon = toRad(lon2-lon1);
	const calcLat1 = toRad(lat1);
	const calcLat2 = toRad(lat2);

	const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(calcLat1) * Math.cos(calcLat2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	const d = R * c;

	return d * 1000;
}

// Converts numeric degrees to radians
function toRad(Value)
{
	return Value * Math.PI / 180;
}