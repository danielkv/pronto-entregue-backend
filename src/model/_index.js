/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 * Esse arquivo roda a partir do setup.js
 */

import Campaign from './campaign';
import Category from './category';
import Company from './company';
import CompanyMeta from './companyMeta';
import CompanyPaymentMethod from './companyPaymentMethod';
import CompanyUser from './companyUser';
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
import User from './user';
import UserMeta from './userMeta';

// Company Relations
Company.hasMany(CompanyMeta);
Company.belongsToMany(User, { through: CompanyUser });
Company.hasMany(Order);
Company.hasMany(Product);
Company.hasMany(DeliveryArea);
Company.belongsToMany(PaymentMethod, { through: CompanyPaymentMethod });
Company.belongsToMany(User, { through: CompanyUser });

// Role relations
Role.hasMany(CompanyUser);
CompanyUser.belongsTo(Role);

// PaymentMethod
PaymentMethod.belongsToMany(Company, { through: CompanyPaymentMethod });

// User relations
User.hasMany(UserMeta);
User.hasMany(Order);
User.belongsToMany(Company, { through: CompanyUser });

//UserMeta
UserMeta.belongsTo(User);

//Category relations
Category.hasMany(Product);

//Product relations
Product.belongsTo(Category);
Product.belongsTo(Company);
Product.hasOne(OrderProduct);
Product.hasMany(OptionsGroup);

//OptionsGroup relations
OptionsGroup.hasMany(Options);
OptionsGroup.belongsTo(OptionsGroup, { foreignKey: 'maxSelectRestrain', as: 'groupRestrained' });
OptionsGroup.hasOne(OptionsGroup, { foreignKey: 'maxSelectRestrain', as: 'restrainedBy' });
OptionsGroup.belongsTo(Product);

//Options relations
Options.belongsTo(OptionsGroup);

//Order relations
Order.belongsTo(User);
Order.belongsTo(Company);
Order.hasMany(OrderProduct, { as: 'products' });
OrderProduct.hasMany(orderOptionsGroup, { as: 'optionsGroups', onDelete: 'cascade' });
orderOptionsGroup.hasMany(OrderOptions, { as: 'options', onDelete: 'cascade' });
Order.belongsTo(PaymentMethod);

OrderProduct.belongsTo(Product, { as: 'productRelated' });
orderOptionsGroup.belongsTo(OptionsGroup, { as: 'optionsGroupRelated' });
OrderOptions.belongsTo(Options, { as: 'optionRelated' });

// campaign relations
Campaign.belongsToMany(Product, { through: 'campaign_products' });
Product.belongsToMany(Campaign, { through: 'campaign_products' });
Campaign.belongsToMany(Company, { through: 'campaign_companies' });
Company.belongsToMany(Campaign, { through: 'campaign_companies' });
Campaign.belongsToMany(User, { through: 'campaign_users' });
User.belongsToMany(Campaign, { through: 'campaign_users' });

// campaign relations
Rating.belongsTo(Product);
Product.hasMany(Rating);
Rating.belongsTo(User);
User.hasMany(Rating);

// favorites
User.belongsToMany(Product, { through: 'favorite_products', as: 'favoriteProducts' });
Product.belongsToMany(User, { through: 'favorite_products', as: 'favoritedBy' });