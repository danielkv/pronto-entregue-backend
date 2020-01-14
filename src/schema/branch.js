import { gql }  from 'apollo-server';
import Sequelize  from 'sequelize';

import Branch  from '../model/branch';
import BranchMeta  from '../model/branchMeta';
import Category  from '../model/category';
import OrderProduct  from '../model/orderProduct';
import PaymentMethods  from '../model/paymentMethod';
import Product  from '../model/product';
import User  from '../model/user';
import sequelize  from '../services/connection';
import { sanitizeFilter, getSQLPagination }  from '../utilities';

export const typeDefs =  gql`
	type BusinessTime {
		from: String
		to: String
	}


	type BusinessHour {
		dayOfWeek: String!
		hours: [BusinessTime]!
	}

	input BusinessTimeInput {
		from: String
		to: String
	}
	
	input BusinessHourInput {
		dayOfWeek: String!
		hours: [BusinessTimeInput!]!
	}

	type ProductBestSeller {
		id: ID!
		name: String!
		image: String!
		qty: Int!
	}

	type Branch {
		id: ID!
		name: String!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!
		company: Company!
		userRelation: BranchRelation!
		lastMonthRevenue: Float!

		metas: [Meta]!
		phones: [Phone]!
		address: Address!
		businessHours: [BusinessHour]!

		paymentMethods: [PaymentMethod]!
		deliveryAreas: [DeliveryArea]!
		featuredProduct(limit: Int): [Product]!

		countOrders(filter: Filter): Int!
		orders(filter: Filter, pagination: Pagination): [Order]!

		countUser(filter: Filter): Int!
		user(filter: Filter, pagination: Pagination): [User]!

		countCategories(filter: Filter): Int!
		categories(filter: Filter, pagination: Pagination): [Category]!

		countProduct(filter: Filter): Int!
		product(filter: Filter, pagination: Pagination): [Product]!

		bestSellers (filter: Filter, pagination: Pagination): [ProductBestSeller]!
	}

	input BranchInput {
		name: String
		active: Boolean
		metas: [MetaInput]
	}

	extend type Query {
		branch(id: ID!): Branch!
	}

	extend type Mutation {
		createBranch(data: BranchInput!): Branch! @hasRole(permission: "branchEdit", scope: "adm")
		updateBranch(id: ID!, data: BranchInput!): Branch! @hasRole(permission: "branchEdit", scope: "adm")

		enablePaymentMethod(id: ID!): Branch! @hasRole(permission: "paymentMethodsEdit", scope: "adm")
		disablePaymentMethod(id: ID!): Branch! @hasRole(permission: "paymentMethodsEdit", scope: "adm")

		updateBusinessHours(data: [BusinessHourInput]!): [BusinessHour]! @hasRole(permission: "branchEdit", scope: "adm")
	}
`;

export const resolvers =  {
	Query: {
		branch: (_, { id }) => {
			return Branch.findByPk(id)
				.then(branch => {
					if (!branch) throw new Error('Filial não encontrada');
					return branch;
				})
		}
	},
	Mutation: {
		updateBusinessHours: (parent, { data }, ctx) => {
			return ctx.branch.getMetas({ where: { key: 'businessHours' } })
				.then(async ([businessHours])=>{
					const value = JSON.stringify(data);
					if (!businessHours) {
					//create
						await ctx.branch.createMeta({ key: 'businessHours', value });
					} else {
					//update
						await businessHours.update({ value });
				
					}
					return data;
				})
		},
		createBranch: (parent, { data }, ctx) => {
			return sequelize.transaction(transaction => {
				return Branch.create(data, { include: [BranchMeta], transaction })
					.then(branch => {
						return ctx.company.addBranch(branch, { transaction });
					});
			})
		},
		updateBranch: (_, { id, data }, ctx) => {
			return sequelize.transaction(transaction => {
				return ctx.company.getBranch({ where: { id } })
					.then(([branch])=>{
						if (!branch) throw new Error('Filial não encontrada');

						return branch.update(data, { fields: ['name', 'active'], transaction });
					})
					.then(async (branchUpdated) => {
						if (data.metas) {
							await BranchMeta.updateAll(data.metas, branchUpdated, transaction);
						}
						return branchUpdated;
					})
			})
		},
		enablePaymentMethod: (_, { id }, ctx) => {
			return PaymentMethods.findByPk(id)
				.then (async (paymentMethod) => {
					if (!paymentMethod) throw new Error('Método de pagamento não encontrado');

					await ctx.branch.addPaymentMethods(paymentMethod);
				
					return ctx.branch;
				})
		},
		disablePaymentMethod: (parent, { id }, ctx) => {
			return PaymentMethods.findByPk(id)
				.then (async (paymentMethod) => {
					if (!paymentMethod) throw new Error('Método de pagamento não encontrado');

					await ctx.branch.removePaymentMethod(paymentMethod);

					return ctx.branch;
				})
		},
		
	},
	Branch: {
		countUser: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter, { search: ['firstName', 'lastName', 'email'] });

			return parent.countUser({ where: _filter });
		},
		user: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['firstName', 'lastName', 'email'] });

			return parent.getUser({
				where: _filter,
				order: [['firstName', 'ASC'], ['lastName', 'ASC']],
				...getSQLPagination(pagination),
			});
		},
		address: (parent) => {
			return parent.getMetas({ where: { key: 'address' } })
				.then (([address])=> {
					if (!address) throw new Error('Não foi encontrado o endereço dessa filial');

					return { id: address.id, ...JSON.parse(address.value) };
				})
		},
		metas: (parent, { type }) => {
			let where = {};

			if (type) {
				where = { where: { key: type } }
			}

			return parent.getMetas(where);
		},
		phones: (parent) => {
			return parent.getMetas({ where: { key: 'phone' } })
				.then((phones) => {
					return phones.map((phone) => ({
						id: phone.id,
						number: phone.value
					}));
				})
		},
		countCategories: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter);

			return parent.countCategories({ where: _filter });
		},
		categories: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter);

			return parent.getCategories({
				where: _filter,
				order: [['order', 'ASC']],
				...getSQLPagination(pagination),
			});
		},
		countProduct: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter);

			return Product.count({
				where: _filter,
				include: [{ model: Category, where: { branchId: parent.get('id') } }],
			})
		},
		product: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter);

			return Product.findAll({
				where: _filter,
				include: [{ model: Category, where: { branchId: parent.get('id') } }],
				order: [['name', 'ASC']],
				...getSQLPagination(pagination),
			})
		},
		featuredProduct: (parent, { limit = 5 }) => {
			return Product.findAll({
				where: {
					featured: true,
					['$category.branchId$']: parent.get('id')
				},
				limit,
				include: [{
					model: Category
				}],
				order: [['updatedAt', 'DESC']]
			})
				.then(product => {
					if (product.length > 0) return product;

					return Product.findAll({
						where: {
							['$category.branchId$']: parent.get('id')
						},
						limit,
						include: [{
							model: Category
						}]
					})
				})
		},
		paymentMethods: (parent) => {
			return parent.getPaymentMethods();
		},
		deliveryAreas: (parent) => {
			return parent.getDeliveryAreas();
		},
		businessHours: (parent) => {
			return parent.getMetas({ where: { key: 'businessHours' } })
				.then(([businessHours])=>{
					if (!businessHours) {
						return [
							{
								dayOfWeek: 'Domingo',
								hours: [{ from: '', to: '' }]
							},
							{
								dayOfWeek: 'Segunda-Feira',
								hours: [{ from: '', to: '' }]
							},
							{
								dayOfWeek: 'Terça-Feira',
								hours: [{ from: '', to: '' }]
							},
							{
								dayOfWeek: 'Quarta-Feira',
								hours: [{ from: '', to: '' }]
							},
							{
								dayOfWeek: 'Quinta-Feira',
								hours: [{ from: '', to: '' }]
							},
							{
								dayOfWeek: 'Sexta-Feira',
								hours: [{ from: '', to: '' }]
							},
							{
								dayOfWeek: 'Sábado',
								hours: [{ from: '', to: '' }]
							},
						]
					} else {
						return JSON.parse(businessHours.value);
					}
				})
		},
		countOrders: (parent, { filter }) => {
			const search = ['street', 'complement', '$user.firstName$', '$user.lastName$', '$user.email$'];
			const _filter = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'orders' });

			return parent.countOrders({ where: _filter, include: [User] });
		},
		orders: (parent, { filter, pagination }) => {
			const search = ['street', 'complement', '$user.firstName$', '$user.lastName$', '$user.email$'];
			const _filter = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'orders' });

			return parent.getOrders({
				where: _filter,
				order: [['createdAt', 'DESC']],
				...getSQLPagination(pagination),

				include: [User]
			});
		},
		userRelation: (parent) => {
			if (!parent.branchRelation) throw new Error('Nenhum usuário selecionado');
			return parent.branchRelation.getRole()
				.then(role => {
					return {
						...parent.branchRelation.get(),
						role,
					}
				});
		},
		lastMonthRevenue: () => {
			return 0;
		},
		bestSellers: (_, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { excludeFilters: ['active'], table: 'OrderProduct' });

			return OrderProduct.findAll({
				attributes: [
					[Sequelize.col('productId'), 'id'],
					[Sequelize.col('productRelated.name'), 'name'],
					[Sequelize.col('productRelated.image'), 'image'],
					[Sequelize.fn('COUNT', Sequelize.col('productId')), 'qty']
				],
				group: ['productId'],
				order: [[Sequelize.fn('COUNT', Sequelize.col('productId')), 'DESC'], [Sequelize.col('name'), 'ASC']],

				...getSQLPagination(pagination),
				where: _filter,

				include: [{
					model: Product,
					as: 'productRelated'
				}]
			})
				.then (product=> {
					return product.map(row=>row.get());
				})
		}
	}
}