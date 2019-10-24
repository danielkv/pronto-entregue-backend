const Routes = require('express').Router();

const Orders = require('../controller/orders');
const usersController = require('../controller/users');
const companiesController = require('../controller/companies');
const branchesController = require('../controller/branches');

//DEFAULT MIDDLESWARES
Routes.use('/',
	companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit(['adm'], {scope:'customer'}));

Routes.post('/', Orders.create);

Routes.put('/:order_id', Orders.update);

Routes.get('/', Orders.list);

Routes.get('/:order_id', Orders.read);

module.exports = Routes;