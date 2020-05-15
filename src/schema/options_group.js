import { gql }  from 'apollo-server';
import { Op } from 'sequelize';

import { optionsKey, optionsGroupProductKey } from '../cache/keys';
import { restrainedByLoader, groupRestrainedLoader, optionsLoader } from '../loaders';
import Category from '../model/category';
import Option  from '../model/option';
import OptionsGroup  from '../model/optionsGroup';
import Product  from '../model/product';
import { sanitizeFilter } from '../utilities';


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
		searchOptionsGroups(_, { search }, { company }) {
			return OptionsGroup.findAll({
				where: { name: { [Op.like]: `%${search}%` }, [`$product.companyId$`]: company.get('id') },
				include: [{
					model: Product,
					include: Category
				}]
			});
		},
		optionsGroup: (_, { id }) => {
			return OptionsGroup.findByPk(id);
		},
	},
	OptionsGroup: {
		async options (parent, { filter }) {
			if (parent.options) return parent.options;
			
			const optionsGroupId = parent.get('id');
			let options = [];

			if (!filter)
				options = await optionsLoader.load(optionsGroupId)
			else {
				const where = sanitizeFilter(filter, { defaultFilter: { removed: false } });

				//return parent.getOptions({ where, order: [['order', 'ASC']] });
				options = await Option.cache(optionsKey(`${optionsGroupId}:${JSON.stringify(filter)}`))
					.findAll({
						where: [where, { optionsGroupId }]
					})
			}

			return options;
		},
		async countOptions(parent, { filter }) {
			if (parent.options) return parent.get('options').length;
			
			const optionsGroupId = parent.get('id');
			const where = sanitizeFilter(filter, { defaultFilter: { removed: false } });

			//return parent.getOptions({ where, order: [['order', 'ASC']] });
			const options = await Option.cache(optionsKey(`${optionsGroupId}:${JSON.stringify(filter)}`))
				.findAll({
					where: [where, { optionsGroupId }]
				})

			return options.length;
		},
		groupRestrained(parent) {
			const maxSelectRestrain = parent.get('maxSelectRestrain');
			if (!maxSelectRestrain) return null;
			
			return groupRestrainedLoader.load(maxSelectRestrain);
		},
		restrainedBy: (parent) => {
			return restrainedByLoader.load(parent.get('id'));
		},

		/**
		 * references
		 * - ADM - graphql/products.js
		 */
		product(parent) {
			if (parent.product) return parent.product;

			const optionsGroupId = parent.get('id');

			return Product.cache(optionsGroupProductKey(optionsGroupId))
				.findOne({ where: { id: parent.get('productId') } })

		}
	}
}