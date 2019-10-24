const Routes = require('express').Router();
const multer = require('multer');

const multerConfig = require('../config/multer');
const productsController = require('../controller/products');
const usersController = require('../controller/users');
const companiesController = require('../controller/companies');
const branchesController = require('../controller/branches');

//DEFAULT MIDDLESWARES
Routes.use('/',
	companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit(['branches_edit', 'products_edit'], {scope:'adm'}));

Routes.post('/', multer(multerConfig).single('image'), productsController.create);

Routes.put('/:product_id', multer(multerConfig).single('image'), productsController.update);

Routes.get('/', productsController.read);

module.exports = Routes;