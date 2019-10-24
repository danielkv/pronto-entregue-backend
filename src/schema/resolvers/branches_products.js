const sequelize = require('../services/connection');
const Sequelize = require('sequelize');
const OptionsGroups = require('../model/options_groups');
const Options = require('../model/options');

/**
 * Cria produto a partir da empresa e vincula à filial
 * 
 */

function create (req, res, next) {
	const {company, branch} = req;
	const product_data = req.body;

	if (req.file) product_data.image = req.file.path;

	sequelize.transaction(transaction => {
		return branch.getCategories({where:{id:product_data.category_id}})
		.then(async ([category])=>{
			if (!category) throw new Error('Categoria não encontrada');

			const created = await company.createProduct(product_data, {transaction});
			const [branch_relation] = await branch.addProduct(created, {through: product_data, transaction});
			let options_groups = [];

			if (product_data.options_groups)
				options_groups = await OptionsGroups.updateAll(product_data.options_groups, branch_relation, transaction);

			return {...created.get(), branch_relation, options_groups};
		});
	})
	.then((created)=>{
		return res.send(created);
	})
	.catch(next);
}

/**
 * Vincula produto à filial
 * 
 */

function bind (req, res, next) {
	const {company, branch} = req;
	const {product_id} = req.params;
	const product_data = req.body;

	Promise.all([
		company.getProducts({where:{id:product_id}}),
		branch.getCategories({where:{id:product_data.category_id}}),
	])
	.then(async ([[product], [category]])=>{
		if (!product) throw new Error('Produto não encontrado');
		if (!category) throw new Error('Categoria não encontrada');

		const [branch_relation] = await branch.addProduct(product, {through: product_data});
		return {...product.get(), branch_relation};
	})
	.then((binded)=>{
		return res.send(binded);
	})
	.catch(next);
}

/**
 * Desvincula produto à filial
 * 
 */

function unbind (req, res, next) {
	const {branch} = req;
	const {product_id} = req.params;

	branch.getProducts({where:{id:product_id}})
	.then(async ([product])=>{
		if (!product) throw new Error('Produto não encontrado');

		return branch.removeProduct(product);
	})
	.then((binded)=>{
		return res.send({message:'Produto desvinculado'});
	})
	.catch(next);
}

/**
 * Retorna um array com produtos vinculados a filial
 * 
 * @query only_active {boolean} filtra apenas ativos. Default: true
 */

function list (req, res, next) {
	const {branch} = req;
	const only_active = req.query.only_active === false || req.query.only_active === 'false' ? req.query.only_active : true;

	branch.getProducts({order:[[Sequelize.literal('branch_relation.order'), 'ASC']], where:{active:only_active}})
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Retorna produto, grupos de opções e opções vinculados a filial
 * 
 * @param product_id {int} ID do produto a ser retornado
 * @query only_active {boolean} filtra apenas ativos. Default: true
 */

function read (req, res, next) {
	const {branch} = req;
	const {product_id} = req.params;
	const only_active = req.query.only_active === false || req.query.only_active === 'false' ? req.query.only_active : true;

	branch.getProducts({where:{id:product_id, active:only_active}})
	.then(async ([product]) => {
		if (!product || !product.branch_relation) throw new Error('Produto não encontrado');

		//busca apenas os grupos e inclui todas opções
		const options_groups = await product.branch_relation.getOptionsGroups({
			where:{active:only_active},
			include:[{
				model:Options,
				where: {active:only_active}
			}]
		});

		return {...product.get(), options_groups};
	})
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Atualiza/altera vinculo do produto com a filial
 * 
 * update [price, order]
 */

function update (req, res, next) {
	const {branch} = req;
	const {product_id} = req.params;
	const product_data = req.body;

	sequelize.transaction(transaction => {
		return branch.getProducts({where:{id:product_id}})
		.then(async ([product]) => {
			if (!product) throw new Error('Produto não encontrado');
			let options_groups = [];
			
			if (product_data.category_id) {
				const [category] = await branch.getCategories({where:{id:product_data.category_id}});
				if (category) branch_relation = await product.branch_relation.setCategory(category, {transaction});
			}

			if (Object.keys(product_data).length > 1 || !product_data.category_id) {
				const branch_relation = await product.branch_relation.update(product_data, {fields:['price', 'order', 'active'], transaction});
				
				if (product_data.options_groups) {
					options_groups = await OptionsGroups.updateAll(product_data.options_groups, branch_relation, transaction);
				}
			}
			
			return {...product.get(), branch_relation, options_groups};
		});
	})
	.then((updated)=>{
		return res.send(updated);
	})
	.catch(next);
}

module.exports = {
	//default
	create,
	list, 
	read,
	update,

	//settings
	bind,
	unbind,
}