const Routes = require('express').Router();

const optionsGroupsController = require('../controller/options_groups');
const usersController = require('../controller/users');
const companiesController = require('../controller/companies');

//DEFAULT MIDDLESWARES
Routes.use('/',
	companiesController.select,
	companiesController.permissions,
	usersController.permit('adm'));

Routes.post('/', optionsGroupsController.create);

Routes.put('/:group_id', optionsGroupsController.update);

Routes.get('/', optionsGroupsController.read);

module.exports = Routes;