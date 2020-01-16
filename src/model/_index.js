/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 * Esse arquivo roda a partir do setup.js
 */

import Campaign from './campaign';
import Category  from './category';
import Company  from './company';
import CompanyMeta  from './companyMeta';
import CompanyPaymentMethod  from './companyPaymentMethod';
import CompanyUser  from './companyUser';
import Coupon from './coupon';
import DeliveryArea  from './deliveryArea';
import Options  from './option';
import OptionGroup  from './optionGroup';
import Order  from './order';
import OrderOption  from './orderOption';
import OrderOptionGroup  from './orderOptionGroup';
import OrderProduct  from './orderProduct';
import PaymentMethod  from './paymentMethod';
import Product  from './product';
import Role  from './role';
import User  from './user';
import UserMeta  from './userMeta';

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
Product.hasMany(OptionGroup);

//OptionGroup relations
OptionGroup.hasMany(Options);
OptionGroup.belongsTo(OptionGroup, { foreignKey: 'maxSelectRestrain', as: 'groupRestrained' });
OptionGroup.hasOne(OptionGroup, { foreignKey: 'maxSelectRestrain', as: 'restrainedBy' });
OptionGroup.belongsTo(Product);

//Options relations
Options.belongsTo(OptionGroup);

//Order relations
Order.belongsTo(User);
Order.belongsTo(Company);
Order.hasMany(OrderProduct, { as: 'products' });
OrderProduct.hasMany(OrderOptionGroup, { as: 'optionGroups', onDelete: 'cascade' });
OrderOptionGroup.hasMany(OrderOption, { as: 'options', onDelete: 'cascade' });
Order.belongsTo(PaymentMethod);

OrderProduct.belongsTo(Product, { as: 'productRelated' });
OrderOptionGroup.belongsTo(OptionGroup, { as: 'optionGroupRelated' });
OrderOption.belongsTo(Options, { as: 'optionRelated' });

// coupon relations
Order.belongsTo(Coupon);
Coupon.hasMany(Order);
Coupon.belongsToMany(Product, { through: 'product_coupons' });
Product.belongsToMany(Coupon, { through: 'product_coupons' });
Coupon.belongsToMany(Company, { through: 'company_coupons' });
Company.belongsToMany(Coupon, { through: 'company_coupons' });

// campaign relations
Campaign.belongsTo(Product);
Product.hasOne(Campaign);