/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 */
import path from 'path';

import { authenticate } from '../controller/authentication';
import { setupDataBase } from '../controller/setupDB';
import DB from '../model';
import CreditHistoryTriggerFactory from '../model/triggers/credit_history';
import UserTriggerFactory from '../model/triggers/user';
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
		//console.log(models);
		// Company Relations
		DB.company.hasMany(DB.companyMeta);
		DB.company.belongsToMany(DB.user, { through: DB.companyRelation });
		DB.company.belongsToMany(DB.paymentMethod, { through: DB.companyPaymentMethod });
		DB.company.belongsToMany(DB.user, { through: DB.companyRelation });
		DB.company.belongsTo(DB.companyType);
		DB.companyType.hasMany(DB.company);
		DB.company.belongsTo(DB.address);
		
		// Delivery Areas
		DB.company.hasMany(DB.deliveryArea);
		DB.company.hasMany(DB.viewArea);
		DB.company.hasMany(DB.peDeliveryArea);

		// categories relations
		DB.category.belongsTo(DB.company);
		DB.company.hasMany(DB.category);

		// rating relations
		DB.rating.belongsTo(DB.company);
		DB.company.hasMany(DB.rating);
		DB.rating.belongsTo(DB.order);
		DB.order.hasOne(DB.rating);
		DB.rating.belongsTo(DB.user);
		DB.user.hasMany(DB.rating);

		// Role relations
		DB.role.hasMany(DB.companyRelation);
		DB.companyRelation.belongsTo(DB.role);

		// Statement relations
		DB.creditHistory.belongsTo(DB.user);
		DB.creditHistory.hasOne(DB.order);
		DB.order.belongsTo(DB.creditHistory);
		DB.user.hasMany(DB.creditHistory);

		// CreditBalance relations
		DB.user.hasOne(DB.creditBalance);
		DB.creditBalance.belongsTo(DB.user);

		// PaymentMethod
		DB.paymentMethod.belongsToMany(DB.company, { through: DB.companyPaymentMethod });

		// User relations
		DB.user.hasMany(DB.userMeta);
		DB.user.hasMany(DB.order);
		DB.user.belongsToMany(DB.company, { through: DB.companyRelation });
		DB.user.belongsToMany(DB.address, { through: DB.userAddress });

		//UserMeta
		DB.userMeta.belongsTo(DB.user);

		//Category relations
		DB.product.belongsTo(DB.category);
		DB.category.hasMany(DB.product);

		//Product relations
		DB.product.belongsTo(DB.company);
		DB.company.hasMany(DB.product);
		DB.product.hasOne(DB.orderProduct, { as: 'productRelated' });
		DB.product.hasMany(DB.optionsGroup);

		//OptionsGroup relations
		DB.optionsGroup.hasMany(DB.option);
		DB.optionsGroup.belongsTo(DB.optionsGroup, { foreignKey: 'maxSelectRestrain', as: 'groupRestrained' });
		DB.optionsGroup.hasOne(DB.optionsGroup, { foreignKey: 'maxSelectRestrain', as: 'restrainedBy' });
		DB.optionsGroup.belongsTo(DB.product);

		//Options relations
		DB.option.belongsTo(DB.optionsGroup);

		// Order relations
		DB.order.belongsTo(DB.user);
		DB.company.hasMany(DB.order);
		DB.order.belongsTo(DB.company);
		DB.order.hasMany(DB.orderProduct, { as: 'products' });
		DB.orderProduct.hasMany(DB.orderOptionsGroup, { as: 'optionsGroups', onDelete: 'cascade' });
		DB.orderOptionsGroup.hasMany(DB.orderOptions, { as: 'options', onDelete: 'cascade' });
		DB.order.belongsTo(DB.paymentMethod);

		//  Order Product relations
		DB.orderProduct.belongsTo(DB.product, { as: 'productRelated' });
		DB.orderOptionsGroup.belongsTo(DB.optionsGroup, { as: 'optionsGroupRelated' });
		DB.orderOptions.belongsTo(DB.option, { as: 'optionRelated' });

		// Coupon relations
		DB.coupon.belongsToMany(DB.product, { through: 'coupon_products' });
		DB.product.belongsToMany(DB.coupon, { through: 'coupon_products' });
		DB.coupon.belongsToMany(DB.company, { through: 'coupon_companies' });
		DB.company.belongsToMany(DB.coupon, { through: 'coupon_companies' });
		DB.coupon.belongsToMany(DB.user, { through: 'coupon_users' });
		DB.user.belongsToMany(DB.coupon, { through: 'coupon_users' });
		DB.coupon.hasMany(DB.order);
		DB.order.belongsTo(DB.coupon);
		/* Coupon.belongsToMany(User, { through: 'user_coupons' });
		User.belongsToMany(Coupon, { through: 'user_coupons' }); */

		// favorites
		DB.user.belongsToMany(DB.product, { through: 'favorite_products', as: 'favoriteProducts' });
		DB.product.belongsToMany(DB.user, { through: 'favorite_products', as: 'favoritedBy' });

		// Sales relations
		DB.sale.belongsTo(DB.product);
		DB.product.hasMany(DB.sale);

		// Deliveries
		DB.delivery.belongsTo(DB.order);
		DB.order.hasOne(DB.delivery);
		DB.delivery.belongsTo(DB.user, { as: 'deliveryMan' });
		DB.user.hasMany(DB.delivery, { foreignKey: 'deliveryManId' });

		console.log(' - Setup DB Associations')
	}
}

const AppModels = new ModelsFactory();

export default AppModels;