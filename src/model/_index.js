/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 */

import Address from './address';
import Campaign from './campaign';
import Category from './category';
import Company from './company';
import CompanyMeta from './companyMeta';
import CompanyPaymentMethod from './companyPaymentMethod';
import CompanyType from './companyType';
import CompanyUser from './companyUser';
import CreditBalance from './creditBalance';
import CreditHistory from './creditHistory';
import DeliveryArea from './deliveryArea';
import Options from './option';
import OptionsGroup from './OptionsGroup';
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

import './triggers';

// Company Relations
Company.hasMany(CompanyMeta);
Company.belongsToMany(User, { through: CompanyUser });
Company.hasMany(DeliveryArea);
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
Product.hasOne(OrderProduct);
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

// Campaign relations
Campaign.belongsToMany(Product, { through: 'campaign_products' });
Product.belongsToMany(Campaign, { through: 'campaign_products' });
Campaign.belongsToMany(Company, { through: 'campaign_companies' });
Company.belongsToMany(Campaign, { through: 'campaign_companies' });
Campaign.belongsToMany(User, { through: 'campaign_users' });
User.belongsToMany(Campaign, { through: 'campaign_users' });

// favorites
User.belongsToMany(Product, { through: 'favorite_products', as: 'favoriteProducts' });
Product.belongsToMany(User, { through: 'favorite_products', as: 'favoritedBy' });

// Sales relations
Sale.belongsTo(Product);
Product.hasMany(Sale);