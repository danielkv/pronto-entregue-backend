import { gql }  from 'apollo-server';
import conn from 'sequelize';

import Branches  from '../model/branches';
import OptionsGroups  from '../model/options_groups';
import Products  from '../model/products';
import ProductsCategories  from '../model/products_categories';

const { Op } = conn;


export const typeDefs =  gql`
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

export const resolvers =  {
	Query : {
		searchOptionsGroups: (parent, { search }, ctx) => {
			return OptionsGroups.findAll({
				where:{ name:{ [Op.like]:`%${search}%` }, [`$product->category->branch.company_id$`]:ctx.company.get('id') },
				include:[{
					model: Products,
					include: [{
						model:ProductsCategories,
						include:[Branches]
					}]
				}]
			});
		},
		optionsGroup : (_, { id }) => {
			return OptionsGroups.findByPk(id);
		},
	},
	OptionsGroup: {
		options: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getOptions({ where, order:[['order', 'ASC']] });
		},
		options_qty: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getOptions({ where })
				.then(options=>{
					return options.length;
				})
		},
		groupRestrained: (parent) => {
			return parent.getGroupRestrained();
		},
		restrainedBy: (parent) => {
			return parent.getRestrainedBy();
		},
		product : (parent) => {
			return parent.getProduct();
		},
	}
}