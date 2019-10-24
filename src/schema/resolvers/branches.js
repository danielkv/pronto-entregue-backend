const Companies = require('../model/companies');
const Branches = require('../model/branches');
const BranchesMeta = require('../model/branches_meta');
const Users = require('../model/users');
const PaymentMethods = require('../model/payment_methods');
const sequelize = require('../services/connection');

/*
 * Retrona as informações da filial
 */

function read (req, res, next) {
	if (!(req.branch instanceof Branches)) throw new Error('Filial não encontrada');

	const {branch} = req;
	
	branch.getMetas()
	.then((metas)=> {
		res.send({...branch.get(), metas});
	})
	.catch(next);
}

/*
 * Cria nova filial para empresa
 */

function create (req, res, next) {
	if (!(req.company instanceof Companies)) throw new Error('Empresa não encontrada');

	const company = req.company;
	const branch_data = req.body;

	branch_data.active = true;
	
	sequelize.transaction(transaction => {
		return company.createBranch(branch_data, {include:[BranchesMeta], transaction})
	})
	.then((branch)=> {
		res.send(branch);
	})
	.catch(next);
}

/*
 * Atualizar dados da filial
 */

function update(req, res, next) {
	if (!(req.branch instanceof Branches)) throw new Error('Filial não encontrada');

	const {branch} = req;
	const branch_data = req.body;
	const update_data = {};

	update_data.before_update = Object.assign({}, branch.get());
	update_data.after_update = Object.filter(branch_data, (new_value, key) => branch.get(key) && branch.get(key) != new_value);

	sequelize.transaction(transaction => {
		return branch.update(branch_data, {fields:['name', 'active'], transaction})
		.then(async (branch_updated)=>{
			const return_data = branch_updated.get();

			if (branch_data.metas) {
				const metas = await BranchesMeta.updateAll(branch_data.metas, branch_updated, transaction);
				update_data.after_update.metas = metas;
				return_data.metas = metas;
			}

			return return_data;
		})
	})
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Vincula/Desvincula usuário (params) à filial (headers)
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

async function bind_user(req, res, next) {
	try {
		if (!(req.branch instanceof Branches)) throw new Error('Filial não encontrada');

		const action = req.body.action == 'bind' ? 'bind' : 'unbind';
		
		const {branch} = req;
		const bind_user = await req.company.getUsers({where:{id:req.body.user_id}});
		if (!bind_user.length) throw new Error('O usuário selecionado não existe ou não está vinculado a essa empresa');

		if (action == 'bind') {
			branch.addUser(bind_user[0], {through:{active:true}})
			.then(([result])=>{
				if (result == 1) return res.send({message: 'Usuário já está vinculado a esta filial'});
				res.send({...bind_user[0].get(), branch_relation:result});
			});
		} else {
			branch.removeUsers(bind_user)
			.then((result)=>{
				res.send({message:'Usuário desvinculado'});
			});
		}
	} catch (err) {
		next(err);
	}
}

/**
 * Procura o vinculo entre usuário e filial e insere 
 * as permissões na requisição
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

async function permissions (req, res, next) {
	try {
		if (!(req.branch instanceof Branches)) throw new Error('Filial não encontrada');
		if (!(req.user instanceof Users)) throw new Error('Usuário não encontrado');
		
		const {user, branch} = req;

		if (!user.can(['master', 'adm'])) {
			const [assigned_user] = await branch.getUsers({where:{id:user.id}});
			if (!assigned_user || !assigned_user.branch_relation.active) throw new Error('Você não tem as permissões para acessar essa filial');

			const role = await assigned_user.branch_relation.getRole();
			req.user.branch_permissions = role.permissions;
		}

		next();
		return null;
	} catch (err) {
		next(err);
	}
}

module.exports = {
	//default
	read,
	create,
	update,

	//settings
	bind_user,

	//select, permissions
	select,
	permissions,
}