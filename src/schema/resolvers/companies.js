const Companies = require('../../model/companies');
const CompaniesMeta = require('../../model/companies_meta');
const Users = require('../../model/users');
const UsersMeta = require('../../model/users_meta');
const sequelize = require('../../services/connection');

module.exports = {
	Query: {
		companies : (parent, args, ctx) => {
			return Companies.findAll();
		},

		/*
		* Retrona as informações da empresa
		*/
		company : (parent, args, {user, company}) => {
			if (!(company instanceof Companies)) throw new Error('Empresa não encontrada');
		
			company.getMetas()
			.then((metas)=> {
				res.send({...company.get(), metas});
			})
			.catch(next);
		}
	}
}

/*
 * Retrona as informações da filial
 */

function read (req, res, next) {
	if (!(req.company instanceof Companies)) throw new Error('Empresa não encontrada');

	const {company} = req;
	
	company.getMetas()
	.then((metas)=> {
		res.send({...company.get(), metas});
	})
	.catch(next);
}

/*
 * Cria empresa e usuário ADM
 */

function create (req, res, next) {
	const company_data = req.body;

	company_data.active = false;
	company_data.users.role = 'adm';
	company_data.users.active = 1;

	sequelize.transaction(transaction => {
		return Promise.all([
			Companies.create(company_data, {include:[CompaniesMeta], transaction}),
			Users.create(company_data.users, {include:[UsersMeta], transaction}),
		])
		.then (async ([company, user])=>{
			await company.addUser(user, {through:{active:true}, transaction});
			return {company, user};
		});
	})
	.then((result)=> {
		res.send(result);
	})
	.catch(next);
}

/*
 * Atualizar dados da empresa
 */

function update(req, res, next) {
	if (!(req.company instanceof Companies)) throw new ReferenceError('Empresa não encontrada');

	const {company} = req;
	const company_data = req.body;
	const update_data = {};
	
	sequelize.transaction(async transaction => {
		update_data.before_update = Object.assign({}, company.get());
		update_data.after_update = Object.filter(company_data, (new_value, key) => company.get(key) && company.get(key) != new_value);

		const company_updated = await company.update(company_data, { fields: ['name', 'display_name', 'active'], transaction });
		const return_data = company_updated.get();

		if (company_data.metas) {
			const metas = await CompaniesMeta.updateAll(company_data.metas, company_updated, transaction);
			update_data.after_update.metas = metas;
			return_data.metas = metas;
		}
		return return_data;
	})
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Vincula/Desvincula usuário (params) à empresa (headers)
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

async function bind_user(req, res, next) {
	try {
		if (!(req.company instanceof Companies)) throw new Error('Empresa não encontrada');

		const action = req.body.action == 'bind' ? 'bind' : 'unbind';
		
		const {company} = req;
		const bind_user = await Users.findOne({where:{id:req.params.user_id}});
		if (!bind_user) throw new Error('O usuário selecionado não foi encontrado');

		if (action == 'bind') {
			company.addUser(bind_user, {through:{active:true}})
			.then(([result])=>{
				if (result == 1) return res.send({message: 'Usuário já está vinculado a esta empresa'});
				res.send({...bind_user.get(), branch_relation:result});
			});
		} else {
			company.removeUsers(bind_user)
			.then((result)=>{
				res.send({message:'Usuário desvinculado'});
			});
		}
	} catch (err) {
		next(err);
	}
}


/**
 * Procura o vinculo entre usuário e empresa e insere 
 * as permissões na requisição
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

async function permissions (req, res, next) {
	try {
		if (!(req.user instanceof Users)) throw new ReferenceError('Usuário não autenticado');
		if (!(req.company instanceof Companies)) throw new ReferenceError('Empresa não encontrada');
		
		const {user, company} = req;

		if (!user.can('master')) {
			const assigned_user = await company.getUsers({where:{id:user.id}});
			if (!assigned_user.length || !assigned_user[0].company_relation.active) throw new Error('Você não tem as permissões para acessar essa empresa');

			//Até aqui permissões são MASTER, ADM ou DEFAULT, definidas na autenticação
		}

		next();
		return null;
	} catch (err) {
		next(err);
	}
}