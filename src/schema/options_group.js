import { gql }  from 'apollo-server';
import { Op } from 'sequelize';

import OptionsGroup  from '../model/optionsGroup';
import Products  from '../model/product';



export const typeDefs =  gql`

	type OptionsGroup {
		id: ID!
		name: String!
		type: String!
		priceType: String!
		order: Int!
		minSelect: Int!
		maxSelect: Int!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!
		product: Product!

		groupRestrained: OptionsGroup
		restrainedBy: OptionsGroup

		countOptions(filter: Filter): Int!
		options(filter: Filter): [Option]!
	}

	input OptionsGroupInput {
		id: ID
		action: String! #create | update | delete
		name: String
		type: String
		priceType: String
		order: Int
		minSelect: Int
		maxSelect: Int
		active: Boolean
		options: [OptionInput] 
		maxSelectRestrain: ID
	}

	extend type Query {
		searchOptionsGroups(search: String!): [OptionsGroup]! @hasRole(permission: "products_edit")
		optionsGroup(id: ID!): OptionsGroup!
	}

`;

export const resolvers =  {
	Query: {
		searchOptionsGroups: (_, { search }, { company }) => {
			return OptionsGroup.findAll({
				where: { name: { [Op.like]: `%${search}%` }, [`$product.companyId$`]: company.get('id') },
				include: [{
					model: Products,
				}]
			});
		},
		optionsGroup: (_, { id }) => {
			return OptionsGroup.findByPk(id);
		},
	},
	OptionsGroup: {
		options: (parent, { filter }) => {
			if (parent.options) return parent.options;

			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getOptions({ where, order: [['order', 'ASC']] });
		},
		countOptions: (parent, { filter }) => {
			if (parent.options) return parent.get('options').length;

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