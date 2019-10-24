const Routes = require('express').Router();
const deliveryAreasController = require('../controller/delivery_areas');
const usersController = require('../controller/users');
const companiesController = require('../controller/companies');
const branchesController = require('../controller/branches');

//DEFAULT MIDDLESWARES
Routes.use('/',
	companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit(['branches_edit', 'delivery_areas_edit'], {scope:'adm'}));

Routes.post('/', deliveryAreasController.create);

Routes.put('/:delivery_area_id', deliveryAreasController.update);

Routes.delete('/:delivery_area_id', deliveryAreasController.remove);

Routes.get('/', deliveryAreasController.read);

module.exports = Routes;