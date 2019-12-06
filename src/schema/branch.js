const { gql } = require('apollo-server');

const sequelize = require('../services/connection');
const Sequelize = require('sequelize');
const Branches = require('../model/branches');
const Users = require('../model/users');
const Products = require('../model/products');
const OrdersProducts = require('../model/orders_products');
const ProductsCategories = require('../model/products_categories');
const BranchesMeta = require('../model/branches_meta');
const PaymentMethods = require('../model/payment_methods');
const { sanitizeFilter, getSQLPagination } = require('../utilities');

module.exports.typeDefs = gql`
	type BranchMeta {
		id:ID!
		meta_type:String!
		meta_value:String!
		createdAt:String!
	}

	type BusinessTime {
		from:String
		to:String
	}


	type BusinessHour {
		day_of_week:String!
		hours:[BusinessTime]!
	}

	input BusinessTimeInput {
		from:String
		to:String
	}
	
	input BusinessHourInput {
		day_of_week:String!
		hours:[BusinessTimeInput!]!
	}

	type ProductBestSeller {
		id:ID!
		name:String!
		image:String!
		qty:Int!
	}

	type Branch {
		id: ID!
		name: String!
		active: Boolean!
		createdAt: String! @dateTime
		updatedAt: String! @dateTime
		company: Company!
		user_relation: BranchRelation!
		last_month_revenue: Float!

		metas: [BranchMeta]!
		phones: [Phone]!
		address: Address!
		business_hours: [BusinessHour]!

		paymentMethods: [PaymentMethod]!
		deliveryAreas: [DeliveryArea]!
		featuredProducts(limit:Int): [Product]!

		countOrders(filter:Filter): Int!
		orders(filter:Filter, pagination: Pagination): [Order]!

		countUsers(filter:Filter): Int!
		users(filter:Filter, pagination: Pagination): [User]!

		countCategories(filter:Filter): Int!
		categories(filter:Filter, pagination: Pagination): [Category]!

		countProducts(filter:Filter): Int!
		products(filter:Filter, pagination: Pagination): [Product]!

		best_sellers (limit:Int!, createdAt:String): [ProductBestSeller]!
	}

	input BranchMetaInput {
		id:ID
		action:String! #create | update | delete
		meta_type:String
		meta_value:String
	}
	
	input BranchInput {
		name:String
		active:Boolean
		metas:[BranchMetaInput]
	}

	extend type Query {
		branch(id:ID!): Branch!
	}

	extend type Mutation {
		createBranch(data:BranchInput!):Branch! @hasRole(permission:"branches_edit", scope:"adm")
		updateBranch(id:ID!, data:BranchInput!): Branch! @hasRole(permission:"branches_edit", scope:"adm")

		enablePaymentMethod(id:ID!):Branch! @hasRole(permission:"payment_methods_edit", scope:"adm")
		disablePaymentMethod(id:ID!):Branch! @hasRole(permission:"payment_methods_edit", scope:"adm")

		updateBusinessHours(data:[BusinessHourInput]!):[BusinessHour]! @hasRole(permission:"branches_edit", scope:"adm")
	}
`;

module.exports.resolvers = {
	Query : {
		branch: (parent, {id}, ctx) => {
			return Branches.findByPk(id)
			.then(branch => {
				if (!branch) throw new Error('Filial não encontrada');
				return branch;
			})
		}
	},
	Mutation:{
		updateBusinessHours: (parent, {data}, ctx) => {
			return ctx.branch.getMetas({where:{meta_type:'business_hours'}})
			.then(async ([business_hours])=>{
				const meta_value = JSON.stringify(data);
				if (!business_hours) {
					//create
					await ctx.branch.createMeta({meta_type: 'business_hours', meta_value});
				} else {
					//update
					await business_hours.update({meta_value});
				
				}
				return data;
			})
		},
		createBranch: (parent, {data}, ctx) => {
			return sequelize.transaction(transaction => {
				return Branches.create(data, {include:[BranchesMeta], transaction})
				.then(branch => {
					return ctx.company.addBranch(branch, {transaction});
				});
			})
		},
		updateBranch: (_, {id, data}, ctx) => {
			return sequelize.transaction(transaction => {
				return ctx.company.getBranches({where:{id}})
				.then(([branch])=>{
					if (!branch) throw new Error('Filial não encontrada');

					return branch.update(data, { fields: ['name', 'active'], transaction });
				})
				.then(async (branch_updated) => {
					if (data.metas) {
						await BranchesMeta.updateAll(data.metas, branch_updated, transaction);
					}
					return branch_updated;
				})
			})
		},
		enablePaymentMethod : (_, {id}, ctx) => {
			return PaymentMethods.findByPk(id)
			.then (async (payment_method) => {
				if (!payment_method) throw new Error('Método de pagamento não encontrado');

				const [method] = await ctx.branch.addPaymentMethods(payment_method);
				
				return ctx.branch;
			})
		},
		disablePaymentMethod : (parent, {id}, ctx) => {
			return PaymentMethods.findByPk(id)
			.then (async (payment_method) => {
				if (!payment_method) throw new Error('Método de pagamento não encontrado');

				const method = await ctx.branch.removePaymentMethod(payment_method);

				return ctx.branch;
			})
		},
		
	},
	Branch: {
		countUsers: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter, { search: ['first_name', 'last_name', 'email']});

			return parent.countUsers({ where: _filter });
		},
		users: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['first_name', 'last_name', 'email']});

			return parent.getUsers({
				where: _filter,
				order: [['first_name', 'ASC'], ['last_name', 'ASC']],
				...getSQLPagination(pagination),
			});
		},
		address: (parent) => {
			return parent.getMetas({where:{meta_type:'address'}})
			.then (([address])=> {
				if (!address) throw new Error('Não foi encontrado o endereço dessa filial');

				return {id:address.id, ...JSON.parse(address.meta_value)};
			})
		},
		metas: (parent, { type }) => {
			let where = {};

			if (type) {
				where = { where: { meta_type: type } }
			}

			return parent.getMetas(where);
		},
		phones: (parent) => {
			return parent.getMetas({ where: { meta_type: 'phone' } })
				.then((phones) => {
					return phones.map((phone) => ({
						id: phone.id,
						number: phone.meta_value
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
		countProducts : (parent, { filter }) => {
			const _filter = sanitizeFilter(filter);

			return Products.count({
				where: _filter,
				include: [{ model: ProductsCategories, where: { branch_id: parent.get('id') } }],
			})
		},
		products : (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter);

			return Products.findAll({
				where: _filter,
				include: [{ model: ProductsCategories, where: { branch_id: parent.get('id') } }],
				order: [['name', 'ASC']],
				...getSQLPagination(pagination),
			})
		},
		featuredProducts: (parent, { limit = 5 }) => {
			return Products.findAll({
				where: {
					featured: true,
					['$category.branch_id$']: parent.get('id')
				},
				limit,
				include: [{
					model:ProductsCategories
				}],
				order: [['updatedAt', 'DESC']]
			})
				.then(products => {
					if (products.length > 0) return products;

					return Products.findAll({
						where: {
							['$category.branch_id$']: parent.get('id')
						},
						limit,
						include: [{
							model:ProductsCategories
						}]
					})
				})
		},
		paymentMethods: (parent, args, ctx) => {
			return parent.getPaymentMethods();
		},
		deliveryAreas: (parent, args, ctx) => {
			return parent.getDeliveryAreas();
		},
		business_hours: (parent, args, ctx) => {
			return parent.getMetas({where:{meta_type:'business_hours'}})
			.then(([business_hours])=>{
				if (!business_hours) {
					return [
						{
							day_of_week:'Domingo',
							hours:[{from:'', to:''}]
						},
						{
							day_of_week:'Segunda-Feira',
							hours:[{from:'', to:''}]
						},
						{
							day_of_week:'Terça-Feira',
							hours:[{from:'', to:''}]
						},
						{
							day_of_week:'Quarta-Feira',
							hours:[{from:'', to:''}]
						},
						{
							day_of_week:'Quinta-Feira',
							hours:[{from:'', to:''}]
						},
						{
							day_of_week:'Sexta-Feira',
							hours:[{from:'', to:''}]
						},
						{
							day_of_week:'Sábado',
							hours:[{from:'', to:''}]
						},
					]
				} else {
					return JSON.parse(business_hours.meta_value);
				}
			})
		},
		countOrders: (parent, {filter}) => {
			const search = ['street', 'complement', '$user.first_name$', '$user.last_name$', '$user.email$'];
			const _filter = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'orders' });

			return parent.countOrders({ where: _filter, include: [Users] });
		},
		orders: (parent, { filter, pagination }) => {
			const search = ['street', 'complement', '$user.first_name$', '$user.last_name$', '$user.email$'];
			const _filter = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'orders' });

			return parent.getOrders({
				where: _filter,
				order:[['createdAt', 'DESC']],
				...getSQLPagination(pagination),

				include: [Users]
			});
		},
		user_relation: (parent) => {
			if (!parent.branch_relation) throw new Error('Nenhum usuário selecionado');
			return parent.branch_relation.getRole()
			.then(role => {
				return {
					...parent.branch_relation.get(),
					role,
				}
			});
		},
		last_month_revenue : () => {
			return 0;
		},
		best_sellers: (_, {limit, createdAt}) => {
			let where = {};

			if (createdAt) {
				where = Sequelize.where(Sequelize.fn('date', Sequelize.col('OrdersProducts.created_at')), Sequelize.fn(createdAt));
			}

			return OrdersProducts.findAll({
				attributes:[
					[Sequelize.col('product_id'), 'id'],
					[Sequelize.col('productRelated.name'), 'name'],
					[Sequelize.col('productRelated.image'), 'image'],
					[Sequelize.fn('COUNT', Sequelize.col('product_id')), 'qty']
				],
				group: ['product_id'],
				order: [[Sequelize.fn('COUNT', Sequelize.col('product_id')), 'DESC'], [Sequelize.col('name'), 'ASC']],

				limit,
				where,

				include:[{
					model: Products,
					as:'productRelated'
				}]
			})
			.then (products=> {
				return products.map(row=>row.get());
			})
		}
	}
}