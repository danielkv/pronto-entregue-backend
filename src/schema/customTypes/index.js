import { GraphQLScalarType } from 'graphql';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { Kind } from 'graphql/language';
import { isNumber, isArray } from 'lodash';
import moment from 'moment';

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
    },
});

function extractGeoPoint(point) {
    if (
        typeof point !== 'object' ||
        point.type !== 'Point' ||
        !Array.isArray(point.coordinates) ||
        !isNumber(point.coordinates[0]) ||
        !isNumber(point.coordinates[1])
    )
        throw new Error('GeoPoint inválido');

    return point.coordinates;
}

function sanitizeToGeoPoint(coordinates) {
    if (!isArray(coordinates) || !isNumber(coordinates[0]) || !isNumber(coordinates[1]))
        throw new Error('GeoPoint inválido');

    return {
        type: 'Point',
        coordinates,
    };
}

export const DateTime = new GraphQLScalarType({
    name: 'DateTime',
    description: 'Date custom scalar type',
    parseValue(value) {
        return new Date(value); // value from the client
    },
    serialize(value) {
        try {
            return moment(value).valueOf(); // value sent to the client
        } catch (err) {
            console.log(err);
        }
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return parseInt(ast.value, 10); // ast value is always in string format
        }
        return null;
    },
});
