const Routes = require('express').Router();
const usersController = require('../controller/users');
const companiesController = require('../controller/companies');
const branchesController = require('../controller/branches');

Routes.get('/:user_id',
	companiesController.select,
	usersController.permit('users_read', {scope:'adm'}),
	usersController.read);

Routes.post(companiesController.select,
	usersController.create);

Routes.put('/:user_id',
	companiesController.select,
	usersController.permit('users_edit', {function:(req)=>(req.user.get('id')==req.params.user_id), scope:'adm'}),
	usersController.update);

Routes.put('/branch_role/:user_id',
	companiesController.select,
	companiesController.permissions,
	branchesController.select,
	branchesController.permissions,
	usersController.permit(['users_edit', 'roles_edit'], {scope:'adm'}),
	usersController.update_branch_role);

Routes.put('/scope_role/:user_id',
	companiesController.select,
	companiesController.permissions,
	usersController.permit('adm'),
	usersController.update_scope_role);

//--------------Authorizations----------------

Routes.post('/authorize',
	usersController.authorize);

Routes.post('/authenticate',
	(req, res)=>{res.send(req.user)});

module.exports = Routes;