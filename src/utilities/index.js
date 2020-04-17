import crypto  from 'crypto';
import { Op, col, fn, where }  from 'sequelize';

export function sanitizeFilter(_filter = {}, _options = {}) {
	let options = {
		search: ['name', 'description'],
		excludeFilters: [],
		table: '',
		..._options,
	}

	let filter = {
		active: true,
		showInactive: false,
		search: '',

		..._filter,
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
		
	if (filter.createdAt) {
		const createdAt = filter.createdAt;
		delete filter.createdAt;
		
		filter = {
			[Op.and]: [
				filter,
				where(fn('date', col(`${options.table ? `${options.table}.`: ''}createdAt`)), fn(createdAt)),
			]
		}
	}
	
	return filter;
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