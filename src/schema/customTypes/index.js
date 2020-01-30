import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { isNumber, isArray } from 'lodash';

export const GeoPoint = new GraphQLScalarType({
	name: 'GeoPoint',
	serialize: extractGeoPoint,
	parseValue: sanitizeToGeoPoint,
	parseLiteral(ast) {
		return sanitizeToGeoPoint(ast.value);
	}
})

function extractGeoPoint(point) {
	if (typeof point !== 'object'
	|| point.type !== 'Point'
	|| !Array.isArray(point.coordinates)
	|| !isNumber(point.coordinates[0]) || !isNumber(point.coordinates[1]))
		throw new Error('GeoPoint inválido');

	return point.coordinates;
}

function sanitizeToGeoPoint(coordinates) {
	if (!isArray(coordinates)
	|| !isNumber(coordinates[0])
	|| !isNumber(coordinates[1]))
		throw new Error('GeoPoint inválido');

	return {
		type: 'Point',
		coordinates
	}
}

export const DateTime = new GraphQLScalarType({
	name: 'DateTime',
	description: 'Date custom scalar type',
	parseValue(value) {
		return new Date(value); // value from the client
	},
	serialize(value) {
		return value.getTime(); // value sent to the client
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			return parseInt(ast.value, 10); // ast value is always in string format
		}
		return null;
	},
})