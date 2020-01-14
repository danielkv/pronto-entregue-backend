import { gql }  from 'apollo-server';
import conn from 'sequelize';

import Branches  from '../model/branches';
import Category  from '../model/category';
import OptionGroup  from '../model/optionGroup';
import Products  from '../model/product';

const { Op } = conn;


export const typeDefs =  gql`
	type OptionsGroup {
		id: ID!
		name: String!
		type: String!
		order: Int!
		minSelect: Int!
		maxSelect: Int!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!
		product: Product!
		optionsQty(filter: Filter): Int!

		groupRestrained: OptionsGroup
		restrainedBy: OptionsGroup

		options(filter: Filter): [Option]!
	}

	extend type Query {
		searchOptionGroup(search: String!): [OptionsGroup]! @hasRole(permission: "products_edit", scope: "adm")
		optionsGroup(id: ID!): OptionsGroup!
	}
`;

export const resolvers =  {
	Query: {
		searchOptionGroup: (parent, { search }, ctx) => {
			return OptionGroup.findAll({
				where: { name: { [Op.like]: `%${search}%` }, [`$product->category->branch.companyId$`]: ctx.company.get('id') },
				include: [{
					model: Products,
					include: [{
						model: Category,
						include: [Branches]
					}]
				}]
			});
		},
		optionsGroup: (_, { id }) => {
			return OptionGroup.findByPk(id);
		},
	},
	OptionsGroup: {
		options: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getOptions({ where, order: [['order', 'ASC']] });
		},
		optionsQty: (parent, { filter }) => {
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
		product: (parent) => {
			return parent.getProduct();
		},
	}
}