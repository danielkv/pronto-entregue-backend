/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 */

import Address from './address';
import Category from './category';
import Company from './company';
import CompanyMeta from './companyMeta';
import CompanyPaymentMethod from './companyPaymentMethod';
import CompanyType from './companyType';
import CompanyUser from './companyUser';
import Coupon from './coupon';
import CreditBalance from './creditBalance';
import CreditHistory from './creditHistory';
import Delivery from './delivery';
import DeliveryArea from './deliveryArea';
import Options from './option';
import OptionsGroup from './optionsGroup';
import Order from './order';
import OrderOptions from './orderOptions';
import orderOptionsGroup  from './orderOptionsGroup';
import OrderProduct from './orderProduct';
import PaymentMethod from './paymentMethod';
import Product from './product';
import Rating from './rating';
import Role from './role';
import Sale from './sale';
import User from './user';
import UserMeta from './userMeta';
import ViewArea from './viewArea';
import './triggers';

// Company Relations
Company.hasMany(CompanyMeta);
Company.belongsToMany(User, { through: CompanyUser });
Company.hasMany(DeliveryArea);
Company.hasMany(ViewArea);
Company.belongsToMany(PaymentMethod, { through: CompanyPaymentMethod });
Company.belongsToMany(User, { through: CompanyUser });
Company.belongsTo(CompanyType);
CompanyType.hasMany(Company);
Company.belongsTo(Address);

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