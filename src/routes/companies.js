const Routes = require('express').Router();
const companiesController = require('../controller/companies');
const usersController = require('../controller/users');

Routes.get('/',
	companiesController.select,
	companiesController.permissions,
	usersController.permit(['companies_read'], {scope:'adm'}),
	companiesController.read);

Routes.post('/',
	usersController.permit('master'),
	companiesController.create);

Routes.put('/',
	companiesController.select,
	companiesController.permissions,
	usersController.permit('companies_edit', {scope:'adm'}),
	companiesController.update);

Routes.put('bind_user/:user_id',
	companiesController.select,
	companiesController.permissions,
	usersController.permit(['users_read', 'users_edit'], {scope:'adm'}),
	companiesController.bind_user);

module.exports = Routes;