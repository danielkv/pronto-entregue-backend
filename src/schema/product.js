import { gql }  from 'apollo-server';
import { Op } from 'sequelize';

import { upload }  from '../controller/uploads';
import Campaign from '../model/campaign';
import Category from '../model/category';
import Company from '../model/company';
import Option  from '../model/option';
import OptionsGroup  from '../model/OptionsGroup';
import Product  from '../model/product';
import User from '../model/user';
import conn  from '../services/connection';
import { getSQLPagination, sanitizeFilter } from '../utilities';
import { campaignProductWhere } from '../utilities/campaign';
import { calculateProcuctFinalPrice } from '../utilities/product';

export const typeDefs =  gql`
	type Product {
		id: ID!
		name: String!
		description: String!
		image: String!
		order: Int!
		type: String!
		listed: Boolean!
		price: Float!
		finalPrice: Float! # if has some campaign
		featured: Boolean!

		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!

		optionsGroups(filter: Filter): [OptionsGroup]!
		
		countOptions(filter: Filter): Int!

		countFavoritedBy: Int!
		favoritedBy(pagination: Pagination): [User]!
		
		category: Category!
		company: Company!

		countCampaigns(notIn: [ID]): Int!
		campaigns(notIn: [ID]): [Campaign]!
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
		optionsGroups: [OptionsGroupInput]
	}

	extend type Query {
		product(id: ID!): Product!
	}

	extend type Mutation {
		searchProducts(search: String, exclude: [ID], companies: [ID]): [Product]!

		createProduct(data: ProductInput!): Product! @hasRole(permission: "users_edit")
		updateProduct(id: ID!, data: ProductInput!): Product! @hasRole(permission: "users_edit")

		addFavoriteProduct(productId: ID!, userId: ID!): Product!
		removeFavoriteProduct(productId: ID!, userId: ID!): Product!
	}
`;

export const resolvers =  {
	Mutation: {
		searchProducts(_, { search, exclude = [], companies }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'description', '$company.name$', '$company.displayName$'] });
			if (companies) where['$company.id$'] = companies;

			return Product.findAll({
				where: { ...where, active: true, id: { [Op.notIn]: exclude } },
				include: [Company]
			});
		},
		async createProduct(_, { data }, { company }) {
			if (data.file) {
				data.image = await upload(company.name, await data.file);
			}

			return conn.transaction(async (transaction) => {
				// check if selected category exists
				const category = await Category.findByPk(data.categoryId)
				if (!category) throw new Error('Categoria não encontrada');

				// create product
				const product = await category.createProduct(data, { transaction });

				// create options groups
				if (data.optionsGroups) await OptionsGroup.updateAll(data.optionsGroups, product, transaction);
					
				return product;
			})
		},
		async updateProduct(_, { id, data }, { company }) {
			if (data.file) {
				data.image = await upload(company.name, await data.file);
			}

			return conn.transaction(async (transaction) => {
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
				if (data.optionsGroups) await OptionsGroup.updateAll(data.optionsGroups, product, transaction);
			
				return productUpdated;
			})
		},
		async addFavoriteProduct(_, { productId, userId }) {
			// check if product exists
			const product = await Product.findByPk(productId);
			if (!product) throw new Error('Produto não encontrado');
			
			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			//add favorite product
			user.addFavoriteProduct(product);

			return product;
		},
		async removeFavoriteProduct(_, { productId, userId }) {
			// check if product exists
			const product = await Product.findByPk(productId);
			if (!product) throw new Error('Produto não encontrado');
			
			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			//add favorite product
			user.removeFavoriteProduct(product);

			return product;
		},
	},
	Query: {
		async product(_, { id }) {
			// check if product exists
			const product = await Product.findByPk(id);
			if (!product) throw new Error('Produto não encontrada');

			return product;
		},
	},
	Product: {
		countOptions(parent, { filter }) {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return Option.count({ where, include: [{ model: OptionsGroup, where: { productId: parent.get('id') } }] });
		},
		optionsGroups(parent, { filter }) {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;
			return parent.getOptionsGroups({ where, order: [['order', 'ASC']] });
		},
		category(parent) {
			return parent.getCategory();
		},
		countFavoritedBy(parent) {
			return parent.countFavoritedBy();
		},
		favoritedBy(parent, { pagination }) {
			return parent.getFavoritedBy({
				...getSQLPagination(pagination)
			});
		},
		company (parent) {
			return parent.getCompany();
		},
		countCampaigns(parent, { notIn = {} }) {
			// count all realted campaigns
			return Campaign.count({
				where: {
					...campaignProductWhere(parent),
					id: { [Op.notIn]: notIn }
				},
				include: [Product, Company]
			})
		},
		campaigns(parent, { notIn = {} }) {
			// get all realted campaigns
			return Campaign.findAll({
				where: {
					...campaignProductWhere(parent),
					id: { [Op.notIn]: notIn }
				},
				include: [Product, Company]
			})
		},

		// calculate price should be charged (campaigns, discounts, etc)
		async finalPrice(parent) {
			const campaigns = await Campaign.findAll({
				where: {
					...campaignProductWhere(parent),
					type: 'discount'
				},
				order: [['value', 'ASC']],
				include: [Product, Company]
			});

			const acceptOtherCampaigns = campaigns.filter(c => c.acceptOtherCampaign === true);
			const doNotAcceptOtherCampaigns = campaigns.find(c => c.acceptOtherCampaign === false);

			if (acceptOtherCampaigns.length)
				return calculateProcuctFinalPrice(parent, acceptOtherCampaigns);
				
			if (doNotAcceptOtherCampaigns)
				return calculateProcuctFinalPrice(parent, [doNotAcceptOtherCampaigns]);

			return 0;
		}
	}
}