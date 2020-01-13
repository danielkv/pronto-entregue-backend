import { gql }  from 'apollo-server';

import { upload }  from '../config/uploads';
import ProductsCagetories  from '../model/products_categories';
import sequelize  from '../services/connection';


export const typeDefs =  gql`
	type Category {
		id:ID!
		name:String!
		description:String
		active:Boolean!
		branch:Branch!
		image:String!
		order:Int!
		createdAt:String!
		updatedAt:String!
		products_qty(filter:Filter):Int!

		products(filter:Filter):[Product]!
	}

	input CategoryInput {
		id:ID
		name:String
		description:String
		file:Upload
		active:Boolean
		order:Int
	}

	extend type Query {
		category(id:ID!): Category!
	}

	extend type Mutation {
		createCategory(data:CategoryInput!):Category! @hasRole(permission:"products_edit", scope:"adm")
		updateCategory(id:ID!, data:CategoryInput!):Category! @hasRole(permission:"products_edit", scope:"adm")
		updateCategoriesOrder(data:[CategoryInput!]!): [Category!]! @hasRole(permission:"products_edit", scope:"adm")
	}
`;

export const resolvers =  {
	Mutation: {
		createCategory : async (parent, { data }, ctx) => {
			if (data.file) {
				data.image = await upload(ctx.company.name, await data.file);
			}

			return ctx.branch.createCategory(data);
		},
		updateCategory : async (parent, { id, data }, ctx) => {
			if (data.file) {
				data.image = await upload(ctx.company.name, await data.file);
			}

			return ctx.branch.getCategories({ where:{ id } })
				.then (([category])=>{
					if (!category) throw new Error('Categoria não encontrada');

					return category.update(data, { fields:['name', 'description', 'image', 'active'] });
				})
		},
		updateCategoriesOrder: (_, { data }) => {
			return sequelize.transaction(transaction=>{
				return Promise.all(data.map(category_obj => {
					return ProductsCagetories.findByPk(category_obj.id).then(category=>{
						if (!category) throw new Error('Categoria não encontrada');

						return category.update({ order:category_obj.order }, { transaction })
					});
				}))
			});
		}
	},
	Query : {
		category: (_, { id }) => {
			return ProductsCagetories.findByPk(id)
				.then(category => {
					if (!category) throw new Error('Categoria não encontrada');
					return category;
				})
		},
	},
	Category : {
		products: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getProducts({ where });
		},
		branch : (parent) => {
			return parent.getBranch();
		},
		products_qty : (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getProducts({ where })
				.then (products=>products.length);
		}
	}
}