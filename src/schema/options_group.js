const {gql} = require('apollo-server');
const Products = require('../model/products');
const ProductsCategories = require('../model/products_categories');
const Branches = require('../model/branches');
const OptionsGroups = require('../model/options_groups');
const Op = require('sequelize').Op;

module.exports.typeDefs = gql`
	type OptionsGroup {
		id:ID!
		name:String!
		type:String!
		order:Int!
		min_select:Int!
		max_select:Int!
		active:Boolean!
		createdAt:String!
		updatedAt:String!
		product:Product!
		options_qty(filter:Filter):Int!

		groupRestrained:OptionsGroup
		restrainedBy:OptionsGroup

		options(filter:Filter):[Option]!
	}

	extend type Query {
		searchOptionsGroups(search:String!):[OptionsGroup]! @hasRole(permission:"products_edit", scope:"adm")
		optionsGroup(id:ID!):OptionsGroup!
	}
`;

module.exports.resolvers = {
	Query : {
		searchOptionsGroups: (parent, {search}, ctx) => {
			return OptionsGroups.findAll({
				where:{name:{[Op.like]:`%${search}%`}, [`$product->category->branch.company_id$`]:ctx.company.get('id')},
				include:[{
					model: Products,
					include: [{
						model:ProductsCategories,
						include:[Branches]
					}]
				}]
			});
		},
		optionsGroup : (parent, {id}) => {
			return OptionsGroups.findByPk(id);
		},
	},
	OptionsGroup: {
		options: (parent, {filter}, ctx) => {
			let where = {active: true};
			if (filter && filter.showInactive) delete where.active; 

			return parent.getOptions({where, order:[['order', 'ASC']]});
		},
		options_qty: (parent, {filter}, ctx) => {
			let where = {active: true};
			if (filter && filter.showInactive) delete where.active; 

			return parent.getOptions({where})
			.then(options=>{
				return options.length;
			})
		},
		groupRestrained: (parent, args, ctx) => {
			return parent.getGroupRestrained();
		},
		restrainedBy: (parent, args, ctx) => {
			return parent.getRestrainedBy();
		},
		product : (parent) => {
			return parent.getProduct();
		},
	}
}