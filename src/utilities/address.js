import { where, fn, literal } from "sequelize";

export function splitAddress(model, modelName='', suffix='') {
	return {
		id: `_${modelName}_${model.get('id')}`,
		name: model.get(`nameAddress${suffix}`),
		street: model.get(`streetAddress${suffix}`),
		number: model.get(`numberAddress${suffix}`),
		complement: model.get(`complementAddress${suffix}`),
		zipcode: model.get(`zipcodeAddress${suffix}`),
		district: model.get(`districtAddress${suffix}`),
		city: model.get(`cityAddress${suffix}`),
		state: model.get(`stateAddress${suffix}`),
		reference: model.get(`referenceAddress${suffix}`),
		location: model.get(`locationAddress${suffix}`),
	}
}

export function joinAddress(address, suffix='') {
	return {
		[`nameAddress${suffix}`]: address.name,
		[`streetAddress${suffix}`]: address.street,
		[`numberAddress${suffix}`]: address.number,
		[`complementAddress${suffix}`]: address.complement,
		[`zipcodeAddress${suffix}`]: address.zipcode,
		[`districtAddress${suffix}`]: address.district,
		[`cityAddress${suffix}`]: address.city,
		[`stateAddress${suffix}`]: address.state,
		[`referenceAddress${suffix}`]: address.reference,
		[`locationAddress${suffix}`]: address.location
	}
}

function parseAddressesComponents(results) {
	if (!results.length) return [];

	return results.map(result => {
		
		const componentTypes = {
			location: [result.geometry.location.lat, result.geometry.location.lng]
		};
		result.address_components.forEach(component => {
			component.types.forEach(type => {
				// eslint-disable-next-line camelcase
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

export function CompanyAreaSelect(type, { coordinates }, company='`company`.`id`') {
	if (!coordinates) throw new Error('Endereço não encontrado');
	const userPoint = pointFromCoordinates(coordinates, true);
	const tables = { typeDelivery: 'delivery_areas', typePickUp: 'view_areas' };

	const tableName = tables[type];

	return `(SELECT COUNT(id) > 0 as result FROM \`${tableName}\` WHERE active AND companyId = ${company} AND ST_Distance_Sphere(${userPoint}, center) <= radius)`
}

export function CompanyAreaAttribute(type, location, companyTable) {

	return [literal(CompanyAreaSelect(type, location, companyTable)), type]
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