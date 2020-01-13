import { gql }  from 'apollo-server';
import conn from 'sequelize';

import { upload }  from '../config/uploads';
import Options  from '../model/options';
import OptionsGroups  from '../model/options_groups';
import Products  from '../model/products';
import ProductsCategories  from '../model/products_categories';
import sequelize  from '../services/connection';

const { Op } = conn;

export const typeDefs =  gql`
	type Product {
		id:ID!
		name:String!
		description:String!
		image:String!
		order:Int!
		type:String!
		price:Float!
		featured: Boolean!

		active:Boolean!
		createdAt:String! @dateTime
		updatedAt:String! @dateTime

		options_qty(filter:Filter):Int!
		options_groups(filter:Filter):[OptionsGroup]!
		category:Category!
	}

	input ProductInput {
		name:String
		description:String
		featured: Boolean
		file:Upload
		type:String
		price:Float
		active:Boolean
		category_id:ID
		options_groups:[OptionsGroupInput]
	}

	input OptionsGroupInput {
		id:ID
		action:String! #create | update | delete
		name:String
		type:String
		order:Int
		min_select:Int
		max_select:Int
		active:Boolean
		options:[OptionInput]
		max_select_restrain:ID
	}

	input OptionInput {
		id:ID
		action:String! #create | update | delete
		name:String
		order:Int
		active:Boolean
		price:Float
		max_select_restrain_other:Int
		item_id:ID
	}

	extend type Query {
		product(id:ID!): Product!
		searchBranchProducts(search:String!, filter:Filter):[Product]!
	}

	extend type Mutation {
		createProduct(data:ProductInput!):Product! @hasRole(permission:"users_edit", scope:"adm")
		updateProduct(id:ID!, data:ProductInput!):Product! @hasRole(permission:"users_edit", scope:"adm")
	}
`;

export const resolvers =  {
	Mutation: {
		createProduct: async (_, { data }, ctx) => {
			if (data.file) {
				data.image = await upload(ctx.company.name, await data.file);
			}

			return sequelize.transaction(transaction => {
				return ctx.branch.getCategories({ where:{ id:data.category_id } })
					.then(async ([category]) => {
						if (!category) throw new Error('Categoria não encontrada');

						const product = await category.createProduct(data, { transaction });

						if (data.options_groups)
							await OptionsGroups.updateAll(data.options_groups, product, transaction);
					
						return product;
					})
				
			})
		},
		updateProduct : async (_, { id, data }, ctx) => {
			if (data.file) {
				data.image = await upload(ctx.company.name, await data.file);
			}

			return sequelize.transaction(transaction => {
				return Products.findByPk(id)
					.then(async (product) => {
						if (!product) throw new Error('Produto não encontrado');
						const product_updated = await product.update(data, { fields:['name', 'description', 'price', 'order', 'featured', 'active', 'image', 'type'], transaction });
					
						if (data.category_id) {
							const [category] = await ctx.branch.getCategories({ where:{ id:data.category_id } })
							if (!category) throw new Error('Categoria não encontrada');

							await product_updated.setCategory(category, { transaction });
						}

						if (data.options_groups)
							await OptionsGroups.updateAll(data.options_groups, product, transaction);
					
						return product_updated;
					})
				
			})
		},
	},
	Query : {
		product: (_, { id }) => {
			return Products.findByPk(id)
				.then(product => {
					if (!product) throw new Error('Produto não encontrada');
					return product;
				})
		},
		searchBranchProducts: (_, { search, filter }, ctx) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;
			return Products.findAll({
				where:{ ...where, name:{ [Op.like]:`%${search}%` }, ['$category.branch_id$']: ctx.branch.get('id') },
				include: [{
					model:ProductsCategories
				}]
			})
		},
	},
	Product: {
		options_qty : (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return Options.count({ where, include:[{ model:OptionsGroups, where:{ product_id:parent.get('id') } }] });
		},
		options_groups: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;
			return parent.getOptionsGroups({ where, order:[['order', 'ASC']] });
		},
		category : (parent) => {
			return parent.getCategory();
		},
	}
}