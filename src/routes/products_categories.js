const Routes = require('express').Router();
const multer = require('multer');

const multerConfig = require('../config/multer');
const productCategoriesController = require('../controller/products_categories');
const usersController = require('../controller/users');
const companiesController = require('../controller/companies');
const branchesController = require('../controller/branches');

//DEFAULT MIDDLESWARES
Routes.use(companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit(['products_edit'], {scope:'adm'}));

Routes.post(multer(multerConfig).single('image'), productCategoriesController.create);

Routes.put('/:category_id', multer(multerConfig).single('image'), productCategoriesController.update);

Routes.delete('/:category_id', productCategoriesController.remove);

Routes.get(productCategoriesController.read);

module.exports = Routes;