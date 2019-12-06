const crypto = require('crypto');
const Sequelize = require('sequelize')

function sanitizeFilter(_filter={}, _options = {}) {
	let options = {
		search: ['name', 'description'],
		excludeFilters: [],
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
	
	if (search) {
		filter = {
			...filter,
			[Sequelize.Op.or] : options.search.map(option => (
				[{
					[option] : { [Sequelize.Op.like] : `%${search}%` }
				}]
				))
			}
		}
		
		if (filter.createdAt) {
		const createdAt = filter.createdAt;
		delete filter.createdAt;
		
		filter = {
			[Sequelize.Op.and] : [
				filter,
				Sequelize.where(Sequelize.fn('date', Sequelize.col('created_at')), Sequelize.fn(createdAt)),
			]
		}
	}
	
	console.log(filter);
	
	return filter;
}

function getSQLPagination({ page=null, rowsPerPage=null } = {}) {
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

function salt(password, salt=null) {
	const _salt = salt || crypto.randomBytes(16).toString('hex');
	var hash = crypto.createHmac('sha512', _salt);
	hash.update(password);
	let _password = hash.digest('hex');
	return {
		password:_password,
		salt:_salt,
	}
}

/*
 * Retira todos acentos, converte espaços em hífens e
 * transforma texto em minúsculo
 * 
 */

function slugify(text) {
	text = text.trim().toLowerCase();

    text = text.replace(new RegExp('[ÁÀÂÃ][áàâã]','gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ][éèê]','gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ][íìî]','gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ][óòôõ]','gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ][úùû]','gi'), 'u');
	text = text.replace(new RegExp('[Ç][ç]','gi'), 'c');
	text = text.replace(new RegExp('[\(\)]', 'g'), '');
	
	text = text.replace(new RegExp(' - | ', 'g'), '-');
    return text;                 
}

module.exports = {
	salt,
	slugify,
	getSQLPagination,
	sanitizeFilter
}