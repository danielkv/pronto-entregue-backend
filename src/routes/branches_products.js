const Routes = require('express').Router();
const multer = require('multer');

const multerConfig = require('../config/multer');
const branchesProductsController = require('../controller/branches_products');
const usersController = require('../controller/users');
const companiesController = require('../controller/companies');
const branchesController = require('../controller/branches');

//DEFAULT MIDDLESWARES
Routes.use('/',
	companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit(['products_edit'], {scope:'adm'}));

Routes.post('/', multer(multerConfig).single('image'), branchesProductsController.create);

Routes.put('/:product_id', branchesProductsController.update);

Routes.put('/bind/:product_id', branchesProductsController.bind);

Routes.put('/unbind/:product_id', branchesProductsController.unbind);

Routes.get('/', branchesProductsController.list);

Routes.get('/:product_id', branchesProductsController.read);

module.exports = Routes;