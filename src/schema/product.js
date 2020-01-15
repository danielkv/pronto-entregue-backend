import { gql }  from 'apollo-server';
import conn from 'sequelize';

import { upload }  from '../controller/uploads';
import Category from '../model/category';
import Option  from '../model/option';
import OptionGroup  from '../model/optionGroup';
import Product  from '../model/product';
import sequelize  from '../services/connection';

const { Op } = conn;

export const typeDefs =  gql`
	type Product {
		id: ID!
		name: String!
		description: String!
		image: String!
		order: Int!
		type: String!
		price: Float!
		featured: Boolean!

		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!

		optionsQty(filter:Filter): Int!
		optionGroups(filter:Filter): [OptionsGroup]!
		category:Category!
	}

	input ProductInput {
		name: String
		description: String
		featured: Boolean
		file: Upload
		type: String
		price: Float
		active: Boolean
		categoryId: ID
		optionGroups: [OptionsGroupInput]
	}

	input OptionsGroupInput {
		id: ID
		action: String! #create | update | delete
		name: String
		type: String
		order: Int
		minSelect: Int
		maxSelect: Int
		active: Boolean
		options: [OptionInput] 
		maxSelectRestrain: ID
	}

	input OptionInput {
		id: ID
		action: String! #create | update | delete
		name: String
		order: Int
		active: Boolean
		price: Float
		maxSelectRestrainOther: Int
	}

	extend type Query {
		product(id: ID!): Product!
	}

	extend type Mutation {
		createProduct(data:ProductInput!):Product! @hasRole(permission:"users_edit", scope:"adm")
		updateProduct(id:ID!, data:ProductInput!):Product! @hasRole(permission:"users_edit", scope:"adm")
	}
`;

export const resolvers =  {
	Mutation: {
		createProduct: async (_, { data }, { company }) => {
			if (data.file) {
				data.image = await upload(company.name, await data.file);
			}

			return sequelize.transaction(async (transaction) => {
				// check if selected category exists
				const category = await Category.findByPk(data.categoryId)
				if (!category) throw new Error('Categoria não encontrada');

				// create product
				const product = await category.createProduct(data, { transaction });

				// create options groups
				if (data.optionGroups) await OptionGroup.updateAll(data.optionGroups, product, transaction);
					
				return product;
			})
		},
		updateProduct: async (_, { id, data }, { company }) => {
			if (data.file) {
				data.image = await upload(company.name, await data.file);
			}

			return sequelize.transaction(async (transaction) => {
				// check if product exists
				const product = await Product.findByPk(id);
				if (!product) throw new Error('Produto não encontrado');

				// update product
				const productUpdated = await product.update(data, { fields: ['name', 'description', 'price', 'order', 'featured', 'active', 'image', 'type'], transaction });
					
				// check if needs to update category
				if (data.categoryId) {
					// check if selected category exists
					const category = await Category.findByPk(data.categoryId)
					if (!category) throw new Error('Categoria não encontrada');

					// update category
					await productUpdated.setCategory(category, { transaction });
				}

				// create, update, remove options groups
				if (data.optionGroups) await OptionGroup.updateAll(data.optionGroups, product, transaction);
			
				return productUpdated;
			})
		},
	},
	Query: {
		product: async (_, { id }) => {
			// check if product exists
			const product = await Product.findByPk(id);
			if (!product) throw new Error('Produto não encontrada');

			return product;
		},
		/* searchBranchProducts: (_, { search, filter }, ctx) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return Product.findAll({
				where: { ...where, name: { [Op.like]: `%${search}%` }, ['$category.branchId$']: ctx.branch.get('id') },
				include: [{ model: Category				}]
			})
		}, */
	},
	Product: {
		optionsQty: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return Option.count({ where, include: [{ model: OptionGroup, where: { productId: parent.get('id') } }] });
		},
		optionGroups: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;
			return parent.getOptionGroup({ where, order: [['order', 'ASC']] });
		},
		category: (parent) => {
			return parent.getCategory();
		},
	}
}