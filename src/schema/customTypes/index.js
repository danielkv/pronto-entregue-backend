import { GraphQLScalarType } from 'graphql';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { Kind } from 'graphql/language';
import { isNumber, isArray } from 'lodash';


export const JSONObject = GraphQLJSONObject;
export const JSON = GraphQLJSON;

export const GeoPoint = new GraphQLScalarType({
	name: 'GeoPoint',
	serialize: extractGeoPoint,
	parseValue: sanitizeToGeoPoint,
	parseLiteral(ast) {
		if (ast.kind === Kind.LIST) {
			const coordinates = [parseFloat(ast.values[0].value), parseFloat(ast.values[1].value)];
			return sanitizeToGeoPoint(coordinates);
		}
		return null;
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

export const GeoPolygon = new GraphQLScalarType({
	name: 'GeoPolygon',
	serialize: extractGeoPolygon,
	parseValue: sanitizeToGeoPolygon,
	parseLiteral(ast) {
		if (ast.kind === Kind.LIST) {
			const coordinates = ast.values.map(r => parseFloat(r.value));
			return sanitizeToGeoPoint(coordinates);
		}
		return null;
	}
})

function extractGeoPolygon(point) {
	if (typeof point !== 'object'
	|| point.type !== 'Polygon'
	|| !Array.isArray(point.coordinates)
	|| !isNumber(point.coordinates[0]) || !isNumber(point.coordinates[1]))
		throw new Error('GeoPolygon inválido');

	return point.coordinates;
}

function sanitizeToGeoPolygon(coordinates) {
	if (!isArray(coordinates))
		throw new Error('GeoPolygon inválido');

	return {
		type: 'Polygon',
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