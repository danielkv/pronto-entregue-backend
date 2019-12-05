const crypto = require('crypto');
const { Op } = require('sequelize')

function sanitizeFilter(filter={}, options = { search: ['name', 'description'] }) {
	let _filter = {
		active: true,
		showInactive: false,
		search: '',

		...filter,
	}
	
	if (_filter.showInactive === true) delete _filter.active;
	delete _filter.showInactive;

	const search = _filter.search || '';
	delete _filter.search;

	if (search) {
		_filter = {
			..._filter,
			[Op.or] : options.search.map(option => (
				[{
					[option] : { [Op.like] : `%${search}%` }
				}]
			))
		}
	}

	return _filter;
}

function getSQLPagination({ page, rowsPerPage }) {
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