import { gql }  from 'apollo-server';
import { Op, fn, col, where, literal, QueryTypes } from 'sequelize';

import CompanyController from '../controller/company';
import DeliveryAreaController from '../controller/deliveryArea';
import OrderController from '../controller/order';
import { upload } from '../controller/uploads';
import ConfigEntity from '../entities/Config';
import JobQueue from '../factory/queue';
import { deliveryTimeLoader, businessHoursLoader, rateLoader, addressLoader } from '../loaders';
import companyTypeLoader from '../loaders/companyTypeLoader';
import DB from '../model';
import Address from '../model/address';
import Company  from '../model/company';
import CompanyMeta  from '../model/companyMeta';
import OrderProduct from '../model/orderProduct';
import Product from '../model/product';
import Rating  from '../model/rating';
import User from '../model/user';
import conn  from '../services/connection';
import { getSQLPagination, sanitizeFilter }  from '../utilities';
import { calculateDistance, CompanyAreaSelect } from '../utilities/address'
import { companyIsOpen, DELIVERY_TYPE_META } from '../utilities/company';
import { DELIVERY_GLOBAL_ACTIVE } from '../utilities/config';

const configEntity = new ConfigEntity();

export const typeDefs =  gql`
	type Company {
		id: ID!
		name: String!
		displayName: String!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!
		metas(keys: [String]): [Meta]!
		lastMonthRevenue: Float!
		userRelation: CompanyRelation!
		published: Boolean!

		isOpen: Boolean!
		nextOpen: DateTime
		nextClose: DateTime
		allowBuyClosed: String

		acceptTakeout: Boolean! #deprecated

		# customization
		image: String
		backgroundColor: String

		rankPosition(radius: Int!): Int!

		address: Address

		type: CompanyType!

		countUsers(filter: Filter): Int! @hasRole(permission: "users_read")
		users(filter: Filter, pagination: Pagination): [User]! @hasRole(permission: "users_read")

		deliveryTime: Int! #minutes

		paymentMethods(filter: Filter): [PaymentMethod]!

		bestSellers(filter:Filter, pagination: Pagination): [ProductBestSeller]!

		businessHours: [BusinessHour]!

		countProducts(filter:Filter): Int!
		products(filter:Filter, pagination: Pagination): [Product]! @hasRole(permission: "products_read")

		countRatings(filter:Filter): Int!
		ratings(filter:Filter, pagination: Pagination): [Rating]!
		rate: Float!

		countCategories(filter: Filter): Int!
		categories(filter: Filter, pagination: Pagination): [Category]!

		distance(location: GeoPoint): Float! #kilometers
		typePickUp(location: GeoPoint): Boolean!
		typeDelivery(location: GeoPoint): Boolean!

		delivery: DeliveryArea
		pickup: ViewArea
	}

	extend type Product {
		company(location: GeoPoint): Company!
	}

	type ProductBestSeller {
		id: ID!
		name: String!
		image: String!
		qty: Int!
	}	

	input CompanyInput {
		name: String
		displayName: String
		backgroundColor: String
		file: Upload
		companyTypeId: ID
		active: Boolean
		metas: [MetaInput]
		address: AddressInput
		published: Boolean
	}

	type CompanyCustomization {
		color: String!
		background: String!
		logo: String!
	}

	extend type Mutation {
		# Search on APP
		searchCompaniesOnApp(search: String!, location: GeoPoint!): [Company]!

		# APP notifications
		sendNewCompanyNoticiation(companyId: ID!): Boolean!
		
		# Search on ADM
		searchCompanies(search: String!, exclude: [ID]): [Company]! @hasRole(permission: "companies_edit")
		createCompany(data: CompanyInput!): Company! @hasRole(permission: "companies_edit")
		updateCompany(id: ID!, data: CompanyInput!): Company! @hasRole(permission: "companies_edit")

		#configurations
		setCompanyConfig(companyId: ID!, key: String!, value: JSON!, type: String): JSON!
		setCompanyConfigs(companyId: ID!, data: [JSON!]!): JSON!
	}

	extend type Query {
		company(id: ID!, location: GeoPoint): Company!
		countCompanies(filter: JSON): Int! @hasRole(permission: "master")
		companies(filter: JSON, pagination: Pagination, location: GeoPoint): [Company]!
		ordersStatusQty(companyId: ID!): JSON!

		#configurations
		companyConfig(companyId: ID!, keys: [String!]!): JSON!
	}
`;

export const resolvers =  {
	Mutation: {
		/**
		 * DEVE SER USADO APENAS NO APP
		 */
		searchCompaniesOnApp(_, { search, location }) {
			const filter = { search, published: true };
			const where = sanitizeFilter(filter, { search: ['name', 'displayName', '$companyType.name$'] });

			return CompanyController.getCompanies(where, location);
		},
		async sendNewCompanyNoticiation(_, { companyId }) {
			JobQueue.notifications.add('createCompany', { companyId })

			return true;
		},
		//

		searchCompanies(_, { search, exclude = [] }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'displayName'] });

			return Company.findAll({ where: { ...where, active: true, id: { [Op.notIn]: exclude } } });
		},
		async createCompany(_, { data }) {
			if (data.file) data.image = await upload(data.name, await data.file);

			return await Company.create(data, { include: [CompanyMeta, Address] })
		},
		updateCompany(_, { id, data }) {
			return conn.transaction(async transaction => {
				if (data.file) data.image = await upload(data.name, await data.file);

				// check if company exists
				const companyFound = await Company.findByPk(id)
				if (!companyFound) throw new Error('Empresa não encontrada');

				// update company address
				const address = await companyFound.getAddress();
				if (address)
					address.cache().update(data.address);
				else
					companyFound.createAddress(data.address);

				// update company
				const updatedCompany = await companyFound.cache().update(data, { fields: ['name', 'displayName', 'active', 'companyTypeId', 'image', 'backgroundColor', 'published'], transaction })
			
				// check if there are metas to update
				if (data.metas) await CompanyMeta.updateAll(data.metas, updatedCompany, transaction);
				
				return updatedCompany;
			})
		},
		setCompanyConfig(_, { companyId, key, value, type }) {
			return CompanyController.setConfig(companyId, key, value, type);
		},
		setCompanyConfigs(_, { companyId, data }) {
			return CompanyController.setConfigs(companyId, data);
		}
	},
	Query: {
		ordersStatusQty(_, { companyId }) {
			return OrderController.getOrderStatusQty(companyId);
		},
		countCompanies: (_, { filter }) => {
			const where = sanitizeFilter(filter, { search: ['name', 'displayName'], table: 'company' });

			return Company.count({ where });
		},
		companies(_, { filter={}, pagination, location }) {
			if (location) filter.published = true;
			const where = sanitizeFilter(filter, { excludeFilters: ['location'], search: ['name', 'displayName'], table: 'company' });

			return CompanyController.getCompanies(where, location, pagination)
		},
		async company(_, { id, location }) {
			// check if company exists
			return CompanyController.getCompany(id, location)
		},
		async companyConfig(parent, { companyId, keys }) {
			const configs = await Promise.all(keys.map(key=>CompanyController.getConfig(companyId, key)));
			const configCollection = {};

			for (let i=0; i<configs.length; i++) {
				const value = configs[i];
				const key = keys[i];
				configCollection[key] = value
			}

			return configCollection;
		}
	},
	CompanyRelation: {
		role(parent) {
			return DB.role.findByPk(parent.get('roleId'));
		}
	},
	Company: {
		async delivery(parent, _, __, { variableValues }) {
			const location = variableValues.location || null;
			if (!location) throw new Error('Não é possível retornar uma área de entrega sem definir uma localização');

			// get delivery type global configuration
			const deliveryGlobalActive = await configEntity.get(DELIVERY_GLOBAL_ACTIVE);

			if (!deliveryGlobalActive && parent.deliveryAreas && parent.deliveryAreas.length)
				return parent.deliveryAreas[0];

			
			const orderType = !deliveryGlobalActive ? 'delivery' : await CompanyController.getConfig(parent.get('id'), DELIVERY_TYPE_META);

			// get closest area to define price
			
			return await DeliveryAreaController.getArea(parent, location, orderType);
		},
		pickup(parent) {
			if (parent.viewAreas && parent.viewAreas.length)
				return parent.viewAreas[0];
			
			return null;
		},
		// deprecated
		typePickUp(parent, { location }) {
			if (parent.viewAreas && parent.viewAreas.length)
				return true;

			// legacy verifications
			if (!location) return false;

			return conn.query(CompanyAreaSelect('typePickUp', location,`'${parent.get('id')}'`), { type: QueryTypes.SELECT })
				.then(([{ result }])=>result);
			
			
			//return false;
		},
		// deprecated
		async typeDelivery(parent, args, __, { variableValues }) {
			const location = variableValues.location || args.location;
			if (!location) return false;

			const deliveryGlobalActive = await configEntity.get(DELIVERY_GLOBAL_ACTIVE);

			if (deliveryGlobalActive) {
				const orderType = await CompanyController.getConfig(parent.get('id'), DELIVERY_TYPE_META);

				if ( parent.deliveryAreas && parent.deliveryAreas.length ) return true;

				// get closest area to define price
				if ((orderType && orderType === 'peDelivery')) {
					return await conn.query(CompanyAreaSelect('typePickUp', location,`'${parent.get('id')}'`), { type: QueryTypes.SELECT })
						.then(([{ result }])=>result);
				}
			}

			// legacy verifications

			return await conn.query(CompanyAreaSelect('typeDelivery', location,`'${parent.get('id')}'`), { type: QueryTypes.SELECT })
				.then(([{ result }])=>result);
			
			//return false;
		},
		address(parent) {
			const addressId = parent.get('addressId');
			
			return addressLoader.load(addressId);
		},
		userRelation: (parent) => {
			if (!parent.companyRelation) throw new Error('Nenhum usuário selecionado');

			return parent.companyRelation;
		},
		countUsers: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter, { search: ['firstName', 'lastName', 'email'] });

			return parent.countUsers({ where: _filter });
		},
		users: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['firstName', 'lastName', 'email'] });

			return parent.getUsers({
				where: _filter,
				order: [['firstName', 'ASC'], ['lastName', 'ASC']],
				...getSQLPagination(pagination),
			});
		},
		metas: (parent, { keys }) => {
			if (keys)
				return parent.getMetas({ where: { key: keys } });
			
			return parent.getMetas();
		},
		lastMonthRevenue: () => {
			return 0;
		},
		async deliveryTime(parent) {
			const meta = await deliveryTimeLoader.load(parent.get('id'));
			
			return meta;
		},
		async bestSellers(_, { filter, pagination }) {
			const where = sanitizeFilter(filter, { table: 'orderproduct' });

			const products = await OrderProduct.findAll({
				attributes: [
					[conn.col('productId'), 'id'],
					[conn.col('productRelated.name'), 'name'],
					[conn.col('productRelated.image'), 'image'],
					[conn.fn('COUNT', conn.col('productId')), 'qty']
				],
				group: ['productId'],
				order: [[conn.fn('COUNT', conn.col('productId')), 'DESC'], [conn.col('name'), 'ASC']],
				include: [{
					model: Product,
					as: 'productRelated'
				}],
				
				where,
				...getSQLPagination(pagination),
			});

			return products.map(row => row.get());
		},

		businessHours(parent) {
			return businessHoursLoader.load(parent.get('id'));
		},
		async isOpen(parent) {
			const isOpen = parent.get('isOpen')
			if (typeof isOpen !== 'undefined') return isOpen;

			// deprecated
			const businessHours = await businessHoursLoader.load(parent.get('id'));
			return companyIsOpen(businessHours);
		},
		async nextOpen(parent) {
			return parent.get('nextOpen');
		},
		async nextClose(parent) {
			return parent.get('nextClose');
		},
		async allowBuyClosed(parent) {
			return parent.get('allowBuyClosed')
		},

		countProducts(parent, { filter }) {
			const _filter = sanitizeFilter(filter);

			// find and count products
			return parent.countProducts({ where: _filter });
		},
		products (parent, { filter, pagination }) {
			if (parent.products) return parent.products;

			const where = sanitizeFilter(filter);

			return parent.getProducts({
				where,
				order: [['name', 'ASC']],
				...getSQLPagination(pagination),
			})
		},

		type(parent) {
			const companyTypeId = parent.get('companyTypeId');
			return companyTypeLoader.load(companyTypeId);
		},

		paymentMethods(parent, { filter }) {
			const where = sanitizeFilter(filter);

			return parent.getPaymentMethods({
				where,
				order: [['order', 'ASC'], ['displayName', 'ASC']]
			});
		},

		countRatings(parent, { filter }) {
			const _filter = sanitizeFilter(filter, { excludeFilters: ['active'], search: ['comment', '$user.firstName$', '$user.email$'] });

			return parent.countRatings({
				where: _filter,
				order: [['createdAt', 'Desc']],

				include: [User]
			})
		},
		ratings(parent, { filter, pagination }) {
			const _filter = sanitizeFilter(filter, { excludeFilters: ['active'], search: ['comment', '$user.firstName$', '$user.email$'] });

			return parent.getRatings({
				where: _filter,
				order: [['createdAt', 'DESC']],
				...getSQLPagination(pagination),

				include: [User]
			})
		},
		async rankPosition(parent, { radius }) {
			const companyAddress = await parent.getAddress();
			if (!companyAddress) throw new Error('Endereço da empresa não encontrado')
			const companyPoint = fn('ST_GeomFromText', literal(`'POINT(${companyAddress.location.coordinates[0]} ${companyAddress.location.coordinates[1]})'`));
			
			const companies = await Company.findAll({
				attributes: ['id', 'name', [fn('AVG', col('ratings.rate')), 'averageRate']],
				include: [Address, Rating],
				where: where(fn('ST_Distance_Sphere', companyPoint, col('address.location')), '<', radius * 1000),
				order: [[literal('averageRate'), 'DESC']],
				group: 'company.id'
			})

			return companies.findIndex(c => parent.get('id') === c.get('id')) + 1;
		},

		countCategories(parent, { filter }) {
			const search = ['name', 'description'];
			const where = sanitizeFilter(filter, { search, table: 'order' });

			return parent.countCategories({ where });
		},
		categories(parent, { filter, pagination }) {
			const search = ['name', 'description'];
			const where = sanitizeFilter(filter, { search, table: 'order' });

			return parent.getCategories({
				where,
				include: [Product],
				...getSQLPagination(pagination),
			});
		},
		async rate(parent) {
			const companyId = parent.get('id');
			return rateLoader.load(companyId)
		},
		async distance(parent, _, __, { variableValues }) {
			if (parent.get('distance')) return parent.get('distance')

			const { location } = variableValues;

			if (!location) throw new Error('Distância não pode ser retornada sem uma localização')
			
			// deprecated
			const companyAddress = await Address.cache().findByPk(parent.get('addressId'));

			return calculateDistance({
				latitude: location.coordinates[0], longitude: location.coordinates[1]
			},{
				latitude: companyAddress.location.coordinates[0], longitude: companyAddress.location.coordinates[1]
			});
		}
	},
	Product: {
		company(parent, { location }) {
			if (parent.company) return parent.company;

			const companyId = parent.get('companyId');

			return CompanyController.companiesLoader(companyId, location)
		},
	}
}