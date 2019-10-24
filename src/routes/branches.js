const Routes = require('express').Router();
const branchesController = require('../controller/branches');
const companiesController = require('../controller/companies');
const usersController = require('../controller/users');

Routes.get('/',
	companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit(['companies_read'], {scope:'adm'}),
	branchesController.read);

Routes.post('/',
	companiesController.select,
	usersController.permit('adm'), 
	branchesController.create);

Routes.put('/',
	companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit('branches_edit', {scope:'adm'}),
	branchesController.update);

Routes.put('/user/bind/',
	companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit(['branches_edit', 'users_edit'], {scope:'adm'}),
	branchesController.bind_user);


module.exports = Routes;