import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import redisConfig from '../config/redis'
import models from '../model';

const options = {
	host: redisConfig.host,
	port: redisConfig.port,
	retryStrategy: times => {
		// reconnect after
		return Math.min(times * 50, 2000);
	}
};

function reviver (key, value) {
	const isISO8601Z = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
	
	switch (key) {
		case 'createdAt':
		case 'updatedAt':
			if (typeof value === 'string' && isISO8601Z.test(value)) {
				const tempDateNumber = Date.parse(value);
				if (!isNaN(tempDateNumber)) {
					return new Date(tempDateNumber);
				}
			}
			return value;
		default:
			return value;
		
	}
}

const pubSub = new RedisPubSub({
	//reviver,
	serializer(source) {
		return JSON.stringify(source);
	},
	deserializer(string) {
		const data = JSON.parse(string, reviver);

		const newObject = {};

		// convert object to instance
		Object.keys(data).forEach(key=>{
			const value = data[key];
			if (value.modelName)
				newObject[key] = dataToInstance(models[value.modelName], value.data);
			else
				newObject[key] = value;
		})
		
		return newObject;
	},
	publisher: new Redis(options),
	subscriber: new Redis(options)
});

export function instanceToData (instance) {
	const data = {
		modelName: instance.constructor.name,
		data: instance.get({ plain: true })
	}
	
	return data
}

function dataToInstance (model, data) {
	try {
		if (!data) {
			return data
		}
		const include = generateIncludeRecurse(model)
		const instance = model.build(data, { isNewRecord: false, raw: false, include })
		restoreTimestamps(data, instance)
		return instance
	} catch(err) {
		console.log('ERRROOOOO', err)
	}
}

function restoreTimestamps (data, instance) {
	const timestampFields = ['createdAt', 'updatedAt', 'deletedAt']
	
	for (const field of timestampFields) {
		const value = data[field]
		if (value) {
			instance.setDataValue(field, new Date(value))
		}
	}
	
	Object.keys(data).forEach(key => {
		const value = data[key]
		
		if (!value) {
			return
		}
		
		if (Array.isArray(value)) {
			try {
				const nestedInstances = instance.get(key)
				value.forEach((nestedValue, i) => restoreTimestamps(nestedValue, nestedInstances[i]))
			} catch (error) { // TODO: Fix issue with JSON and BLOB columns
				
			}
			
			return
		}
		
		if (typeof value === 'object') {
			try {
				const nestedInstance = instance.get(key)
				Object.values(value).forEach(nestedValue => restoreTimestamps(nestedValue, nestedInstance))
			} catch (error) { // TODO: Fix issue with JSON and BLOB columns
				
			}
		}
	})
}

function generateIncludeRecurse (model, depth = 1) {
	if (depth > 5) {
		return []
	}
	return Object.entries(model.associations || [])
		.filter(([as, association]) => {
			const hasOptions = Object.prototype.hasOwnProperty.call(association, 'options')
			return hasOptions
		})
		.map(([as, association]) => {
			const associatedModel = model.sequelize.model(association.target.name)
			return {
				model: associatedModel,
				include: generateIncludeRecurse(associatedModel, depth + 1),
				as
			}
		})
}


export default pubSub;