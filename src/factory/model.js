/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 */
import path from 'path';

import { authenticate } from '../controller/authentication';
import { setupDataBase } from '../controller/setupDB';
import Address from '../model/address';
import Category from '../model/category';
import Company from '../model/company';
import CompanyMeta from '../model/companyMeta';
import CompanyPaymentMethod from '../model/companyPaymentMethod';
import CompanyType from '../model/companyType';
import CompanyUser from '../model/companyUser';
import Coupon from '../model/coupon';
import CreditBalance from '../model/creditBalance';
import CreditHistory from '../model/creditHistory';
import Delivery from '../model/delivery';
import DeliveryArea from '../model/deliveryArea';
import Options from '../model/option';
import OptionsGroup from '../model/optionsGroup';
import Order from '../model/order';
import OrderOptions from '../model/orderOptions';
import orderOptionsGroup  from '../model/orderOptionsGroup';
import OrderProduct from '../model/orderProduct';
import PaymentMethod from '../model/paymentMethod';
import PeDeliveryArea from '../model/peDeliveryArea';
import Product from '../model/product';
import Rating from '../model/rating';
import Role from '../model/role';
import Sale from '../model/sale';
import CreditHistoryTriggerFactory from '../model/triggers/credit_history';
import UserTriggerFactory from '../model/triggers/user';
import User from '../model/user';
import UserMeta from '../model/userMeta';
import ViewArea from '../model/viewArea';
import AppRouter from './router';

class ModelsFactory {
	start() {
		console.log('Start setup DB models')
		this.setupAssociations();
		this.setupTriggers();
		this.setupRoutes();
		
		console.log(' - DB ready\n')
	}

	setupRoutes () {
		// porta de instalação
		AppRouter.add('DB', (router)=> {
			router.get('/setup', setupDataBase);

			// porta de instalação
			router.get('/sync/:table/:auth', async (req, res) => {
				try {
					const authorization = req.params.auth;
					if (!authorization) return res.sendStatus(403);

					const user = await authenticate(authorization, false);
					if (user.get('role') !== 'master') return res.sendStatus(403);
	
					const { table } = req.params;
					const model = require(path.resolve(__dirname, '..', 'model', table)).default

					await model.sync({ alter: true });
	
					res.send(`${table} alterado com sucesso`);
				} catch (err) {
					res.send(err.message)
				}
			});
		})

		console.log(' - Added DB Routes')
	}

	setupTriggers () {
		UserTriggerFactory.start();
		CreditHistoryTriggerFactory.start();
	}

	setupAssociations() {
		// Company Relations
		Company.hasMany(CompanyMeta);
		Company.belongsToMany(User, { through: CompanyUser });
		Company.belongsToMany(PaymentMethod, { through: CompanyPaymentMethod });
		Company.belongsToMany(User, { through: CompanyUser });
		Company.belongsTo(CompanyType);
		CompanyType.hasMany(Company);
		Company.belongsTo(Address);
		
		// Delivery Areas
		Company.hasMany(DeliveryArea);
		Company.hasMany(ViewArea);
		Company.hasMany(PeDeliveryArea);

		// categories relations
		Category.belongsTo(Company);
		Company.hasMany(Category);

		// rating relations
		Rating.belongsTo(Company);
		Company.hasMany(Rating);
		Rating.belongsTo(Order);
		Order.hasOne(Rating);
		Rating.belongsTo(User);
		User.hasMany(Rating);

		// Role relations
		Role.hasMany(CompanyUser);
		CompanyUser.belongsTo(Role);

		// Statement relations
		CreditHistory.belongsTo(User);
		CreditHistory.hasOne(Order);
		Order.belongsTo(CreditHistory);
		User.hasMany(CreditHistory);

		// CreditBalance relations
		User.hasOne(CreditBalance);
		CreditBalance.belongsTo(User);

		// PaymentMethod
		PaymentMethod.belongsToMany(Company, { through: CompanyPaymentMethod });

		// User relations
		User.hasMany(UserMeta);
		User.hasMany(Order);
		User.belongsToMany(Company, { through: CompanyUser });
		User.belongsToMany(Address, { through: 'user_addresses' });

		//UserMeta
		UserMeta.belongsTo(User);

		//Category relations
		Product.belongsTo(Category);
		Category.hasMany(Product);

		//Product relations
		Product.belongsTo(Company);
		Company.hasMany(Product);
		Product.hasOne(OrderProduct, { as: 'productRelated' });
		Product.hasMany(OptionsGroup);

		//OptionsGroup relations
		OptionsGroup.hasMany(Options);
		OptionsGroup.belongsTo(OptionsGroup, { foreignKey: 'maxSelectRestrain', as: 'groupRestrained' });
		OptionsGroup.hasOne(OptionsGroup, { foreignKey: 'maxSelectRestrain', as: 'restrainedBy' });
		OptionsGroup.belongsTo(Product);

		//Options relations
		Options.belongsTo(OptionsGroup);

		// Order relations
		Order.belongsTo(User);
		Company.hasMany(Order);
		Order.belongsTo(Company);
		Order.hasMany(OrderProduct, { as: 'products' });
		OrderProduct.hasMany(orderOptionsGroup, { as: 'optionsGroups', onDelete: 'cascade' });
		orderOptionsGroup.hasMany(OrderOptions, { as: 'options', onDelete: 'cascade' });
		Order.belongsTo(PaymentMethod);

		//  Order Product relations
		OrderProduct.belongsTo(Product, { as: 'productRelated' });
		orderOptionsGroup.belongsTo(OptionsGroup, { as: 'optionsGroupRelated' });
		OrderOptions.belongsTo(Options, { as: 'optionRelated' });

		// Coupon relations
		Coupon.belongsToMany(Product, { through: 'coupon_products' });
		Product.belongsToMany(Coupon, { through: 'coupon_products' });
		Coupon.belongsToMany(Company, { through: 'coupon_companies' });
		Company.belongsToMany(Coupon, { through: 'coupon_companies' });
		Coupon.belongsToMany(User, { through: 'coupon_users' });
		User.belongsToMany(Coupon, { through: 'coupon_users' });
		Coupon.hasMany(Order);
		Order.belongsTo(Coupon);
		/* Coupon.belongsToMany(User, { through: 'user_coupons' });
		User.belongsToMany(Coupon, { through: 'user_coupons' }); */

		// favorites
		User.belongsToMany(Product, { through: 'favorite_products', as: 'favoriteProducts' });
		Product.belongsToMany(User, { through: 'favorite_products', as: 'favoritedBy' });

		// Sales relations
		Sale.belongsTo(Product);
		Product.hasMany(Sale);

		// Deliveries
		Delivery.belongsTo(Order);
		Order.hasOne(Delivery);
		Delivery.belongsTo(User);
		User.hasOne(Delivery);
		Delivery.belongsTo(User, { as: 'deliveryMan' });
		User.hasOne(Delivery, { as: 'deliveryMan' });

		console.log(' - Setup DB Associations')
	}
}

const AppModels = new ModelsFactory();

export default AppModels;