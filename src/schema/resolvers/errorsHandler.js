/*
 * Captura todos erros do app e manipula tudo em uma função
 *
 */

function errorHandler (err, req, res, next) {
	res.status(403).send({name: err.name, message: err.message});

	//SequelizeUniqueConstraintError
}

module.exports = {
	errorHandler,
}