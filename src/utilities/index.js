import crypto  from 'crypto';
import _ from 'lodash';
import Sequelize, { Op, col, fn, where }  from 'sequelize';

/**
 * Transform config value type to save on DB
 * @param {String} value 
 * @param {String} type 
 */
export function serealizeConfig (value, type) {
	switch(type) {
		case 'json':
			return JSON.stringify(value);
		default:
			return _.toString(value);
	}
}

/**
 * Transform config value type
 * @param {String} value 
 * @param {String} type 
 */
export function deserealizeConfig (value, type) {
	switch(type) {
		case 'integer':
			return _.toInteger(value);
		case 'float':
			return _.toNumber(value);
		case 'json':
			return JSON.parse(value);
		case 'boolean':
			return value === 'true';
		default:
			return value;
	}
}

export function doesPathExist(nodes, path) {
	if (!nodes) {
		return false;
	}
	
	const node = nodes.find(x => x.name.value === path[0]);
	
	if (!node) {
		return false;
	}
	
	if (path.length === 1) {
		return node; //.arguments.map(arg => arg.name.value);
	}
	
	return doesPathExist(node.selectionSet.selections, path.slice(1));
}

export function sanitizeFilter(_filter = {}, _options = {}) {
	let options = {
		search: ['name', 'description'],
		excludeFilters: [],
		table: '',
		defaultFilter: {},
		..._options,
	}
	
	let filter = {
		active: true,
		showInactive: false,
		search: '',

		...options.defaultFilter,
		
		...convertKeys(_filter),
	}
	
	//verify if user sent showInactive
	if (filter.showInactive === true) delete filter.active;
	delete filter.showInactive;
	
	// Remove some filters if necessary
	if (options.excludeFilters.length) {
		options.excludeFilters.map(exclude => {
			delete filter[exclude];
		})
	}
	
	const search = filter.search || '';
	delete filter.search;
	
	/* if (_filter.statusNotIn) filter.status = { [Op.notIn]: _filter.statusNotIn }
	delete filter.statusNotIn; */
	
	if (search) {
		filter = {
			...filter,
			[Op.or]: options.search.map(option => (
				[{
					[option]: { [Op.like]: `%${search}%` }
				}]
			))
		}
	}
		
	if (filter.createdAt && typeof filter.createdAt !== 'object' && !filter.period) {
		const createdAt = filter.createdAt;
		delete filter.createdAt;
			
		filter = {
			[Op.and]: [
				filter,
				where(fn('date', col(`${options.table ? `${options.table}.`: ''}createdAt`)), fn(createdAt)),
			]
		}
	}

	if (filter.period) {
		const period = filter.period;
		delete filter.createdAt;
		delete filter.period;
		filter = [where, { createdAt: { [Op.between]: [period.start, period.end] } }]
	}
		
	return filter;
}

function convertKeys(value) {
	
	if (Array.isArray(value)) {
		return value.map(arr => convertKeys(arr));
	} else if (typeof value === 'object' && value !== null) {
		const newObject = {}
		const keyMatch = /^\$(.+)$/;

		Object.keys(value).map(key => {
			const match = key.match(keyMatch);
			const keyValue = convertKeys(value[key]);
			
			if (match && match[1] && Op[match[1]]) {
				newObject[Op[match[1]]] = keyValue;
			} else {
				newObject[key] = keyValue;
			}
		})
		
		return newObject;
	} else if (_.isString(value)) {
		const keyMatch = /^\$(.+)\((.+)\)$/;

		const match = value.match(keyMatch);
		
		if (match && match[1] && match[2]) {
			const fn = Sequelize.fn(match[1], match[2]);
			return fn
		} else {
			return value;
		}

	} else {
		return value;
	}
}
	
export function getSQLPagination({ page=null, rowsPerPage=null } = {}) {
	return {
		offset: page && rowsPerPage ? page * rowsPerPage : null,
		limit: rowsPerPage || null,
	}
}
	
	
/*
	* Adiciona ao prototype Object a função filter
	*
	*/
	
Object.filter = (obj, predicate) =>
	Object.keys(obj)
		.filter( key => predicate(obj[key], key) )
		.reduce( (res, key) => (res[key] = obj[key], res), {} );
	
/*
	* Cria o salt para ser adicionado/verificar senha do usuário
	*
	*/
	
export function salt(password, salt=null) {
	const _salt = salt || crypto.randomBytes(16).toString('hex');
	var hash = crypto.createHmac('sha512', _salt);
	hash.update(password);
	let _password = hash.digest('hex');
	return {
		password: _password,
		salt: _salt,
	}
}
	
/*
	* Retira todos acentos, converte espaços em hífens e
	* transforma texto em minúsculo
	* 
	*/
	
export function slugify(text) {
	let newText = text.trim().toLowerCase();
		
	newText = newText.replace(new RegExp('[ÁÀÂÃ]|[áàâã]','gi'), 'a');
	newText = newText.replace(new RegExp('[ÉÈÊ]|[éèê]','gi'), 'e');
	newText = newText.replace(new RegExp('[ÍÌÎ]|[íìî]','gi'), 'i');
	newText = newText.replace(new RegExp('[ÓÒÔÕ]|[óòôõ]','gi'), 'o');
	newText = newText.replace(new RegExp('[ÚÙÛ]|[úùû]','gi'), 'u');
	newText = newText.replace(new RegExp('[Çç]','gi'), 'c');
	// eslint-disable-next-line no-useless-escape
	newText = newText.replace(new RegExp('[\(\)]', 'g'), '');
		
	newText = newText.replace(new RegExp(' - | ', 'g'), '-');
	return newText;
}