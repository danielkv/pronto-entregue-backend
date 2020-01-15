/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 * Esse arquivo roda a partir do setup.js
 */

import Branch  from './branch';
import BranchMeta  from './branchMeta';
import BranchPaymentMethod  from './branchPaymentMethod';
import BranchUsers  from './branchUser';
import Category  from './category';
import Company  from './company';
import CompanyMeta  from './companyMeta';
import CompanyUser  from './companyUser';
import DeliveryArea  from './deliveryArea';
import Options  from './option';
import OptionsGroups  from './optionGroup';
import Order  from './order';
import OrderOption  from './orderOption';
import OrderOptionGroup  from './orderOptionGroup';
import OrderProduct  from './orderProduct';
import PaymentMethod  from './paymentMethod';
import Product  from './product';
import Role  from './role';
import User  from './user';
import UserMeta  from './userMeta';

//Company Relations
Company.hasMany(Branch);
Company.hasMany(CompanyMeta);
Company.belongsToMany(User, { through: CompanyUser });

//Role relations
Role.hasMany(BranchUsers);

//Branch Relations
Branch.hasMany(BranchMeta);
Branch.hasMany(Order);
Branch.hasMany(DeliveryArea);
Branch.hasMany(Category);
Branch.belongsToMany(PaymentMethod, { through: BranchPaymentMethod });
Branch.belongsToMany(User, { through: BranchUsers });

//BranchUsers relations
BranchUsers.belongsTo(Role);

//PaymentMethod
PaymentMethod.belongsToMany(Branch, { through: BranchPaymentMethod });

//User relations
User.hasMany(UserMeta);
User.hasMany(Order);
User.belongsToMany(Company, { through: CompanyUser });
User.belongsToMany(Branch, { through: BranchUsers });

//UserMeta
UserMeta.belongsTo(User);

//Category relations
Category.belongsTo(Branch);
Category.hasMany(Product,);

//Product relations
Product.belongsTo(Category);
//Product.belongsTo(Branch, {foreignKey: companyId'});
Product.hasOne(OrderProduct);
Product.hasMany(OptionsGroups);

//OptionsGroups relations
OptionsGroups.hasMany(Options);
OptionsGroups.belongsTo(OptionsGroups, { foreignKey: 'maxSelectRestrain', as: 'groupRestrained' });
OptionsGroups.hasOne(OptionsGroups, { foreignKey: 'maxSelectRestrain', as: 'restrainedBy' });
OptionsGroups.belongsTo(Product);

//Options relations
Options.belongsTo(OptionsGroups);

//Order relations
Order.belongsTo(User);
Order.belongsTo(Branch);
Order.hasMany(OrderProduct, { as: 'products' });
OrderProduct.hasMany(OrderOptionGroup, { as: 'optionGroups', onDelete: 'cascade' });
OrderOptionGroup.hasMany(OrderOption, { as: 'options', onDelete: 'cascade' });
Order.belongsTo(PaymentMethod);

OrderProduct.belongsTo(Product, { as: 'productRelated' });
OrderOptionGroup.belongsTo(OptionsGroups, { as: 'optionGroupRelated' });
OrderOption.belongsTo(Options, { as: 'optionRelated' });